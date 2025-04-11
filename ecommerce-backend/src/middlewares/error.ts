import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/utility-class.js";
import { ControllerType } from "../types/types.js";

export const errorMiddleware = (
  err: ErrorHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Short form of this err.message = err.message || "";
  err.message ||= "Internal Server Error";
  err.statusCode ||= 500;

  // Product ID doesn't exist while ordering it gives Cast Error which is detected by MONGODB because it generates its own ID so to give custom error message we do this below step

  if(err.name === "CastError") err.message = "Invalid ID"

  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};

export const TryCatch = (func: ControllerType) => (req: Request, res: Response, next: NextFunction) =>{
    return Promise.resolve(func(req, res, next)).catch(next);
    // If there is an error catch will call error and next will help to show the error using middleware
};
// The type ControllerType refers to the type of a controller function, which typically takes req, res, and next as parameters (as in Express route handlers).

// Ensures Proper Error Propagation:
// If an error occurs in the asynchronous function (func), it will be caught and forwarded to the error-handling middleware via next(error). This is essential for centralized error handling in Express.
// Without this wrapper, you'd need to manually forward errors to the next function in every controller function.
// The wrapper helps ensure that even if an error occurs, it doesn't crash the server. Instead, it gets passed to the next middleware that is responsible for handling errors (like logging the error or returning a structured error response).

// Works with Both Async and Sync Functions:
// The Promise.resolve makes sure the wrapper works even if the controller function is synchronous. If the function is asynchronous, it automatically gets treated as a promise.
// This flexibility ensures that the error-handling behavior is consistent across both async and sync code.