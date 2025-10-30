export interface Book {
  title: string;
  author: string;
  slug: string;
  rating: number;
  tags: string[];
  synopsis?: string;
  coverImage?: string | null;
  chapters?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Chapter {
  name: string;
  path: string;
  sha: string;
  size: number;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (password: string) => Promise<void>;
  logout: () => void;
}
