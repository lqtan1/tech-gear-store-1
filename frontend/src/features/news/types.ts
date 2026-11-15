export interface Article {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  image_url: string;
  author: string;
  published_at: string;
  created_at?: string;
  // Computed & UI convenience properties
  coverImage?: string;
  date?: string;
  readTime?: string;
  tags?: string[];
  relatedProductId?: number;
}

export interface ArticleInput {
  title: string;
  slug?: string;
  category: string;
  excerpt: string;
  content: string;
  image_url: string;
  author?: string;
  published_at?: string;
  tags?: string[];
  relatedProductId?: number;
}

// Backward compatibility alias
export type NewsArticle = Article;
