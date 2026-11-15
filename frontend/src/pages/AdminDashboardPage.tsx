import { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router';

import Toast from '../components/Toast';
import { useAuthStore } from '../features/auth/store';
import { useArticleStore, slugify } from '../features/news/store';
import type { Article, ArticleInput } from '../features/news/types';
import { ORDER_STATUS_LABELS as statusLabels } from '../features/orders/constants';
import { useOrderStore } from '../features/orders/store';
import type { Order, OrderStatus } from '../features/orders/types';
import { useProductStore } from '../features/products/store';
import type { Product, ProductInput } from '../features/products/types';
import { getMockProductImages, getProductPrimaryImage } from '../features/products/utils';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')} đ`;

const categories = ['Bàn phím', 'Chuột', 'Màn hình', 'Tai nghe'];

const parseImageUrls = (raw: string): string[] =>
  raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const isValidImageSource = (value: string): boolean =>
  value.startsWith('http://') ||
  value.startsWith('https://') ||
  value.startsWith('data:image/') ||
  value.startsWith('/');

const isValidHttpUrl = isValidImageSource;

const escapeCsvField = (value: string | number): string =>
  `"${String(value).replace(/"/g, '""')}"`;

interface ProductFormErrors {
  name?: string;
  category?: string;
  price?: string;
  stockQuantity?: string;
  images?: string;
  specs?: string;
  desc?: string;
}

export default function AdminDashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const { orders, updateStatus, approveRefund, rejectRefund } = useOrderStore();
  const { products, addProduct, updateProduct, deleteProduct, resetProducts, restockProducts } = useProductStore();
  const {
    articles,
    addArticle,
    updateArticle,
    deleteArticle,
    fetchArticles: fetchArticlesStore,
  } = useArticleStore();

  useEffect(() => {
    fetchArticlesStore();
  }, [fetchArticlesStore]);

  const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'articles'>('analytics');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Tất cả');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Article CRUD States
  const [articleSearch, setArticleSearch] = useState('');
  const [selectedArticleCategoryFilter, setSelectedArticleCategoryFilter] = useState('Tất cả');
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<Article | null>(null);
  const [isSavingArticle, setIsSavingArticle] = useState(false);
  const [isUploadingArticleImg, setIsUploadingArticleImg] = useState(false);
  const [articleUploadProgress, setArticleUploadProgress] = useState<string | null>(null);
  const articleFileInputRef = useRef<HTMLInputElement>(null);

  // Article Form Fields
  const [formArticleTitle, setFormArticleTitle] = useState('');
  const [formArticleSlug, setFormArticleSlug] = useState('');
  const [formArticleCategory, setFormArticleCategory] = useState('Đánh giá');
  const [formArticleAuthor, setFormArticleAuthor] = useState('TechGear Editorial');
  const [formArticlePublishedAt, setFormArticlePublishedAt] = useState('');
  const [formArticleExcerpt, setFormArticleExcerpt] = useState('');
  const [formArticleContent, setFormArticleContent] = useState('');
  const [formArticleImageUrl, setFormArticleImageUrl] = useState('');

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      const matchCat =
        selectedArticleCategoryFilter === 'Tất cả' || a.category === selectedArticleCategoryFilter;
      const q = articleSearch.toLowerCase().trim();
      const matchQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.author.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [articles, selectedArticleCategoryFilter, articleSearch]);

  const handleOpenAddArticleModal = () => {
    setEditingArticle(null);
    setFormArticleTitle('');
    setFormArticleSlug('');
    setFormArticleCategory('Đánh giá');
    setFormArticleAuthor('TechGear Editorial');
    setFormArticlePublishedAt(new Date().toISOString().split('T')[0]);
    setFormArticleExcerpt('');
    setFormArticleContent('');
    setFormArticleImageUrl(
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
    );
    setIsArticleModalOpen(true);
  };

  const handleOpenEditArticleModal = (article: Article) => {
    setEditingArticle(article);
    setFormArticleTitle(article.title);
    setFormArticleSlug(article.slug);
    setFormArticleCategory(article.category);
    setFormArticleAuthor(article.author || 'TechGear Editorial');
    setFormArticlePublishedAt(article.published_at || new Date().toISOString().split('T')[0]);
    setFormArticleExcerpt(article.excerpt);
    setFormArticleContent(article.content);
    setFormArticleImageUrl(article.image_url || article.coverImage || '');
    setIsArticleModalOpen(true);
  };

  const handleArticleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setToastMessage('⚠️ Vui lòng chọn tệp hình ảnh (PNG, JPG, WEBP).');
      return;
    }

    setIsUploadingArticleImg(true);
    setArticleUploadProgress('Đang tải ảnh bài viết...');
    let uploadedUrl = '';

    if (isSupabaseConfigured()) {
      try {
        const fileExt = file.name.split('.').pop() || 'png';
        const cleanFileName = `articles/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(cleanFileName, file, { cacheControl: '3600', upsert: false });

        if (!error && data?.path) {
          const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(data.path);
          uploadedUrl = publicUrlData.publicUrl;
        }
      } catch {
        // Fallback
      }
    }

    if (!uploadedUrl) {
      uploadedUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(file);
      });
    }

    if (uploadedUrl) {
      setFormArticleImageUrl(uploadedUrl);
      setToastMessage('✓ Đã tải ảnh bài viết lên thành công!');
    }

    setIsUploadingArticleImg(false);
    setArticleUploadProgress(null);
    if (articleFileInputRef.current) {
      articleFileInputRef.current.value = '';
    }
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formArticleTitle.trim() || !formArticleContent.trim()) {
      setToastMessage('⚠️ Tiêu đề và nội dung bài viết không được để trống.');
      return;
    }

    setIsSavingArticle(true);
    try {
      const input: ArticleInput = {
        title: formArticleTitle.trim(),
        slug: formArticleSlug.trim() || slugify(formArticleTitle.trim()),
        category: formArticleCategory.trim(),
        author: formArticleAuthor.trim() || 'TechGear Editorial',
        published_at: formArticlePublishedAt || new Date().toISOString().split('T')[0],
        excerpt: formArticleExcerpt.trim() || formArticleTitle.trim(),
        content: formArticleContent.trim(),
        image_url:
          formArticleImageUrl.trim() ||
          'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
      };

      if (editingArticle) {
        await updateArticle(editingArticle.id, input);
        setToastMessage(`✓ Đã cập nhật bài viết "${input.title}" thành công!`);
      } else {
        await addArticle(input);
        setToastMessage(`✓ Đã thêm bài viết mới "${input.title}" thành công!`);
      }
      setIsArticleModalOpen(false);
    } catch (err) {
      setToastMessage(`⚠️ Lỗi khi lưu bài viết: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSavingArticle(false);
    }
  };

  const handleConfirmDeleteArticle = async () => {
    if (!deletingArticle) return;
    try {
      await deleteArticle(deletingArticle.id);
      setToastMessage(`✓ Đã xóa bài viết "${deletingArticle.title}" thành công.`);
      setDeletingArticle(null);
    } catch (err) {
      setToastMessage(`⚠️ Lỗi khi xóa bài viết: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Bàn phím');
  const [formSegment, setFormSegment] = useState<'gaming' | 'office'>('gaming');
  const [formSoftwareId, setFormSoftwareId] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formImagesText, setFormImagesText] = useState('');
  const [formSpecs, setFormSpecs] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIsFlashSale, setFormIsFlashSale] = useState(false);
  const [formBadge, setFormBadge] = useState('');
  const [formErrors, setFormErrors] = useState<ProductFormErrors>({});

  // Manual Image Upload States
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showManualUrlTextarea, setShowManualUrlTextarea] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validPreviewUrls = useMemo(
    () => parseImageUrls(formImagesText).filter(isValidHttpUrl),
    [formImagesText],
  );

  // 1. Analytics Computations
  const totalRevenue = useMemo(() => {
    return orders
      .filter((order) => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total, 0);
  }, [orders]);

  const completedRevenue = useMemo(() => {
    return orders
      .filter((order) => order.status === 'completed' || order.status === 'confirmed')
      .reduce((sum, order) => sum + order.total, 0);
  }, [orders]);

  const pendingCount = useMemo(
    () => orders.filter((order) => order.status === 'pending').length,
    [orders],
  );

  const confirmedCount = useMemo(
    () => orders.filter((order) => order.status === 'confirmed').length,
    [orders],
  );

  const completedCount = useMemo(
    () => orders.filter((order) => order.status === 'completed').length,
    [orders],
  );

  const shippingCount = useMemo(
    () => orders.filter((order) => order.status === 'shipping').length,
    [orders],
  );

  const cancelledCount = useMemo(
    () => orders.filter((order) => order.status === 'cancelled').length,
    [orders],
  );

  const returnRequestedCount = useMemo(
    () => orders.filter((order) => order.status === 'return_requested').length,
    [orders],
  );

  const refundedCount = useMemo(
    () => orders.filter((order) => order.status === 'refunded').length,
    [orders],
  );

  const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | OrderStatus>('all');

  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'all') return orders;
    return orders.filter((order) => order.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  const handleOrderStatusChange = (orderId: string, newStatus: OrderStatus) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    let resolvedTracking = targetOrder?.trackingCode;
    const resolvedCarrier = targetOrder?.shippingCarrier || 'Giao Hàng Nhanh';

    if (newStatus === 'shipping') {
      if (!resolvedTracking) {
        const cleanId = orderId.replace(/^TG-/, '').replace(/[^A-Z0-9]/gi, '');
        resolvedTracking = `TG-SHIP-${cleanId || Math.floor(100000 + Math.random() * 900000)}`;
      }
      updateStatus(orderId, newStatus, resolvedTracking, resolvedCarrier);

      if (isSupabaseConfigured()) {
        void supabase
          .from('orders')
          .update({
            status: newStatus,
            tracking_code: resolvedTracking,
            shipping_carrier: resolvedCarrier,
          })
          .eq('id', orderId);
      }

      setToastMessage(
        `🚚 Đã chuyển đơn hàng ${orderId} sang "Đang vận chuyển" (Mã vận đơn: ${resolvedTracking} - ${resolvedCarrier}).`,
      );
    } else {
      updateStatus(orderId, newStatus);

      if (isSupabaseConfigured()) {
        void supabase
          .from('orders')
          .update({
            status: newStatus,
          })
          .eq('id', orderId);
      }

      setToastMessage(
        `✓ Đã cập nhật trạng thái đơn ${orderId} sang "${statusLabels[newStatus] || newStatus}".`,
      );
    }
  };

  const handleApproveRefund = async (order: Order) => {
    const adminNote = `Đã duyệt hoàn trả tiền ${formatPrice(order.total)} vào tài khoản khách hàng.`;
    approveRefund(order.id, adminNote);

    // Tự động cộng lại số lượng vào kho hàng
    const restockItems = order.items.map((it) => ({
      productId: it.product.id,
      quantity: it.quantity,
    }));
    await restockProducts(restockItems);

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('orders')
          .update({
            status: 'refunded',
            admin_refund_note: adminNote,
          })
          .eq('id', order.id);
      } catch (err) {
        console.warn('Could not sync approve refund to Supabase:', err);
      }
    }

    const totalQty = order.items.reduce((s: number, it) => s + it.quantity, 0);
    setToastMessage(
      `✅ Đã duyệt hoàn tiền đơn ${order.id} và tự động cộng lại +${totalQty} sản phẩm vào kho hàng thành công!`,
    );
  };

  const handleRejectRefund = async (order: Order) => {
    const reason = window.prompt(
      `Nhập lý do từ chối hoàn trả cho đơn hàng ${order.id}:`,
      'Sản phẩm không đáp ứng điều kiện hoàn trả (đã quá thời hạn 30 ngày hoặc không còn nguyên tem/seal bảo hành).',
    );
    if (reason === null) return;

    const trimmedReason = reason.trim() || 'Cửa hàng từ chối yêu cầu hoàn trả.';
    rejectRefund(order.id, trimmedReason);

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('orders')
          .update({
            status: 'completed',
            admin_refund_note: trimmedReason,
          })
          .eq('id', order.id);
      } catch (err) {
        console.warn('Could not sync reject refund to Supabase:', err);
      }
    }

    setToastMessage(`❌ Đã từ chối hoàn trả đơn ${order.id} (chuyển về trạng thái Đã giao hàng).`);
  };

  const totalStockUnits = useMemo(
    () => products.reduce((sum, p) => sum + p.stockQuantity, 0),
    [products],
  );

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.stockQuantity <= 5),
    [products],
  );

  // Category Revenue Structure
  const categoryRevenueStats = useMemo(() => {
    const stats: Record<string, { total: number; count: number }> = {
      'Bàn phím': { total: 0, count: 0 },
      'Chuột': { total: 0, count: 0 },
      'Màn hình': { total: 0, count: 0 },
      'Tai nghe': { total: 0, count: 0 },
    };

    for (const order of orders) {
      for (const item of order.items) {
        const cat = item.product.category;
        const subtotal = item.product.price * item.quantity;
        if (stats[cat]) {
          stats[cat].total += subtotal;
          stats[cat].count += item.quantity;
        } else {
          stats[cat] = { total: subtotal, count: item.quantity };
        }
      }
    }

    const grandTotal = Object.values(stats).reduce((acc, curr) => acc + curr.total, 0) || 1;

    return Object.entries(stats).map(([name, data]) => ({
      name,
      total: data.total,
      count: data.count,
      percent: Math.round((data.total / grandTotal) * 100),
    }));
  }, [orders]);

  // Filtered Products for CRUD table
  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    const cat = selectedCategoryFilter.trim().toLowerCase();

    return products.filter((p) => {
      const matchQuery = !q || p.name.toLowerCase().includes(q) || String(p.id).includes(q);
      const matchCat = !cat || cat === 'tất cả' || p.category.toLowerCase() === cat;
      return matchQuery && matchCat;
    });
  }, [products, productSearch, selectedCategoryFilter]);

  // Modal Handlers
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Bàn phím');
    setFormSegment('gaming');
    setFormSoftwareId('');
    setFormPrice('');
    setFormOriginalPrice('');
    setFormStock('15');
    setFormImagesText('');
    setShowManualUrlTextarea(false);
    setIsUploadingImage(false);
    setUploadProgress(null);
    setFormSpecs('');
    setFormDesc('');
    setFormIsFlashSale(false);
    setFormBadge('');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormSegment(product.segment ?? 'gaming');
    setFormSoftwareId(product.softwareId ?? '');
    setFormPrice(String(product.price));
    setFormOriginalPrice(product.originalPrice ? String(product.originalPrice) : '');
    setFormStock(String(product.stockQuantity));
    setFormImagesText(product.images.join('\n'));
    setShowManualUrlTextarea(false);
    setIsUploadingImage(false);
    setUploadProgress(null);
    setFormSpecs(product.specs);
    setFormDesc(product.desc);
    setFormIsFlashSale(Boolean(product.isFlashSale));
    setFormBadge(product.badge ?? '');
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        imageFiles.push(file);
      }
    }

    if (imageFiles.length === 0) {
      setToastMessage('⚠️ Vui lòng chỉ chọn các tệp hình ảnh (PNG, JPG, WEBP, GIF).');
      return;
    }

    setIsUploadingImage(true);
    setUploadProgress(`Đang tải lên ${imageFiles.length} ảnh...`);

    const uploadedUrls: string[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      setUploadProgress(`Đang xử lý ảnh (${i + 1}/${imageFiles.length})...`);
      let uploadedUrl = '';

      if (isSupabaseConfigured()) {
        try {
          const fileExt = file.name.split('.').pop() || 'png';
          const cleanFileName = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
          const { data, error } = await supabase.storage
            .from('product-images')
            .upload(cleanFileName, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (!error && data?.path) {
            const { data: publicUrlData } = supabase.storage
              .from('product-images')
              .getPublicUrl(data.path);
            uploadedUrl = publicUrlData.publicUrl;
          }
        } catch {
          // Fallback to data URL
        }
      }

      if (!uploadedUrl) {
        // Fallback to Base64 Data URL so it is 100% reliable locally and works immediately
        uploadedUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      }

      if (uploadedUrl) {
        uploadedUrls.push(uploadedUrl);
      }
    }

    if (uploadedUrls.length > 0) {
      const currentList = parseImageUrls(formImagesText);
      const updatedList = [...currentList, ...uploadedUrls];
      setFormImagesText(updatedList.join('\n'));
      setFormErrors((prev) => ({ ...prev, images: undefined }));
      setToastMessage(`✓ Đã thêm ${uploadedUrls.length} ảnh vào sản phẩm!`);
    }

    setIsUploadingImage(false);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSetPrimaryImage = (index: number) => {
    const currentList = parseImageUrls(formImagesText);
    if (index > 0 && index < currentList.length) {
      const target = currentList[index];
      const remaining = currentList.filter((_, idx) => idx !== index);
      const updated = [target, ...remaining];
      setFormImagesText(updated.join('\n'));
      setToastMessage('✓ Đã đặt làm ảnh đại diện chính!');
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentList = parseImageUrls(formImagesText);
    const updated = currentList.filter((_, idx) => idx !== index);
    setFormImagesText(updated.join('\n'));
    setToastMessage('✓ Đã xóa ảnh khỏi danh sách.');
  };

  const validateForm = (): boolean => {
    const errors: ProductFormErrors = {};

    if (!formName.trim() || formName.trim().length < 3) {
      errors.name = 'Tên sản phẩm phải có tối thiểu 3 ký tự.';
    }

    if (!formCategory.trim()) {
      errors.category = 'Vui lòng chọn danh mục hợp lệ.';
    }

    const priceNum = Number(formPrice);
    if (!formPrice.trim() || Number.isNaN(priceNum) || priceNum <= 0) {
      errors.price = 'Giá bán phải là số dương lớn hơn 0.';
    }

    const stockNum = Number(formStock);
    if (!formStock.trim() || Number.isNaN(stockNum) || stockNum < 0 || !Number.isInteger(stockNum)) {
      errors.stockQuantity = 'Số lượng tồn kho phải là số nguyên không âm (≥ 0).';
    }

    const parsedImages = parseImageUrls(formImagesText);
    if (parsedImages.length === 0 || !parsedImages.every(isValidHttpUrl)) {
      errors.images = 'Vui lòng tải ảnh lên từ máy tính hoặc nhập ít nhất 1 đường dẫn ảnh hợp lệ.';
    }

    if (!formSpecs.trim()) {
      errors.specs = 'Vui lòng nhập thông số kỹ thuật nổi bật.';
    }

    if (!formDesc.trim()) {
      errors.desc = 'Vui lòng nhập mô tả chi tiết sản phẩm.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSavingProduct) return;

    setIsSavingProduct(true);
    try {
      const price = Number(formPrice);
      const originalPrice = formOriginalPrice.trim() ? Number(formOriginalPrice) : undefined;
      const stockQuantity = Number(formStock);
      const discountPercent =
        originalPrice && originalPrice > price
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : undefined;

      const productPayload: ProductInput = {
        name: formName.trim(),
        segment: formSegment,
        category: formCategory.trim(),
        price,
        originalPrice,
        discountPercent,
        stockQuantity,
        inStock: stockQuantity > 0,
        images: parseImageUrls(formImagesText),
        specs: formSpecs.trim(),
        desc: formDesc.trim(),
        isFlashSale: formIsFlashSale,
        badge: formBadge.trim() ? formBadge.trim() : undefined,
        softwareId: formSoftwareId.trim() ? formSoftwareId.trim() : undefined,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productPayload);
        setToastMessage(`✓ Đã cập nhật sản phẩm "${productPayload.name}" trên Supabase thành công!`);
      } else {
        const created = await addProduct(productPayload);
        setToastMessage(`✓ Đã thêm mới "${created.name}" (ID #${created.id}) trực tiếp vào Supabase thành công!`);
      }

      setIsFormModalOpen(false);
    } catch (err) {
      setToastMessage(`⚠️ Lỗi khi lưu sản phẩm: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    const targetName = deletingProduct.name;
    try {
      await deleteProduct(deletingProduct.id);
      setToastMessage(`✓ Đã xóa sản phẩm "${targetName}" khỏi hệ thống & Supabase.`);
    } catch (err) {
      setToastMessage(`⚠️ Lỗi khi xóa sản phẩm: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setDeletingProduct(null);
    }
  };

  const handleResetData = () => {
    if (window.confirm('Khôi phục danh sách sản phẩm về cài đặt gốc ban đầu?')) {
      resetProducts();
      setToastMessage('Đã khôi phục dữ liệu sản phẩm gốc thành công.');
    }
  };

  const handleExportOrdersCsv = () => {
    if (orders.length === 0) return;

    const headers = [
      'Mã đơn',
      'Ngày đặt',
      'Khách hàng',
      'Số điện thoại',
      'Địa chỉ giao hàng',
      'Ghi chú đơn hàng',
      'Danh sách sản phẩm',
      'Tổng tiền (VNĐ)',
      'Phương thức thanh toán',
      'Trạng thái đơn',
    ];

    const rows = orders.map((order) => {
      const createdAtText = new Date(order.createdAt).toLocaleString('vi-VN');
      const itemsText = order.items
        .map(
          (item) =>
            `${item.product.name} (SL: ${item.quantity}, Đơn giá: ${formatPrice(item.product.price)})`,
        )
        .join('; ');
      const paymentText =
        order.paymentMethod === 'vietqr'
          ? 'VietQR (Chuyển khoản)'
          : 'COD (Thanh toán khi nhận hàng)';
      const statusText = statusLabels[order.status] ?? order.status;
      const noteText = order.shipping.note?.trim() || 'Không có ghi chú';

      return [
        order.id,
        createdAtText,
        order.shipping.name,
        order.shipping.phone,
        order.shipping.address,
        noteText,
        itemsText,
        order.total,
        paymentText,
        statusText,
      ]
        .map(escapeCsvField)
        .join(',');
    });

    const csvContent = `\uFEFF${[headers.map(escapeCsvField).join(','), ...rows].join('\r\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'danh-sach-don-hang.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-page-wolf w-full overflow-x-hidden">
      <div className="container max-w-[1220px] mx-auto px-4 sm:px-6 overflow-x-hidden">
        {/* Admin Header */}
        <div className="admin-header-card shadow-sm">
          <div className="admin-welcome-info">
            <span className="section-eyebrow">HỆ THỐNG QUẢN TRỊ TRUNG TÂM</span>
            <h1 className="admin-title">Bảng Điều Khiển TechGear, {user?.name} 👋</h1>
            <p className="admin-sub">
              Giám sát doanh thu trực tuyến, xử lý đơn đặt hàng và quản lý kho hàng thời gian thực.
            </p>
          </div>
          <div className="admin-actions-group">
            <Link className="btn-wolf-outline" to="/">
              🏪 Xem trang khách hàng
            </Link>
            <button className="btn-wolf-secondary" onClick={logout}>
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="admin-tabs-nav">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Thống Kê & Đơn Hàng ({orders.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 Quản Lý Sản Phẩm CRUD ({products.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            📰 Quản Lý Bài Viết ({articles.length})
          </button>
        </div>

        {/* TAB 1: ANALYTICS & ORDERS */}
        {activeTab === 'analytics' && (
          <div className="admin-tab-content">
            {/* 4 Stats Cards */}
            <div className="admin-stats-grid">
              {/* Card 1: Revenue */}
              <div className="stat-card-wolf shadow-sm">
                <div className="stat-icon-wrap revenue">💰</div>
                <div className="stat-content">
                  <span className="stat-label">Tổng doanh thu đơn hàng</span>
                  <strong className="stat-value">{formatPrice(totalRevenue)}</strong>
                  <small className="stat-hint">
                    Đã thanh toán / Hoàn thành: <strong>{formatPrice(completedRevenue)}</strong>
                  </small>
                </div>
              </div>

              {/* Card 2: Orders Count Breakdown */}
              <div className="stat-card-wolf shadow-sm">
                <div className="stat-icon-wrap">📋</div>
                <div className="stat-content">
                  <span className="stat-label">Tổng số đơn hàng</span>
                  <strong className="stat-value">{orders.length} đơn</strong>
                  <div className="order-status-mini-pills">
                    <span className="pill-status-count pending" title="Chờ xác nhận">
                      ⏳ {pendingCount} Chờ xác nhận
                    </span>
                    <span className="pill-status-count shipping" title="Đang vận chuyển">
                      🚚 {shippingCount} Đang giao
                    </span>
                    <span className="pill-status-count completed" title="Đã giao hàng">
                      ✓ {completedCount} Đã giao
                    </span>
                    {returnRequestedCount > 0 && (
                      <span className="pill-status-count return-requested" title="Yêu cầu hoàn trả">
                        ↩️ {returnRequestedCount} Yêu cầu trả
                      </span>
                    )}
                    {refundedCount > 0 && (
                      <span className="pill-status-count refunded" title="Đã hoàn tiền">
                        💰 {refundedCount} Đã hoàn tiền
                      </span>
                    )}
                    {cancelledCount > 0 && (
                      <span className="pill-status-count cancelled" title="Đã hủy">
                        ✕ {cancelledCount} Đã hủy
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 3: Shipping Orders (Đang vận chuyển) */}
              <div className="stat-card-wolf shadow-sm">
                <div className="stat-icon-wrap shipping">🚚</div>
                <div className="stat-content">
                  <span className="stat-label">Đang vận chuyển</span>
                  <strong className="stat-value">{shippingCount} đơn</strong>
                  <small className="stat-hint">
                    Mã vận đơn tự động qua Giao Hàng Nhanh
                  </small>
                </div>
              </div>

              {/* Card 4: Return & Refund Requests */}
              <div className="stat-card-wolf shadow-sm">
                <div className="stat-icon-wrap return-requested">↩️</div>
                <div className="stat-content">
                  <span className="stat-label">Yêu cầu hoàn trả</span>
                  <strong className="stat-value">{returnRequestedCount} đơn</strong>
                  <small className="stat-hint">
                    {returnRequestedCount > 0 ? '⚠️ Cần kiểm tra & duyệt hoàn tiền' : 'Không có yêu cầu chờ xử lý'}
                  </small>
                </div>
              </div>

              {/* Card 5: Stock Units */}
              <div className="stat-card-wolf shadow-sm">
                <div className="stat-icon-wrap in-stock">📦</div>
                <div className="stat-content">
                  <span className="stat-label">Tổng sản phẩm trong kho</span>
                  <strong className="stat-value">{products.length} mẫu gear</strong>
                  <small className="stat-hint">
                    Tổng tồn kho: <strong>{totalStockUnits} chiếc</strong>
                  </small>
                </div>
              </div>

              {/* Card 4: Low Stock Alert */}
              <div className="stat-card-wolf shadow-sm">
                <div className="stat-icon-wrap alert">⚠️</div>
                <div className="stat-content">
                  <span className="stat-label">Sắp hết hàng (Low stock ≤ 5)</span>
                  <strong className="stat-value alert-text">{lowStockProducts.length} sản phẩm</strong>
                  <small className="stat-hint">
                    Cần lên kế hoạch nhập hàng thêm
                  </small>
                </div>
              </div>
            </div>

            {/* Low Stock Warning Banner if any */}
            {lowStockProducts.length > 0 && (
              <div className="low-stock-alert-box shadow-sm mb-4">
                <div className="alert-box-header">
                  <span className="alert-badge">CẢNH BÁO TỒN KHO THẤP</span>
                  <span>Có {lowStockProducts.length} sản phẩm sắp hết hàng (tồn ≤ 5 món):</span>
                </div>
                <div className="low-stock-chips-row">
                  {lowStockProducts.map((p) => (
                    <div key={p.id} className="low-stock-chip">
                      <img src={getProductPrimaryImage(p)} alt={p.name} />
                      <span className="chip-name">{p.name}</span>
                      <strong className="chip-qty">Còn {p.stockQuantity} cái</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Revenue Structure by Category */}
            <div className="admin-category-revenue-card shadow-sm mb-4">
              <div className="table-card-head">
                <div>
                  <h2 className="card-title">Cơ Cấu Doanh Thu Theo Danh Mục Thiết Bị</h2>
                  <span className="table-sub">
                    Phân tích tỷ trọng doanh số giữa Bàn phím, Chuột, Màn hình và Tai nghe
                  </span>
                </div>
              </div>

              {/* Visual Multi-segment Progress Bar */}
              <div className="category-revenue-progress-bar">
                {categoryRevenueStats.map((item, index) => {
                  const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'];
                  return (
                    <div
                      key={item.name}
                      className="progress-segment"
                      style={{
                        width: `${Math.max(item.percent, 3)}%`,
                        backgroundColor: colors[index % colors.length],
                      }}
                      title={`${item.name}: ${item.percent}% (${formatPrice(item.total)})`}
                    />
                  );
                })}
              </div>

              {/* Category Breakdown Grid */}
              <div className="category-breakdown-grid">
                {categoryRevenueStats.map((item, index) => {
                  const colors = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'];
                  const icons: Record<string, string> = {
                    'Bàn phím': '⌨️',
                    'Chuột': '🖱️',
                    'Màn hình': '🖥️',
                    'Tai nghe': '🎧',
                  };
                  return (
                    <div key={item.name} className="cat-breakdown-item">
                      <div className="cat-breakdown-top">
                        <span className="cat-bullet" style={{ backgroundColor: colors[index % colors.length] }} />
                        <span className="cat-title-text">
                          {icons[item.name] ?? '📦'} {item.name}
                        </span>
                        <strong className="cat-percent">{item.percent}%</strong>
                      </div>
                      <div className="cat-breakdown-bottom">
                        <span className="cat-revenue-val">{formatPrice(item.total)}</span>
                        <small className="cat-qty-sold">{item.count} sản phẩm đã bán</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Orders List Table */}
            <div className="admin-table-card shadow-sm">
              <div className="table-card-head">
                <div>
                  <h2>Danh Sách Đơn Đặt Hàng ({filteredOrders.length}/{orders.length})</h2>
                  <span className="table-sub">Quản lý, xem chi tiết và cập nhật trạng thái đơn hàng trực tiếp</span>
                </div>
                <button
                  type="button"
                  className="btn-wolf-outline export-csv-btn"
                  onClick={handleExportOrdersCsv}
                  disabled={orders.length === 0}
                  title="Xuất danh sách đơn hàng ra file CSV tương thích Excel"
                >
                  📥 Xuất Excel
                </button>
              </div>

              {/* Order Status Filter Pills */}
              <div className="admin-order-filters-row">
                <button
                  type="button"
                  className={`admin-order-filter-pill ${orderStatusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setOrderStatusFilter('all')}
                >
                  Tất cả ({orders.length})
                </button>
                <button
                  type="button"
                  className={`admin-order-filter-pill pending ${orderStatusFilter === 'pending' ? 'active' : ''}`}
                  onClick={() => setOrderStatusFilter('pending')}
                >
                  ⏳ Chờ xác nhận ({pendingCount})
                </button>
                <button
                  type="button"
                  className={`admin-order-filter-pill shipping ${orderStatusFilter === 'shipping' ? 'active' : ''}`}
                  onClick={() => setOrderStatusFilter('shipping')}
                >
                  🚚 Đang vận chuyển ({shippingCount})
                </button>
                <button
                  type="button"
                  className={`admin-order-filter-pill completed ${orderStatusFilter === 'completed' ? 'active' : ''}`}
                  onClick={() => setOrderStatusFilter('completed')}
                >
                  ✓ Đã giao hàng ({completedCount})
                </button>
                <button
                  type="button"
                  className={`admin-order-filter-pill return-requested ${orderStatusFilter === 'return_requested' ? 'active' : ''}`}
                  onClick={() => setOrderStatusFilter('return_requested')}
                >
                  ↩️ Yêu cầu hoàn trả ({returnRequestedCount})
                </button>
                <button
                  type="button"
                  className={`admin-order-filter-pill refunded ${orderStatusFilter === 'refunded' ? 'active' : ''}`}
                  onClick={() => setOrderStatusFilter('refunded')}
                >
                  💰 Đã hoàn tiền ({refundedCount})
                </button>
                <button
                  type="button"
                  className={`admin-order-filter-pill cancelled ${orderStatusFilter === 'cancelled' ? 'active' : ''}`}
                  onClick={() => setOrderStatusFilter('cancelled')}
                >
                  ✕ Đã hủy ({cancelledCount})
                </button>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="empty-state-wolf compact">
                  <p>
                    {orders.length === 0
                      ? 'Chưa có đơn hàng nào được ghi nhận.'
                      : 'Không tìm thấy đơn hàng nào ở trạng thái này.'}
                  </p>
                </div>
              ) : (
                <div className="table-wrapper w-full overflow-x-auto rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
                  <table className="admin-table admin-orders-table w-full">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng & Địa chỉ</th>
                        <th>Sản phẩm đặt</th>
                        <th>Ngày tạo</th>
                        <th>Tổng tiền</th>
                        <th>Thanh toán</th>
                        <th>Trạng thái đơn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id}>
                          <td>
                            <button
                              type="button"
                              className="order-id-btn"
                              onClick={() => setSelectedOrderId(order.id)}
                              title={`Xem chi tiết đơn hàng ${order.id}`}
                            >
                              <strong className="order-id-code">{order.id}</strong>
                              <span className="order-view-hint" aria-hidden="true">👁️</span>
                            </button>
                            {order.status === 'shipping' && (
                              <div
                                className="order-tracking-cell-pill"
                                title={`Đơn vị: ${order.shippingCarrier || 'Giao Hàng Nhanh'}`}
                              >
                                <span>🚚 {order.trackingCode || `TG-SHIP-${order.id.replace(/^TG-/, '')}`}</span>
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="customer-info-cell">
                              <strong title={order.shipping.name}>{order.shipping.name}</strong>
                              <small>{order.shipping.phone}</small>
                              <small className="address-text" title={order.shipping.address}>
                                {order.shipping.address}
                              </small>
                              {order.status === 'return_requested' && (
                                <div className="admin-row-return-box" title={order.returnReason}>
                                  <span className="return-badge-text">↩️ Lý do:</span> {order.returnReason}
                                </div>
                              )}
                              {order.status === 'refunded' && (
                                <div className="admin-row-refunded-box">
                                  <span>💰 Đã hoàn tiền cho khách</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="order-items-mini-list">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="order-item-chip" title={item.product.name}>
                                  <span>{item.product.name}</span>
                                  <strong className="chip-badge">x{item.quantity}</strong>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <strong className="order-price">{formatPrice(order.total)}</strong>
                          </td>
                          <td>
                            <span className={`payment-pill ${order.paymentMethod}`}>
                              {order.paymentMethod === 'vietqr' ? 'VietQR' : 'COD'}
                            </span>
                          </td>
                          <td>
                            <select
                              className={`status-select ${order.status}`}
                              value={order.status}
                              onChange={(event) =>
                                handleOrderStatusChange(order.id, event.target.value as OrderStatus)
                              }
                              aria-label={`Trạng thái ${order.id}`}
                            >
                              {Object.entries(statusLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>

                            {order.status === 'return_requested' && (
                              <div className="admin-table-refund-actions">
                                <button
                                  type="button"
                                  className="btn-refund-approve-table"
                                  onClick={() => handleApproveRefund(order)}
                                  title="Duyệt hoàn tiền & tự động hoàn kho sản phẩm"
                                >
                                  ✅ Duyệt & Hoàn tiền
                                </button>
                                <button
                                  type="button"
                                  className="btn-refund-reject-table"
                                  onClick={() => handleRejectRefund(order)}
                                  title="Từ chối yêu cầu hoàn trả"
                                >
                                  ❌ Từ chối
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCT MANAGEMENT (CRUD) */}
        {activeTab === 'products' && (
          <div className="admin-tab-content">
            {/* Toolbar */}
            <div className="admin-product-toolbar shadow-sm">
              <div className="toolbar-left-group">
                {/* Search */}
                <div className="search-filter-input">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Tìm theo tên sản phẩm hoặc ID..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                  />
                  {productSearch && (
                    <button type="button" className="clear-search-btn" onClick={() => setProductSearch('')}>
                      ✕
                    </button>
                  )}
                </div>

                {/* Category filter */}
                <select
                  className="filter-select"
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                >
                  <option value="Tất cả">Danh mục: Tất cả</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="toolbar-actions-group">
                <button
                  type="button"
                  className="btn-wolf-primary"
                  onClick={handleOpenCreateModal}
                >
                  + Thêm sản phẩm mới
                </button>
                <button
                  type="button"
                  className="btn-wolf-outline"
                  onClick={handleResetData}
                  title="Khôi phục danh sách sản phẩm mẫu ban đầu"
                >
                  🔄 Khôi phục dữ liệu gốc
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="admin-table-card shadow-sm">
              <div className="table-card-head">
                <div>
                  <h2>Danh Sách Sản Phẩm Trong Cửa Hàng ({filteredProducts.length})</h2>
                  <span className="table-sub">Các thay đổi sẽ lập tức cập nhật ra trang chủ và trang sản phẩm</span>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="empty-state-wolf compact">
                  <p>Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
                </div>
              ) : (
                <div className="table-wrapper w-full overflow-x-auto rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
                  <table className="admin-table admin-products-table w-full">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th className="w-20" style={{ width: '80px' }}>Ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Danh mục</th>
                        <th>Giá bán</th>
                        <th>Tồn kho</th>
                        <th>Trạng thái</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const isLowStock = product.stockQuantity <= 5 && product.stockQuantity > 0;
                        const isOutOfStock = product.stockQuantity <= 0;

                        return (
                          <tr key={product.id}>
                            <td>
                              <span className="sku-badge">#{product.id}</span>
                            </td>
                            <td className="w-20" style={{ width: '80px' }}>
                              <img
                                src={getProductPrimaryImage(product)}
                                alt={product.name}
                                className="w-16 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                            </td>
                            <td>
                              <div className="product-title-cell">
                                <Link
                                  to={`/products/${product.id}`}
                                  className="product-table-name"
                                  title={product.name}
                                >
                                  {product.name}
                                </Link>
                                <small className="product-table-specs" title={product.specs}>
                                  {product.specs}
                                </small>
                              </div>
                            </td>
                            <td>
                              <span className="cat-table-badge">{product.category}</span>
                              <span
                                className={`cat-table-badge ${product.segment === 'gaming' ? 'gaming' : 'office'}`}
                                style={{ display: 'block', marginTop: '4px', fontSize: '0.72rem' }}
                              >
                                {product.segment === 'gaming' ? '🎮 Gaming' : '💼 Văn phòng'}
                              </span>
                            </td>
                            <td>
                              <div className="price-table-cell">
                                <strong>{formatPrice(product.price)}</strong>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <del>{formatPrice(product.originalPrice)}</del>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="stock-table-cell">
                                {isOutOfStock ? (
                                  <span className="stock-badge out-of-stock">Hết hàng (0)</span>
                                ) : isLowStock ? (
                                  <span className="stock-badge low-stock">
                                    ⚠️ Còn {product.stockQuantity} (Sắp hết)
                                  </span>
                                ) : (
                                  <span className="stock-badge in-stock">
                                    ✓ Còn {product.stockQuantity}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="product-status-badges">
                                {product.isFlashSale && <span className="status-chip flash">⚡ Flash</span>}
                                {product.badge && <span className="status-chip badge">{product.badge}</span>}
                                {!product.isFlashSale && !product.badge && (
                                  <span className="status-chip normal">Bình thường</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="table-actions-cell">
                                <button
                                  type="button"
                                  className="action-btn edit"
                                  onClick={() => handleOpenEditModal(product)}
                                  title="Chỉnh sửa sản phẩm"
                                >
                                  ✏️ Sửa
                                </button>
                                <button
                                  type="button"
                                  className="action-btn delete"
                                  onClick={() => setDeletingProduct(product)}
                                  title="Xóa sản phẩm"
                                >
                                  🗑️ Xóa
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ARTICLE MANAGEMENT (CRUD) */}
        {activeTab === 'articles' && (
          <div className="admin-tab-content">
            {/* Toolbar */}
            <div className="admin-product-toolbar shadow-sm">
              <div className="toolbar-left-group">
                {/* Search */}
                <div className="search-filter-input">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Tìm theo tiêu đề, tác giả..."
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    aria-label="Tìm kiếm bài viết"
                  />
                  {articleSearch && (
                    <button
                      type="button"
                      className="clear-search-btn"
                      onClick={() => setArticleSearch('')}
                      aria-label="Xóa từ khóa"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <select
                  className="category-filter-select"
                  value={selectedArticleCategoryFilter}
                  onChange={(e) => setSelectedArticleCategoryFilter(e.target.value)}
                  aria-label="Lọc theo chuyên mục"
                >
                  {['Tất cả', 'Đánh giá', 'Công thái học', 'Hướng dẫn', 'Mẹo công nghệ'].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'Tất cả' ? 'Tất cả chuyên mục' : cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="toolbar-right-group">
                <button
                  type="button"
                  className="btn-wolf-primary btn-add-product"
                  onClick={handleOpenAddArticleModal}
                >
                  ✍️ Viết Bài Mới
                </button>
              </div>
            </div>

            {/* Articles Table */}
            <div className="admin-products-table-card shadow-sm">
              {filteredArticles.length === 0 ? (
                <div className="empty-state-wolf my-4">
                  <div className="empty-icon">📰</div>
                  <h3>Không tìm thấy bài viết nào</h3>
                  <p>Thử tìm kiếm với từ khóa khác hoặc bấm nút "Viết Bài Mới" để tạo bài viết đầu tiên.</p>
                </div>
              ) : (
                <div className="admin-products-table-wrapper w-full overflow-x-auto rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
                  <table className="admin-products-table admin-articles-table w-full">
                    <thead>
                      <tr>
                        <th style={{ width: '55px' }}>ID</th>
                        <th className="w-20" style={{ width: '80px' }}>Ảnh</th>
                        <th style={{ width: '38%', minWidth: '220px' }}>Tiêu đề & Tóm tắt</th>
                        <th style={{ width: '110px' }}>Chuyên mục</th>
                        <th style={{ width: '130px' }}>Tác giả</th>
                        <th style={{ width: '105px' }}>Ngày đăng</th>
                        <th style={{ width: '140px', textAlign: 'center' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredArticles.map((art) => (
                        <tr key={art.id}>
                          <td>#{art.id}</td>
                          <td className="w-20" style={{ width: '80px' }}>
                            <img
                              src={art.image_url || art.coverImage}
                              alt={art.title}
                              className="w-16 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/akko-5075b-plus-dracula-castle-001-1000x1000.webp';
                              }}
                            />
                          </td>
                          <td style={{ maxWidth: '320px' }}>
                            <strong className="admin-product-name line-clamp-1" title={art.title}>
                              {art.title}
                            </strong>
                            <div className="admin-product-slug truncate">slug: /{art.slug}</div>
                            <small className="admin-product-specs line-clamp-2" style={{ display: 'block', color: 'var(--text-muted)' }}>
                              {art.excerpt}
                            </small>
                          </td>
                          <td>
                            <span className="stock-badge in-stock">{art.category}</span>
                          </td>
                          <td className="truncate" style={{ maxWidth: '130px' }} title={art.author}>
                            {art.author}
                          </td>
                          <td>📅 {art.date || art.published_at}</td>
                          <td>
                            <div className="table-actions-cluster">
                              <Link
                                to={`/news/${art.slug || art.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="action-btn view"
                                title="Xem bài viết trên web"
                              >
                                👁️ Xem
                              </Link>
                              <button
                                type="button"
                                className="action-btn edit"
                                onClick={() => handleOpenEditArticleModal(art)}
                                title="Chỉnh sửa bài viết"
                              >
                                ✏️ Sửa
                              </button>
                              <button
                                type="button"
                                className="action-btn delete"
                                onClick={() => setDeletingArticle(art)}
                                title="Xóa bài viết"
                              >
                                🗑️ Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL: THÊM MỚI / CHỈNH SỬA SẢN PHẨM (CRUD) */}
        {isFormModalOpen && (
          <div className="admin-modal-overlay" onClick={() => setIsFormModalOpen(false)}>
            <div className="admin-modal-card shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Mới Sản Phẩm Vào Cửa Hàng'}</h2>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsFormModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="admin-modal-form">
                <div className="form-grid-2">
                  {/* Name */}
                  <div className="form-group span-2">
                    <label className="form-label">
                      Tên sản phẩm <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-input ${formErrors.name ? 'input-error' : ''}`}
                      placeholder="Ví dụ: Bàn phím cơ không dây NuPhy Air75 V2"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                    {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                  </div>

                  {/* Category */}
                  <div className="form-group">
                    <label className="form-label">
                      Danh mục <span className="required">*</span>
                    </label>
                    <select
                      className={`form-input ${formErrors.category ? 'input-error' : ''}`}
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {formErrors.category && <span className="error-message">{formErrors.category}</span>}
                  </div>

                  {/* Segment */}
                  <div className="form-group">
                    <label className="form-label">
                      Phân khúc mục tiêu <span className="required">*</span>
                    </label>
                    <select
                      className="form-input"
                      value={formSegment}
                      onChange={(e) => setFormSegment(e.target.value as 'gaming' | 'office')}
                    >
                      <option value="gaming">🎮 Gaming Gear</option>
                      <option value="office">💼 Thiết bị văn phòng</option>
                    </select>
                  </div>

                  {/* Software Driver */}
                  <div className="form-group">
                    <label className="form-label">Phần mềm điều khiển đi kèm</label>
                    <select
                      className="form-input"
                      value={formSoftwareId}
                      onChange={(e) => setFormSoftwareId(e.target.value)}
                    >
                      <option value="">-- Không có / Driver tự nhận Plug & Play --</option>
                      <option value="logitech-ghub">Logitech G HUB</option>
                      <option value="logi-options-plus">Logi Options+</option>
                      <option value="keychron-launcher">Keychron Launcher / VIA</option>
                      <option value="razer-synapse">Razer Synapse</option>
                      <option value="nuphy-console">NuPhy Console</option>
                    </select>
                  </div>

                  {/* Stock */}
                  <div className="form-group">
                    <label className="form-label">
                      Số lượng tồn kho <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      className={`form-input ${formErrors.stockQuantity ? 'input-error' : ''}`}
                      placeholder="Số lượng tồn kho (chiếc)"
                      value={formStock}
                      onChange={(e) => setFormStock(e.target.value)}
                    />
                    {formErrors.stockQuantity && (
                      <span className="error-message">{formErrors.stockQuantity}</span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="form-group">
                    <label className="form-label">
                      Giá bán (VNĐ) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      className={`form-input ${formErrors.price ? 'input-error' : ''}`}
                      placeholder="Ví dụ: 2290000"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                    />
                    {formErrors.price && <span className="error-message">{formErrors.price}</span>}
                  </div>

                  {/* Original Price */}
                  <div className="form-group">
                    <label className="form-label">Giá niêm yết cũ (Tùy chọn)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      className="form-input"
                      placeholder="Ví dụ: 2890000"
                      value={formOriginalPrice}
                      onChange={(e) => setFormOriginalPrice(e.target.value)}
                    />
                  </div>

                  {/* Gallery Image URLs & Manual File Uploader */}
                  <div className="form-group span-2">
                    <div className="image-input-mode-toggle">
                      <label className="form-label" style={{ marginBottom: 0 }}>
                        Ảnh sản phẩm (Tải lên hoặc dán URL) <span className="required">*</span>
                      </label>
                      <button
                        type="button"
                        className="image-toggle-btn"
                        onClick={() => setShowManualUrlTextarea((prev) => !prev)}
                      >
                        {showManualUrlTextarea ? 'Ẩn ô nhập link URL' : 'Dán đường dẫn URL trực tiếp'}
                      </button>
                    </div>

                    {/* Manual File Upload Zone */}
                    <div
                      className={`admin-image-upload-zone ${isDragging ? 'dragging' : ''}`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        handleFileUpload(e.dataTransfer.files);
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      title="Bấm để chọn ảnh từ máy tính hoặc kéo thả tệp vào đây"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileUpload(e.target.files)}
                        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                        multiple
                        style={{ display: 'none' }}
                      />

                      <div className="admin-upload-icon-wrap">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>

                      <strong className="admin-upload-title">
                        <span>Nhấn để chọn ảnh từ máy tính</span> hoặc kéo thả tệp vào đây
                      </strong>
                      <span className="admin-upload-sub">
                        Hỗ trợ PNG, JPG, WEBP, GIF (Có thể chọn nhiều tệp ảnh cùng lúc)
                      </span>

                      {isUploadingImage && (
                        <div className="admin-upload-status">
                          ⏳ {uploadProgress || 'Đang xử lý tải ảnh lên...'}
                        </div>
                      )}
                    </div>

                    {/* Optional URL Textarea */}
                    {showManualUrlTextarea && (
                      <div className="mt-2">
                        <small className="d-block mb-1 text-muted">
                          Nhập mỗi dòng 1 link URL ảnh (dòng đầu tiên là ảnh đại diện):
                        </small>
                        <textarea
                          rows={3}
                          className={`form-input form-textarea url-textarea ${formErrors.images ? 'input-error' : ''}`}
                          placeholder="https://example.com/product-front.jpg&#10;https://example.com/product-side.jpg"
                          value={formImagesText}
                          onChange={(e) => setFormImagesText(e.target.value)}
                        />
                      </div>
                    )}

                    {formErrors.images && <span className="error-message">{formErrors.images}</span>}

                    {/* Interactive Gallery Thumbnails with Cover & Delete actions */}
                    {validPreviewUrls.length > 0 && (
                      <div className="mt-3">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <small style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            Danh sách ảnh ({validPreviewUrls.length} ảnh):
                          </small>
                          <small style={{ color: 'var(--text-muted)' }}>
                            Ảnh đầu tiên là ảnh đại diện chính
                          </small>
                        </div>

                        <div className="admin-gallery-preview-grid">
                          {validPreviewUrls.map((url, idx) => (
                            <div
                              key={`${url.slice(0, 32)}-${idx}`}
                              className={`admin-gallery-item ${idx === 0 ? 'is-cover' : ''}`}
                            >
                              {idx === 0 && (
                                <span className="admin-gallery-badge">Ảnh chính</span>
                              )}
                              <img
                                src={url}
                                alt={`Ảnh ${idx + 1}`}
                                className="admin-gallery-thumb"
                              />
                              <div className="admin-gallery-actions">
                                {idx > 0 ? (
                                  <button
                                    type="button"
                                    className="admin-gallery-btn primary-btn"
                                    onClick={() => handleSetPrimaryImage(idx)}
                                    title="Đặt làm ảnh đại diện chính"
                                  >
                                    ⭐ Đặt chính
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--main-color)', fontWeight: 700 }}>
                                    ✓ Bìa
                                  </span>
                                )}
                                <button
                                  type="button"
                                  className="admin-gallery-btn remove-btn"
                                  onClick={() => handleRemoveImage(idx)}
                                  title="Xóa ảnh này"
                                >
                                  🗑️ Xóa
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Specs */}
                  <div className="form-group span-2">
                    <label className="form-label">
                      Thông số kỹ thuật nổi bật <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-input ${formErrors.specs ? 'input-error' : ''}`}
                      placeholder="Ví dụ: Cảm biến 30K DPI, nặng 63g, kết nối không dây 2.4GHz"
                      value={formSpecs}
                      onChange={(e) => setFormSpecs(e.target.value)}
                    />
                    {formErrors.specs && <span className="error-message">{formErrors.specs}</span>}
                  </div>

                  {/* Description */}
                  <div className="form-group span-2">
                    <label className="form-label">
                      Mô tả chi tiết sản phẩm <span className="required">*</span>
                    </label>
                    <textarea
                      rows={3}
                      className={`form-input ${formErrors.desc ? 'input-error' : ''}`}
                      placeholder="Giới thiệu chi tiết tính năng, cảm giác sử dụng và đối tượng phù hợp..."
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                    />
                    {formErrors.desc && <span className="error-message">{formErrors.desc}</span>}
                  </div>

                  {/* Badge & Flash sale options */}
                  <div className="form-group">
                    <label className="form-label">Nhãn nổi bật (Badge)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ví dụ: Bán chạy, Mới về, Top 1"
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value)}
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formIsFlashSale}
                        onChange={(e) => setFormIsFlashSale(e.target.checked)}
                      />
                      <span>Đánh dấu hiển thị mục Flash Sale ⚡</span>
                    </label>
                  </div>
                </div>

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="btn-wolf-secondary"
                    onClick={() => setIsFormModalOpen(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn-wolf-primary" disabled={isSavingProduct}>
                    {isSavingProduct
                      ? 'Đang lưu vào Supabase...'
                      : editingProduct
                        ? 'Cập nhật sản phẩm'
                        : 'Lưu sản phẩm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: HỘP THOẠI XÁC NHẬN TRƯỚC KHI XÓA (CONFIRM DELETE) */}
        {deletingProduct && (
          <div className="admin-modal-overlay" onClick={() => setDeletingProduct(null)}>
            <div className="admin-modal-card confirm-delete shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-icon-box">⚠️</div>
              <h2 className="confirm-title">Xác nhận xóa sản phẩm?</h2>
              <p className="confirm-desc">
                Bạn có chắc chắn muốn xóa sản phẩm <strong>"{deletingProduct.name}"</strong> (Mã SKU: #{deletingProduct.id}) khỏi cửa hàng? Hành động này sẽ lập tức loại bỏ sản phẩm khỏi danh sách bán hàng.
              </p>
              <div className="modal-actions-row center">
                <button
                  type="button"
                  className="btn-wolf-secondary"
                  onClick={() => setDeletingProduct(null)}
                >
                  Không, giữ lại
                </button>
                <button
                  type="button"
                  className="btn-danger-confirm"
                  onClick={handleConfirmDelete}
                >
                  Đồng ý xóa sản phẩm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: TẠO / SỬA BÀI VIẾT (ARTICLE FORM) */}
        {isArticleModalOpen && (
          <div className="admin-modal-overlay" onClick={() => setIsArticleModalOpen(false)}>
            <div
              className="admin-modal-card article-form-modal shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h2>{editingArticle ? 'Chỉnh Sửa Bài Viết' : 'Viết Bài Viết Mới'}</h2>
                  <p className="modal-subtitle">
                    {editingArticle
                      ? `Cập nhật nội dung bài viết #${editingArticle.id}`
                      : 'Nội dung sẽ được xuất bản lên chuyên mục Tin tức & Đánh giá công nghệ'}
                  </p>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setIsArticleModalOpen(false)}
                  aria-label="Đóng"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveArticle} className="admin-product-form">
                <div className="form-grid">
                  {/* Title */}
                  <div className="form-group span-2">
                    <label className="form-label">
                      Tiêu đề bài viết <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="VD: Đánh giá chi tiết bàn phím cơ Akko 5075B Plus..."
                      value={formArticleTitle}
                      onChange={(e) => {
                        setFormArticleTitle(e.target.value);
                        if (!editingArticle) {
                          setFormArticleSlug(slugify(e.target.value));
                        }
                      }}
                      required
                    />
                  </div>

                  {/* Slug */}
                  <div className="form-group span-2">
                    <label className="form-label">
                      Đường dẫn tĩnh (Slug URL) <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="VD: danh-gia-akko-5075b-plus-dracula-castle"
                      value={formArticleSlug}
                      onChange={(e) => setFormArticleSlug(e.target.value)}
                      required
                    />
                    <small style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      URL: /news/{formArticleSlug || 'duong-dan-bai-viet'}
                    </small>
                  </div>

                  {/* Category */}
                  <div className="form-group">
                    <label className="form-label">Chuyên mục</label>
                    <select
                      className="form-input"
                      value={formArticleCategory}
                      onChange={(e) => setFormArticleCategory(e.target.value)}
                    >
                      <option value="Đánh giá">Đánh giá</option>
                      <option value="Công thái học">Công thái học</option>
                      <option value="Hướng dẫn">Hướng dẫn</option>
                      <option value="Mẹo công nghệ">Mẹo công nghệ</option>
                    </select>
                  </div>

                  {/* Author */}
                  <div className="form-group">
                    <label className="form-label">Tác giả</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="TechGear Editorial"
                      value={formArticleAuthor}
                      onChange={(e) => setFormArticleAuthor(e.target.value)}
                    />
                  </div>

                  {/* Published Date */}
                  <div className="form-group">
                    <label className="form-label">Ngày đăng</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formArticlePublishedAt}
                      onChange={(e) => setFormArticlePublishedAt(e.target.value)}
                    />
                  </div>

                  {/* Article Image (Upload / URL) */}
                  <div className="form-group span-2">
                    <label className="form-label">Hình ảnh bài viết (Cover image)</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <input
                        type="url"
                        className="form-input"
                        placeholder="Nhập URL ảnh hoặc bấm tải lên..."
                        value={formArticleImageUrl}
                        onChange={(e) => setFormArticleImageUrl(e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <input
                        ref={articleFileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleArticleImageUpload(e.target.files)}
                      />
                      <button
                        type="button"
                        className="btn-wolf-outline"
                        onClick={() => articleFileInputRef.current?.click()}
                        disabled={isUploadingArticleImg}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {isUploadingArticleImg ? '⏳ Đang tải...' : '📁 Tải ảnh lên'}
                      </button>
                    </div>

                    {articleUploadProgress && (
                      <small style={{ color: 'var(--main-color)', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                        {articleUploadProgress}
                      </small>
                    )}

                    {formArticleImageUrl && (
                      <div style={{ maxWidth: '320px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginTop: '0.25rem' }}>
                        <img
                          src={formArticleImageUrl}
                          alt="Preview"
                          style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/akko-5075b-plus-dracula-castle-001-1000x1000.webp';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Excerpt */}
                  <div className="form-group span-2">
                    <label className="form-label">
                      Tóm tắt ngắn (Excerpt) <span className="required">*</span>
                    </label>
                    <textarea
                      rows={2}
                      className="form-input"
                      placeholder="Mô tả tóm tắt nội dung bài viết hiển thị ở danh sách tin và SEO..."
                      value={formArticleExcerpt}
                      onChange={(e) => setFormArticleExcerpt(e.target.value)}
                      required
                    />
                  </div>

                  {/* Content */}
                  <div className="form-group span-2">
                    <label className="form-label">
                      Nội dung chi tiết bài viết <span className="required">*</span>
                    </label>
                    <textarea
                      rows={10}
                      className="form-input"
                      placeholder="Hỗ trợ tiêu đề ##, ###, dấu gạch đầu dòng •, trích dẫn > và các đoạn văn cách nhau 1 dòng trắng..."
                      value={formArticleContent}
                      onChange={(e) => setFormArticleContent(e.target.value)}
                      required
                    />
                    <small style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      💡 Mẹo định dạng: Dùng <code>## Tiêu đề mục lớn</code>, <code>### Tiêu đề phụ</code>, <code>• Ý liệt kê</code> để bài viết hiển thị chuyên nghiệp.
                    </small>
                  </div>
                </div>

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="btn-wolf-secondary"
                    onClick={() => setIsArticleModalOpen(false)}
                  >
                    Hủy bỏ
                  </button>
                  <button type="submit" className="btn-wolf-primary" disabled={isSavingArticle}>
                    {isSavingArticle
                      ? 'Đang lưu vào Supabase...'
                      : editingArticle
                        ? 'Cập nhật bài viết'
                        : 'Xuất bản bài viết mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: XÁC NHẬN XÓA BÀI VIẾT */}
        {deletingArticle && (
          <div className="admin-modal-overlay" onClick={() => setDeletingArticle(null)}>
            <div className="admin-modal-card confirm-delete shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="confirm-icon-box">🗑️</div>
              <h2 className="confirm-title">Xác nhận xóa bài viết?</h2>
              <p className="confirm-desc">
                Bạn có chắc chắn muốn xóa vĩnh viễn bài viết <strong>"{deletingArticle.title}"</strong> (ID: #{deletingArticle.id})? Hành động này sẽ gỡ bài viết khỏi Supabase và toàn bộ hệ thống web.
              </p>
              <div className="modal-actions-row center">
                <button
                  type="button"
                  className="btn-wolf-secondary"
                  onClick={() => setDeletingArticle(null)}
                >
                  Không, giữ lại
                </button>
                <button
                  type="button"
                  className="btn-danger-confirm"
                  onClick={handleConfirmDeleteArticle}
                >
                  Đồng ý xóa bài viết
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: CHI TIẾT ĐƠN HÀNG */}
        {selectedOrder && (
          <div className="admin-modal-overlay" onClick={() => setSelectedOrderId(null)}>
            <div
              className="admin-modal-card order-detail-modal shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h2>Chi tiết đơn hàng {selectedOrder.id}</h2>
                  <p className="order-modal-date">
                    Ngày đặt: {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setSelectedOrderId(null)}
                  aria-label="Đóng chi tiết đơn hàng"
                >
                  ✕
                </button>
              </div>

              <div className="order-modal-status-bar">
                <div className="order-meta-pill-group">
                  <span className="order-meta-label">Thanh toán:</span>
                  <span className={`payment-pill ${selectedOrder.paymentMethod}`}>
                    {selectedOrder.paymentMethod === 'vietqr'
                      ? 'VietQR (Chuyển khoản)'
                      : 'COD (Thanh toán khi nhận hàng)'}
                  </span>
                </div>
                <div className="order-meta-pill-group">
                  <span className="order-meta-label">Trạng thái:</span>
                  <select
                    className={`status-select compact ${selectedOrder.status}`}
                    value={selectedOrder.status}
                    onChange={(event) =>
                      handleOrderStatusChange(selectedOrder.id, event.target.value as OrderStatus)
                    }
                    aria-label={`Cập nhật trạng thái đơn ${selectedOrder.id}`}
                  >
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="order-detail-info-grid">
                <div className="order-detail-field">
                  <span className="order-detail-label">Tên khách hàng</span>
                  <strong>{selectedOrder.shipping.name}</strong>
                </div>
                <div className="order-detail-field">
                  <span className="order-detail-label">Số điện thoại</span>
                  <strong>{selectedOrder.shipping.phone}</strong>
                </div>
                <div className="order-detail-field span-2">
                  <span className="order-detail-label">Địa chỉ giao hàng đầy đủ</span>
                  <p className="order-detail-value">{selectedOrder.shipping.address}</p>
                </div>
                {selectedOrder.shipping.note && (
                  <div className="order-detail-field span-2">
                    <span className="order-detail-label">Ghi chú đơn hàng</span>
                    <p className="order-detail-value muted">
                      {selectedOrder.shipping.note.trim()}
                    </p>
                  </div>
                )}
                {selectedOrder.status === 'shipping' && (
                  <div className="order-detail-field span-2 shipping-info-highlight">
                    <span className="order-detail-label">🚚 Thông tin vận chuyển</span>
                    <div className="shipping-modal-badge-row">
                      <span>Đơn vị vận chuyển: <strong>{selectedOrder.shippingCarrier || 'Giao Hàng Nhanh'}</strong></span>
                      <span className="tracking-divider">•</span>
                      <span>
                        Mã vận đơn:{' '}
                        <code className="tracking-code-val">
                          {selectedOrder.trackingCode || `TG-SHIP-${selectedOrder.id.replace(/^TG-/, '')}`}
                        </code>
                      </span>
                    </div>
                  </div>
                )}
                {selectedOrder.status === 'return_requested' && (
                  <div className="order-detail-field span-2 admin-return-highlight-box">
                    <span className="order-detail-label">↩️ Yêu cầu hoàn trả / đổi trả từ khách hàng</span>
                    <div className="admin-return-modal-content">
                      <p className="mb-1"><strong>Lý do:</strong> {selectedOrder.returnReason}</p>
                      {selectedOrder.returnNote && (
                        <p className="mb-2"><strong>Mô tả & STK nhận tiền:</strong> {selectedOrder.returnNote}</p>
                      )}
                      {selectedOrder.returnedAt && (
                        <small className="block text-muted mb-3">
                          Thời gian gửi: {new Date(selectedOrder.returnedAt).toLocaleString('vi-VN')}
                        </small>
                      )}
                      <div className="admin-return-modal-actions">
                        <button
                          type="button"
                          className="btn-wolf-primary btn-approve-refund-modal"
                          onClick={() => {
                            handleApproveRefund(selectedOrder);
                            setSelectedOrderId(null);
                          }}
                        >
                          ✅ Duyệt & Hoàn tiền (+ Tự động hoàn kho)
                        </button>
                        <button
                          type="button"
                          className="btn-wolf-outline btn-reject-refund-modal"
                          onClick={() => {
                            handleRejectRefund(selectedOrder);
                            setSelectedOrderId(null);
                          }}
                        >
                          ❌ Từ chối yêu cầu
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {selectedOrder.status === 'refunded' && (
                  <div className="order-detail-field span-2 admin-refunded-highlight-box">
                    <span className="order-detail-label">✅ Trạng thái hoàn tiền</span>
                    <p className="text-emerald-600 font-semibold mb-1">
                      Đơn hàng đã hoàn tiền thành công và số lượng sản phẩm đã được tự động hoàn vào kho.
                    </p>
                    {selectedOrder.adminRefundNote && (
                      <p><strong>Ghi chú phản hồi:</strong> {selectedOrder.adminRefundNote}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="order-detail-items-section">
                <h3 className="order-detail-section-title">
                  Sản phẩm đã đặt ({selectedOrder.items.length})
                </h3>
                <div className="order-detail-items-list">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={`${item.product.id}-${idx}`} className="order-detail-item-row">
                      <img
                        src={getProductPrimaryImage(item.product)}
                        alt={item.product.name}
                        className="order-detail-item-thumb"
                      />
                      <div className="order-detail-item-info">
                        <strong>{item.product.name}</strong>
                        <span className="order-detail-item-meta">
                          Đơn giá: {formatPrice(item.product.price)} × {item.quantity}
                        </span>
                      </div>
                      <strong className="order-detail-item-subtotal">
                        {formatPrice(item.product.price * item.quantity)}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-detail-footer">
                <div className="order-detail-total-box">
                  <span>Tổng thanh toán:</span>
                  <strong className="order-detail-total-price">{formatPrice(selectedOrder.total)}</strong>
                </div>
                <button
                  type="button"
                  className="btn-wolf-secondary"
                  onClick={() => setSelectedOrderId(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Feedback */}
        <Toast message={toastMessage} variant="info" onClose={() => setToastMessage(null)} />
      </div>
    </div>
  );
}
