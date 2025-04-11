import express from 'express';
import { connectDB } from './utils/features.js';
import { errorMiddleware } from './middlewares/error.js';
import NodeCache from 'node-cache';
import { config } from "dotenv";
import morgan from 'morgan';
import Stripe from 'stripe';
import cors from 'cors';

// Importing Routes
import userRoutes from './routes/user.js'
import productRoutes from './routes/product.js'
import orderRoutes from './routes/order.js'
import paymentRoutes from './routes/payment.js'
import dashboardRoutes from './routes/stats.js'

// Setting Up the ENVIORMENT for Variables
config({
    path:"./.env",
});

const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";

// Connecting DataBase
connectDB(mongoURI);

// For Payment
export const stripe = new Stripe(stripeKey);

// For Optimization
export const myCache = new NodeCache();

const app = express();

// using middleware for using json
app.use(express.json());

// Whatever API we have called it will tell the info in the terminal
app.use(morgan("dev"));

// CORS
app.use(cors());

// for get 
app.get("/", (req, res) =>{
    res.send("API is working with /api/v1");
})

// using routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Upload folder is also treating as api so to avoid that and get the image we will make it static
app.use("/uploads", express.static("uploads"));

app.use(errorMiddleware);

app.listen(port, ()=>{
    console.log(`Express is working on http://localhost:${port}`)
})