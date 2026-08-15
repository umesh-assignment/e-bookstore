export interface CartItem {
  bookId: string;
  title: string;
  author: string;
  coverUrl: string;
  price: number;
  originalPrice: number | null;
  quantity: number;
}
