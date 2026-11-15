import { create } from 'zustand';

import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import {
  MOCK_ARTICLES,
  fetchArticlesFromSupabase,
  mapSupabaseRowToArticle,
  formatDateVi,
  calculateReadTime,
  type SupabaseArticleRow,
} from './service';
import type { Article, ArticleInput } from './types';

interface ArticleState {
  articles: Article[];
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  dataSource: 'supabase' | 'local';
  fetchArticles: (force?: boolean) => Promise<void>;
  addArticle: (input: ArticleInput) => Promise<Article>;
  updateArticle: (id: number, input: Partial<ArticleInput>) => Promise<void>;
  deleteArticle: (id: number) => Promise<void>;
}

const STORAGE_KEY = 'tech-gear-articles';

const sanitizeArticleImages = (articles: Article[]): Article[] => {
  return articles.map((a) => {
    if (!a.image_url || a.image_url.includes('hstatic.net') || a.coverImage?.includes('hstatic.net')) {
      return {
        ...a,
        image_url: '/images/akko-5075b-plus-dracula-castle-001-1000x1000.webp',
        coverImage: '/images/akko-5075b-plus-dracula-castle-001-1000x1000.webp',
      };
    }
    return a;
  });
};

const getDefaultArticles = (): Article[] => {
  return sanitizeArticleImages([...MOCK_ARTICLES]);
};

const getInitialArticles = (): Article[] => {
  if (typeof window === 'undefined') return getDefaultArticles();

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return getDefaultArticles();

  try {
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return getDefaultArticles();
    }
    return sanitizeArticleImages(parsed as Article[]);
  } catch {
    return getDefaultArticles();
  }
};

const persistArticles = (articles: Article[]) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  }
};

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const useArticleStore = create<ArticleState>((set, get) => ({
  articles: getInitialArticles(),
  isLoading: false,
  isInitialized: false,
  error: null,
  dataSource: 'local',

  fetchArticles: async (force = false) => {
    const { isInitialized, isLoading } = get();
    if (isInitialized && !force && !isLoading) return;

    set({ isLoading: true, error: null });
    try {
      const result = await fetchArticlesFromSupabase();
      persistArticles(result.data);
      set({
        articles: result.data,
        isLoading: false,
        isInitialized: true,
        dataSource: result.source === 'supabase' ? 'supabase' : 'local',
        error: result.error ?? null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi tải bài viết';
      set({
        isLoading: false,
        isInitialized: true,
        error: msg,
      });
    }
  },

  addArticle: async (input: ArticleInput): Promise<Article> => {
    const baseSlug = input.slug?.trim() || slugify(input.title);
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;
    const publishedAt = input.published_at || new Date().toISOString().split('T')[0];
    const author = input.author?.trim() || 'TechGear Editorial';
    const imageUrl = input.image_url.trim();

    let createdArticle: Article | null = null;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('articles')
          .insert({
            title: input.title.trim(),
            slug: uniqueSlug,
            category: input.category.trim(),
            excerpt: input.excerpt.trim(),
            content: input.content.trim(),
            image_url: imageUrl,
            author,
            published_at: publishedAt,
          })
          .select()
          .single();

        if (error) {
          console.error('[TechGear] Lỗi thêm bài viết vào Supabase:', error.message);
        } else if (data) {
          createdArticle = mapSupabaseRowToArticle(data as SupabaseArticleRow);
          console.log('[TechGear] Đã thêm bài viết vào Supabase! ID:', createdArticle.id);
        }
      } catch (err) {
        console.error('[TechGear] Ngoại lệ khi thêm bài viết vào Supabase:', err);
      }
    }

    if (!createdArticle) {
      const nextId = get().articles.reduce((max, a) => (a.id > max ? a.id : max), 0) + 1;
      createdArticle = {
        id: nextId,
        title: input.title.trim(),
        slug: uniqueSlug,
        category: input.category.trim(),
        excerpt: input.excerpt.trim(),
        content: input.content.trim(),
        image_url: imageUrl,
        coverImage: imageUrl,
        author,
        published_at: publishedAt,
        date: formatDateVi(publishedAt),
        readTime: calculateReadTime(input.content),
        tags: [input.category.trim(), 'TechGear'],
      };
    }

    const nextArticles = [createdArticle, ...get().articles.filter((a) => a.id !== createdArticle!.id)];
    persistArticles(nextArticles);
    set({ articles: nextArticles });

    return createdArticle;
  },

  updateArticle: async (id: number, input: Partial<ArticleInput>): Promise<void> => {
    if (isSupabaseConfigured()) {
      try {
        const updates: Record<string, unknown> = {};
        if (input.title !== undefined) updates.title = input.title.trim();
        if (input.slug !== undefined) updates.slug = input.slug.trim();
        if (input.category !== undefined) updates.category = input.category.trim();
        if (input.excerpt !== undefined) updates.excerpt = input.excerpt.trim();
        if (input.content !== undefined) updates.content = input.content.trim();
        if (input.image_url !== undefined) updates.image_url = input.image_url.trim();
        if (input.author !== undefined) updates.author = input.author.trim();
        if (input.published_at !== undefined) updates.published_at = input.published_at;

        const { error } = await supabase.from('articles').update(updates).eq('id', id);
        if (error) {
          console.error('[TechGear] Lỗi cập nhật bài viết trên Supabase:', error.message);
        }
      } catch (err) {
        console.error('[TechGear] Ngoại lệ khi cập nhật bài viết trên Supabase:', err);
      }
    }

    const nextArticles = get().articles.map((a) => {
      if (a.id !== id) return a;
      const updatedTitle = input.title !== undefined ? input.title.trim() : a.title;
      const updatedSlug = input.slug !== undefined ? input.slug.trim() : a.slug;
      const updatedCategory = input.category !== undefined ? input.category.trim() : a.category;
      const updatedExcerpt = input.excerpt !== undefined ? input.excerpt.trim() : a.excerpt;
      const updatedContent = input.content !== undefined ? input.content.trim() : a.content;
      const updatedImage = input.image_url !== undefined ? input.image_url.trim() : a.image_url;
      const updatedAuthor = input.author !== undefined ? input.author.trim() : a.author;
      const updatedPublishedAt = input.published_at !== undefined ? input.published_at : a.published_at;

      return {
        ...a,
        title: updatedTitle,
        slug: updatedSlug,
        category: updatedCategory,
        excerpt: updatedExcerpt,
        content: updatedContent,
        image_url: updatedImage,
        coverImage: updatedImage,
        author: updatedAuthor,
        published_at: updatedPublishedAt,
        date: formatDateVi(updatedPublishedAt),
        readTime: calculateReadTime(updatedContent),
      };
    });

    persistArticles(nextArticles);
    set({ articles: nextArticles });
  },

  deleteArticle: async (id: number): Promise<void> => {
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('articles').delete().eq('id', id);
        if (error) {
          console.error('[TechGear] Lỗi xóa bài viết trên Supabase:', error.message);
        }
      } catch (err) {
        console.error('[TechGear] Ngoại lệ khi xóa bài viết trên Supabase:', err);
      }
    }

    const nextArticles = get().articles.filter((a) => a.id !== id);
    persistArticles(nextArticles);
    set({ articles: nextArticles });
  },
}));
