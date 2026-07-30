export type PreferredLength = 'Short' | 'Medium' | 'Long' | 'Same as shown';

export type NailSet = {
  id: string;
  code: string;
  name: string;
  category: string;
  length: PreferredLength;
  lengthOptions?: PreferredLength[];
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

export type CartItem = {
  cartId: string;
  setId: string;
  length: PreferredLength;
  quantity: number;
  addedAt: string;
  setSnapshot?: NailSet;
};

export type CartLine = CartItem & {
  set: NailSet;
};

export type OrderStatus =
  | 'Order confirmed'
  | 'Photos under review'
  | 'In production'
  | 'Quality check'
  | 'Ready to dispatch'
  | 'Dispatched'
  | 'Delivered';
