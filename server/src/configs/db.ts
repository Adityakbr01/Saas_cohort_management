import mongoose from "mongoose";
import { logger } from "@/utils/logger.js";

const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    await mongoose.connect(MONGO_URI);
    logger.info("✅ MongoDB connected successfully");
  } catch (error) {
    logger.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
