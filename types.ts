export interface Quote {
  id: string;
  text: string;
  author: string;
  dateAdded: number; // timestamp
  tags?: string[];
  reflection?: string; // AI generated insight
  isFavorite?: boolean;
}

export enum AppView {
  WRITE = 'WRITE',
  BOOK = 'BOOK',
  INSPIRE = 'INSPIRE',
}

export interface InspirationResponse {
  text: string;
  author: string;
}