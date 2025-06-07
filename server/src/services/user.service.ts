import { Types } from "mongoose";
import { ApiError } from "@/utils/apiError";
import { createUser, findUserByEmail } from "@/dao/user.dao";

interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role?: "super_admin" | "mentor" | "student" | "org_admin";
  organization?: string;
}

export const registerUser = async (input: RegisterUserInput) => {
  const { name, email, password, role, organization } = input;

  // Check if email already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new ApiError(400,"Email already in use");
  }

  const userData = {
    name,
    email,
    password,
    role: role || "student",
    organization: organization ? new Types.ObjectId(organization) : undefined,
    profile: {
      bio: "",
      skills: [],
      xp: 0,
      streak: 0,
    },
  };

  // Create user via DAO
  const user = await createUser(userData);
  return user;
};