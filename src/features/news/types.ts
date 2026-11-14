export interface NewsSection {
  heading: string;
  text: string;
  image?: string;
  quote?: string;
  bullets?: string[];
}

export interface NewsAuthor {
  name: string;
  role: string;
  avatar: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  date: string;
  author: NewsAuthor;
  category: string;
  coverImage: string;
  excerpt: string;
  readTime: string;
  content: {
    intro: string;
    sections: NewsSection[];
    conclusion: string;
  };
  relatedProductId?: number;
  tags: string[];
}

