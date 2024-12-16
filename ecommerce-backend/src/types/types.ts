import { NextFunction, Request, Response } from "express";

export interface NewUserRequestBody {
  name: string;
  email: string;
  photo: string;
  gender: string;
  _id: string;
  dob: Date;
}

export interface NewProductRequestBody {
  name: string;
  price: number;
  stock: number;
  category: string;
}

// Destructuring shippingInfo and orderItems
export type OrderItemType = {
  name: string;
  photo: string;
  price: number;
  quantity: number;
  productId: string;
}

export type ShippingInfoType = {
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: number;
}

export interface NewOrderRequestBody {
  shippingInfo: ShippingInfoType;
  user: string;
  subTotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  orderItems: OrderItemType[];
}

// This is created for Error Handling
export type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

// Search Product Query
export type SearchRequestQuery = {
  search?:string,
  price?: string,
  category?: string,
  sort?: string,
  page?: string
}

// Base Query for Search Filter
export interface BaseQuery {
  name?: { $regex: string, $options: string };
  price?: { $lte: number};
  category?: string;
}

// Types for Invaldate Cache
export type InvalidateCacheProps = {
  product?: boolean;
  order?: boolean;
  admin?: boolean;
  userId?: string; //this is added because in order we needed user id a params
  orderId?: string; // when order is deleted it still shows the order when API hits to resolve this we are useing this
  productId?: string | string[]; // same with productId
  
}
