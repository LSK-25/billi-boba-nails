export type NailSet = {
  id: string;
  code: string;
  name: string;
  category: string;
  length: string;
  shape: string;
  finish: string;
  price: number;
  color: string;
  tone: string;
  accentTone: string;
  description: string;
  story: string;
  productionTime: string;
  featured: boolean;
  archived?: boolean;
};

export type OrderStatus =
  | 'Order confirmed'
  | 'Photos under review'
  | 'In production'
  | 'Quality check'
  | 'Ready to dispatch'
  | 'Dispatched'
  | 'Delivered';
