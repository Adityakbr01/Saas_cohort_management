import User, { IUser } from "@/models/userModel";

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