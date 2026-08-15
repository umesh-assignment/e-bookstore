export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  tags: string[];
  description: string;
  price: number;
  originalPrice: number | null;
  coverUrl: string;
  rating: number;
  reviewCount: number;
  isbn: string;
  publisher: string;
  publishedDate: string;
  pages: number;
  language: string;
  inStock: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  crossSellIds: string[];
}
