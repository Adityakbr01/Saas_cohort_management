import { env_config } from "@/configs/env";
import jwt from "jsonwebtoken";

/**
 * Generates a JWT token
 * @param userId - MongoDB user ID
 * @param role - User role (e.g., "admin", "user")
 * @returns Signed JWT token
 */
export const generateToken = (userId: string, role: string): string => {
  if (!env_config.JWT_SECRET ||!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(
    { id: userId, role },
   env_config.JWT_SECRET|| process.env.JWT_SECRET,
    {
      expiresIn: "7d", // token valid for 7 days
    }
  );
};
