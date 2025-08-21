export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  brand: string;
  dimensions?: string;
  material?: string;
  color?: string;
  sku?: string;
  inStock?: boolean;
  rating?: number;
  reviews?: number;
  url?: string;
  variants?: ProductVariant[];
}

export interface Room {
  id: string;
  name: string;
  type: 'living-room' | 'bedroom' | 'kitchen' | 'bathroom' | 'office' | 'dining-room';
  originalImage?: string;
  designedImage?: string;
  products: Product[];
  style: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  sku: string;
  image?: string;
}

export interface DesignStyle {
  id: string;
  name: string;
  description: string;
  image: string;
}