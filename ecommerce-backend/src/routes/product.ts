import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { singleUpload } from "../middlewares/multer.js";
import { deleteProduct, getAdminProducts, getAllCategories, getAllProducts, getLatestProducts, getProduct, newProduct, updateProduct } from "../controllers/product.js";

const app = express.Router();

// Create Product
app.post("/new", adminOnly, singleUpload, newProduct);

// Latest Products only 5 of them 
app.get("/latest", getLatestProducts);

// Search all Products using diff filters
app.get("/all", getAllProducts);

// Get All Category
app.get("/categories", getAllCategories);

// All Products
app.get("/admin-products", adminOnly, getAdminProducts);

app.route("/:id").get(getProduct).put(adminOnly, singleUpload, updateProduct).delete(adminOnly, deleteProduct);



export default app;