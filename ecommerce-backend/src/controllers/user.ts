import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.js";
import { NewUserRequestBody } from "../types/types.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";

// Creating New User
export const newUser = TryCatch(
  async (
    req: Request<{}, {}, NewUserRequestBody>, //for custom use this is created in types folder
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, photo, gender, _id, dob } = req.body;
    // Finding Existing User
    let user = await User.findById(_id);
    if (user) {
      return res.status(200).json({
        success: true,
        message: `Welcome, ${user.name}`,
      });
    }

    if (!_id || !name || !photo || !gender || !dob) {
      return next(new ErrorHandler("Please add all fields", 400));
    }

    // Creating new User
    user = await User.create({
      name,
      email,
      photo,
      gender,
      _id,
      dob: new Date(dob),
    });

    return res.status(201).json({
      success: true,
      message: `Welcome, ${user.name}`,
    });
  }
);

// Getting All Users
export const getAllUsers = TryCatch(async (req, res, next) => {
  const users = await User.find({});

  return res.status(200).json({
    success: true,
    users,
  });
});

// Getting Single User
export const getUser = TryCatch(async (req, res, next) => {

  const id = req.params.id;
  const user = await User.findById(id);

  if(!user){
    return next(new ErrorHandler("Invalid ID", 400));
  }

  return res.status(200).json({
    success: true,
    user,
  });
});

// Deleting Single User
export const deleteUser = TryCatch(async (req, res, next) => {

  const id = req.params.id;
  const user = await User.findById(id);

  if(!user){
    return next(new ErrorHandler("Invalid ID", 400));
  }

  await user.deleteOne();

  return res.status(200).json({
    success: true,
    message:"User Deleted Successfully",
  });
});
