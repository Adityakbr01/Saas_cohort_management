import { Request, Response } from "express";
import {
  getAllUsersService,
  getUserByIdService,
  createUserService,
  updateUserService,
  deleteUserService,
  loginUserService,
} from "@/services/user.service";
import { sendError, sendSuccess } from "@/utils/responseUtil";
import { wrapAsync } from "@/utils/wrapAsync";

export const getAllUsers = wrapAsync(async (
  req: Request,
  res: Response
) => {
  const users = await getAllUsersService();
  sendSuccess(res, 200, "Users fetched successfully", users);
});

export const getUserById = wrapAsync(async (
  req: Request,
  res: Response
) => {
  const user = await getUserByIdService(req.params.id);
  sendSuccess(res, 200, "User fetched successfully", user);
});

export const createUser = wrapAsync(async (
  req: Request,
  res: Response
) => {
  const { name, email,password } = req.body;
  const user = await createUserService(name, email,password);
  sendSuccess(res, 201, "User created successfully", user);
});

export const updateUser = wrapAsync(async (
  req: Request,
  res: Response
) => {
  const userId = req.params.id;
  const updateData = req.body;
  const updatedUser = await updateUserService(userId, updateData);
  sendSuccess(res, 200, "User updated successfully", updatedUser);
});

export const deleteUser = wrapAsync(async (
  req: Request,
  res: Response
) => {
  const userId = req.params.id;
  const deletedUser = await deleteUserService(userId);
  sendSuccess(res, 200, "User deleted successfully", deletedUser);
});

export const loginUser = wrapAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    sendError(res, 400, "Please provide email and password");
    return;
  }

  const { token, user } = await loginUserService(email, password);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, 200, "Login successful", user);
});
