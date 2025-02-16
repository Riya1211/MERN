export type User = {
  name: string;
  email: string;
  photo: string;
  gender: string;
  role: string;
  dob: string;
  _id: string;
};

export type Product = {
  name: string;
  price: number;
  stock: number;
  category: string;
  photo: string;
  _id: string;
};

export type ShippingInfo = {
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
};
export type CartItem = {
  productId: string;
  photo: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
};
// export type OrderItem = {
//     name:string;
//     photo:string;
//     price:number;
//     quantity:number;
//     productId:string;
//     _id: string;
// }
// shorter way of writing this is
export type OrderItem = Omit<CartItem, "stock"> & { _id: string };

export type Order = {
  _id: string;
  orderItems: OrderItem[];
  subtotal: number;
  shippingInfo: ShippingInfo;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  status: string;
  user: {
    name: string;
    _id: string;
  };
};

type CountAndChange = {
  revenue: number;
  product: number;
  user: number;
  order: number;
};
type latestTransaction = {
  _id: string;
  amount: number;
  discount: number;
  quantity: number;
  status: string;
};

export type Stats = {
  categoryCount: Record<string, number>[];
  changePercent: CountAndChange;
  count: CountAndChange;
  chart: {
    order: number[];
    revenue: number[];
  };
  userRatio: {
    male: number;
    female: number;
  };
  latestTransaction: latestTransaction[];
};

export type Pie = {
  orderFullFillment: {
    processing: number;
    shipped: number;
    delivered: number;
  },
  productCategories: Record<string, number>[],
  stockAvailability : {
    inStock: number;
    productOutOfStock: number;
  },
  revenueDistribution: {
    netMargin: number;
    discount: number;
    productionCost: number;
    burnt: number;
    marketingCost: number;
  },
  usersAgeGroup: {
    teen: number;
    adult: number;
    old: number;
  },
  adminCustomer: {
    admin: number;
    customer: number;
  },
};

export type Bar = {
  users: number[],
  products: number[],
  orders: number[],
};

export type Line = {
  users: number[],
  products: number[],
  discount: number[],
  revenue: number[]
};