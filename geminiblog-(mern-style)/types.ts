export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface Post {
  id: string;
  title: string;
  summary: string;
  content: string; // Markdown
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  coverImage?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export enum AiActionType {
  GENERATE_TITLE = 'GENERATE_TITLE',
  SUMMARIZE = 'SUMMARIZE',
  FIX_GRAMMAR = 'FIX_GRAMMAR',
  EXPAND_TEXT = 'EXPAND_TEXT'
}