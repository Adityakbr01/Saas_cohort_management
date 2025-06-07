import User, { IUser } from "@/models/userModel";
import { Types } from "mongoose";

export const findAllUsers = () => User.find().select("-password");

export const findUserById = (id: string) =>
  User.findById(id).select("-password");

export const createUserInDB = (data: { name: string; email: string,password:string }) =>
  User.create(data);

export const updateUserById = (id: string, data: Partial<{ name: string; email: string }>) =>
  User.findByIdAndUpdate(id, data, { new: true }).select("-password");

export const deleteUserById = (id: string) =>
  User.findByIdAndDelete(id);

export const findUserByEmail = (email: string): Promise<IUser | null> => {
  return User.findOne({ email }).select("+password") as Promise<IUser | null>;
};


interface UserInput {
  name: string;
  email: string;
  password: string;
  role: "super_admin" | "mentor" | "student" | "org_admin";
  organization?: Types.ObjectId;
  profile: {
    bio: string;
    skills: string[];
    xp: number;
    streak: number;
  };
}

export const createUser = async (userData: UserInput): Promise<IUser> => {
  const user = await User.create(userData);
  return user;
};