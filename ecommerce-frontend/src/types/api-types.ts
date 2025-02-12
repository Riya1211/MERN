import { CartItem, Order, Product, ShippingInfo, User } from "./types";

export type CustomError ={
    status: number;
    data: {
        message: string;
        success: boolean;
    }
}
export type MessageResponse = {
    success : boolean;
    message : string;
}

export type UserResponse = {
    success : boolean;
    user : User;
}

export type AllProductResponse = {
    success : boolean;
    products : Product[];
}
export type CategoriesResponse = {
    success : boolean;
    categories : string[];
}
export type SearchProductResponse = {
    success : boolean;
    products : Product[];
    totalPage : number;
}
export type SearchProductRequest = {
    price : number;
    category : string;
    search : string;
    sort : string;
    totalPage : number;
}
export type NewProductRequest = {
    id : string;
    formData : FormData;
}
export type UpdateProductRequest = {
    userId : string;
    productId : string;
    formData : FormData;
}
export type DeleteProductRequest = {
    userId : string;
    productId : string;
}
//this response is for managaing product on admin side
export type ProductResponse = {
    success : boolean;
    product : Product;
}

export type NewOrderRequest = {
    user: string;
    shippingInfo : ShippingInfo;
    orderItems: CartItem[];
    //given cartItem not orderItem because in orderItem there is the _id which will be created later and cartItem is quite similar to orderItem.
    subTotal: number;
    tax: number;
    discount: number;
    total: number;
}

export type UpdateOrderRequest = {
    userId: string;
    orderId: string;
}

export type AllOrdersResponse = {
    success : boolean;
    orders : Order[];
}
export type OrderDetailResponse = {
    success : boolean;
    order : Order;
}