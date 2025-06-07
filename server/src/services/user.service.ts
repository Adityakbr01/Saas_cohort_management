import {
  findAllUsers,
  findUserById,
  findUserByEmail,
  createUserInDB,
  updateUserById,
  deleteUserById,
} from "@/dao/user.dao";
import User from "@/models/userModel";
import { IUser } from "@/models/userModel";
import { ApiError } from "@/utils/apiError";
import cache from "@/utils/cache";
import { generateToken } from "@/utils/tokenUtil";

// ✅ GET ALL USERS (Cached)
export const getAllUsersService = async () => {
  const cacheKey = "all_users";

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const users = await findAllUsers();
  cache.set(cacheKey, users, 600); // 10 minutes

  return users;
};

// ✅ GET USER BY ID (Cached)
export const getUserByIdService = async (id: string) => {
  const cacheKey = `user_${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const user = await findUserById(id);
  if (!user) throw new ApiError(404, "User not found");

  cache.set(cacheKey, user, 600); // 10 minutes
  return user;
};

// ✅ CREATE USER (invalidate "all_users" cache)
export const createUserService = async (
  name: string,
  email: string,
  password: string
) => {
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }

  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new ApiError(400, "Email already exists");
  }

  const newUser = await createUserInDB({ name, email, password });

  cache.del("all_users"); // 🔁 invalidate users list cache

  return newUser;
};

// ✅ UPDATE USER (invalidate individual + all_users cache)
export const updateUserService = async (
  id: string,
  data: Partial<{ name: string; email: string }>
) => {
  if (!data.name && !data.email) {
    throw new ApiError(400, "At least one field (name or email) is required");
  }

  const updatedUser = await updateUserById(id, data);
  if (!updatedUser) throw new ApiError(404, "User not found");

  cache.del("all_users");
  cache.del(`user_${id}`);

  return updatedUser;
};

// ✅ DELETE USER (invalidate individual + all_users cache)
export const deleteUserService = async (id: string) => {
  const deletedUser = await deleteUserById(id);
  if (!deletedUser) throw new ApiError(404, "User not found");

  cache.del("all_users");
  cache.del(`user_${id}`);

  return deletedUser;
};

// ✅ FIND USER BY EMAIL (no cache - usually used for login)
export const findUserByEmailService = async (email: string) => {
  return await User.findOne({ email });
};


export const loginUserService = async (
  email: string,
  password: string
): Promise<{
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}> => {
  const user = (await findUserByEmail(email)) as IUser;

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user._id.toString(), user.role);

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
