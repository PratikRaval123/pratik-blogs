export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  imageUrl: string;
  readTime: string;
  tags: string[];
}

export interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  nextCursor: number | null;
}