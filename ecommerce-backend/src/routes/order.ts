import express from "express";
import { allOrders, deleteOrder, getOrderDetail, myOrders, newOrder, processOrder } from "../controllers/order.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

app.post("/new", newOrder);

// My orders
app.get("/my", myOrders);

// All orders
app.get("/all", adminOnly ,allOrders);

// Single order Detail & Update & Delete
app.route("/:id").get(getOrderDetail).put(adminOnly, processOrder).delete(adminOnly, deleteOrder);

export default app;