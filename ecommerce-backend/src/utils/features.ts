import mongoose from "mongoose";
import { InvalidateCacheProps, OrderItemType } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/product.js";
import { Order } from "../models/order.js";

export const connectDB = (uri: string) => {
  mongoose
    .connect(uri, {
      dbName: "Ecommerce_24",
    })
    .then((c) => console.log(`DB Connected to ${c.connection.host}`))
    .catch((e) => console.log(e));
};

// Creating invalidate function for removing CACHE at certain conditions

export const invalidateCache = ({
  product,
  order,
  admin,
  userId,
  orderId,
  productId,
}: InvalidateCacheProps) => {
  if (product) {
    const productKeys: string[] = [
      "latest-products",
      "categories",
      "all-products",
    ];

    if (typeof productId === "string")
      productKeys.push(`single-product-${productId}`);

    if (typeof productId === "object") {
      productId.forEach((i) => {
        productKeys.push(`single-product-${i}`);
      });
    }

    myCache.del(productKeys);
  }

  if (order) {
    const orderKeys: string[] = [
      "all-orders",
      `my-orders-${userId}`,
      `order-${orderId}`,
    ];

    myCache.del(orderKeys);
  }

  if (admin) {

    myCache.del([
      "admin-stats",
      "admin-pie-charts",
      "admin-bar-charts",
      "admin-line-charts"
    ]);
    
  }
};

// Creating functions for reducing Stocks
export const reduceStock = async (orderItems: OrderItemType[]) => {
  console.log(orderItems.length);
  for (let i = 0; i < orderItems.length; i++) {
    const order = orderItems[i];
    const product = await Product.findById(order.productId);
    if (!product) {
      throw new Error("Product Not Found");
    }

    product.stock -= order.quantity;

    await product.save();
  }
};

// Calculating Percentage for ADMIN Dashboard
export const calculatePercentage = (thisMonth: number, lastMonth: number) => {
  if (lastMonth === 0) return thisMonth * 100;
  const percent = (thisMonth / lastMonth) * 100;
  // const percent = (8 / 2 ) * 100;

  return Number(percent.toFixed(0));
};

// For Bar and pi charts data related to category
export const getCategory = async ({
  categories,
  productCount,
}: {
  categories: string[];
  productCount: number;
}) => {
  const categoriesCountPromise = categories.map((category) =>
    Product.countDocuments({ category })
  );

  const categoriesCount = await Promise.all(categoriesCountPromise);

  const categoryCount: Record<string, number>[] = [];

  categories.forEach((category, i) => {
    categoryCount.push({
      [category]: Math.round((categoriesCount[i] / productCount) * 100),
    });
  });

  return categoryCount;
};

// Function cretaed for last number of Month Data

interface MyDocument extends Document {
  createdAt: Date;
  discount?: number;
  total?: number;
}; // It is created becuse .createdAt at line 126 was showing error as it was not part of docArr which was of type Document

type MonthDataProps = {
  length: number;
  docArr: MyDocument[];
  today: Date;
  property?: "discount" | "total";
}
export const getMonthData = ({
  length,
  docArr,
  today,
  property
}: MonthDataProps) => {

  const data: number[] = new Array(length).fill(0);

  docArr.forEach((i) => {
    const creationDate = i.createdAt;
    const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

    if (monthDiff < length) {
      if(property){
        // for discount and total
        data[length - monthDiff - 1] += i[property]! ;
      }else{
        data[length - monthDiff - 1] += 1;
      }
    }
  });

  return data;
};
