import { NextFunction, Request, Response } from "express";
import { TryCatch } from "../middlewares/error.js";
import {
  BaseQuery,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { faker } from "@faker-js/faker";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";

// Create New Product
export const newProduct = TryCatch(
  async (
    req: Request<{}, {}, NewProductRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    if (!photo) {
      return next(new ErrorHandler("Please add Photo", 400));
    }

    if (!name || !price || !stock || !category) {
      // If someone added photo but did not enter other fields the photo is uploaded on the device which is wrong so that is why we hae to delete that
      rm(photo.path, () => {
        console.log("Deleted");
      });
      return next(new ErrorHandler("Please enter All Fields", 400));
    }
    await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photo?.path,
    });

    // Invalidate for clearing CACHE

    invalidateCache({ product: true, admin: true });

    return res.status(201).json({
      success: true,
      message: "Product created Sucessfully",
    });
  }
);

// Latest Products
// Revalidate on New,Update,Delete Product & on New Order
export const getLatestProducts = TryCatch(async (req, res, next) => {
  let products;

  // if the cache have the data it will save it in product otherwise  else condition will run
  if (myCache.has("latest-products")) {
    products = JSON.parse(myCache.get("latest-products") as string);
  } else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    // Storing Data in cache for optimization
    myCache.set("latest-product", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

// Get All Category
// Revalidate on New,Update,Delete Product & on New Order
export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;

  if (myCache.has("categories")) {
    categories = JSON.parse(myCache.get("categories") as string);
  } else {
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }

  return res.status(200).json({
    success: true,
    categories,
  });
});

// Get All Products
// Revalidate on New,Update,Delete Product & on New Order
export const getAdminProducts = TryCatch(async (req, res, next) => {
  let products;

  if (myCache.has("all-products")) {
    products = JSON.parse(myCache.get("all-products") as string);
  } else {
    products = await Product.find({});
    myCache.set("all-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

// Get Single Product
export const getProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;

  // In this we will save ID also as a key becaue if we try to fin different product the cache already have the saved product and it will show that instead of the different product

  if (myCache.has(`single-product-${id}`)) {
    product = JSON.parse(myCache.get(`single-product-${id}`) as string);
  } else {
    product = await Product.findById(id);
    myCache.set(`single-product-${id}`, JSON.stringify(product));

    if (!product) {
      return next(new ErrorHandler("Invalid Product Id", 404));
    }
  }

  return res.status(200).json({
    success: true,
    product,
  });
});

// Update Product
export const updateProduct = TryCatch(
  async (
    // Because updating is optional and we dont need everything
    req,
    res,
    next
  ) => {
    const { id } = req.params;
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    const product = await Product.findById(id);

    if (!product) {
      return next(new ErrorHandler("Invalid Product Id", 404));
    }

    if (photo) {
      // If someone added new photo old photo must e deleted
      rm(product.photo!, () => {
        console.log("Old photo Deleted");
      });
      product.photo = photo.path;
    }

    if (name) {
      // add updated details
      product.name = name;
    }
    if (price) {
      // add updated details
      product.price = price;
    }
    if (stock) {
      // add updated details
      product.stock = stock;
    }
    if (category) {
      // add updated details
      product.category = category;
    }

    await product.save();

    // Invalidate for clearing CACHE

    invalidateCache({
      product: true,
      productId: String(product._id),
      admin: true,
    });

    return res.status(200).json({
      success: true,
      message: "Product updated Sucessfully",
    });
  }
);

// Delete Product
export const deleteProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Invalid Product Id", 404));
  }
  rm(product.photo!, () => {
    console.log("Product Photo Deleted");
  });

  await product.deleteOne();
  // Invalidate for clearing CACHE

  invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });
  return res.status(200).json({
    success: true,
    message: "Product deleted Sucessfully",
  });
});

// Search Products
export const getAllProducts = TryCatch(
  async (
    req: Request<{}, {}, {}, SearchRequestQuery>,
    res: Response,
    next: NextFunction
  ) => {
    const { search, sort, category, price } = req.query;
    const page = Number(req.query.page) || 1;

    // Use of limit is to show the number products in a page
    // Use of skip is to skip the number of products if you are on certain page number for example if you are on page number 3  and the limit is 8 so we need to skip 16 products to show on the 3rd page
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = limit * (page - 1);

    const baseQuery: BaseQuery = {};

    // Doing this will give an error because name doesn't exist  so to avoid that error we will create a type

    // The reason to do this in if condition is so that if user only use one type of filter

    // $regex will help to find the product using pattern in their name
    // lte means less than equals too
    if (search) {
      baseQuery.name = { $regex: search, $options: "i" };
    }

    if (price) {
      baseQuery.price = { $lte: Number(price) };
    }

    if (category) {
      baseQuery.category = category;
    }

    // This will Promise.all([]) takes array and in that both the queries will run simultaneously
    const [products, filteredOnlyProduct] = await Promise.all([
      Product.find(baseQuery)
        .sort(sort && { price: sort === "asc" ? 1 : -1 })
        .limit(limit)
        .skip(skip),
      Product.find(baseQuery), //this is filteredOnlyProduct
    ]);

    // The reason we have used this filteredOnlyProduct because we want products to be seen without sort and limit only with the baseQuery.
    //  For Example if we find the products based on name only that much product needs to be seen on the page and the pages should be calculated according to that only

    // Math.floor() will always go to the lower side for example 10.1 will become 10 so Math.ceil() is the oppposite of Math.floor()
    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);

// Creating FAKE PRODUCTS
// npm i --save-dev @faker-js/faker

// const generateRandomProducts = async (count: number = 10) => {
//   const products = [];

//   for (let i = 0; i < count; i++) {
//     const product = {
//       name: faker.commerce.productName(),
//       photo: "uploads\ca2e9135-0b6b-43b2-b6f8-baf71ca803cf.png",
//       price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//       stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//       category: faker.commerce.department(),
//       createdAt: new Date(faker.date.past()),
//       updatedAt: new Date(faker.date.recent()),
//       __v: 0,
//     };

//     products.push(product);
//   }

//   await Product.create(products);

//   console.log({ succecss: true });
// };

// const deleteRandomsProducts = async (count: number = 10) => {
//   const products = await Product.find({}).skip(4);

//   for (let i = 0; i < products.length; i++) {
//     const product = products[i];
//     await product.deleteOne();
//   }

//   console.log({ succecss: true });
// };

// deleteRandomsProducts(38);
