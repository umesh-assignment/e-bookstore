export interface Category {
  id: string;
  name: string;
  /** Unicode emoji representing the genre */
  icon: string;
  /** Computed at runtime by BookService — not stored in JSON */
  bookCount?: number;
}
