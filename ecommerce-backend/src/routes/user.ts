import express from "express";
import { deleteUser, getAllUsers, getUser, newUser } from "../controllers/user.js";
import { adminOnly } from "../middlewares/auth.js";


const app = express.Router();

// route - /api/v1/user/new
app.post("/new", newUser);


// route - /api/v1/user/all
// adminOnly is a middleware
app.get("/all", adminOnly, getAllUsers);

// route - /api/v1/user/dynamicID
app.get("/:id", getUser);

// route - /api/v1/user/dynamicID
app.delete("/:id", adminOnly, deleteUser);

// Can also do that it is called chaining
// app.route(":/").get(getUser).delete(deleteUser);

export default app;