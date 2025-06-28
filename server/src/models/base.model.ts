// base.model.ts
import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Types } from "mongoose";

// Common interface for auth-related fields
export interface IBaseUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  otp?: string;
  otpExpiry?: Date;
  lastLogin?: Date;
  tokenVersion: number;
  refreshToken?: {
    token: string;
    expiresAt: Date;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
    suspended: {
    isSuspended: boolean;
    suspendedAt: Date | null;
    reason: string;
  };
  phone?: string;
  bio?: string;
  location?: string;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
  invalidateAllTokens(): Promise<void>;
}

// Common schema for auth-related fields
const baseUserSchema = new Schema<IBaseUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: { type: String, required: true, select: false },
    role: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    otp: { type: String, select: false },
    otpExpiry: { type: Date, select: false },
    lastLogin: { type: Date },
    tokenVersion: { type: Number, default: 0 },
    refreshToken: {
      token: { type: String },
      expiresAt: { type: Date },
      createdAt: { type: Date, default: Date.now },
    },
        suspended: {
      isSuspended: { type: Boolean, default: false },
      suspendedAt: { type: Date, default: null },
      reason: { type: String, default: "" },
    },
    phone: { type: String, required: false },
    location: { type: String, required: false },
    bio: { type: String, required: false },
  },
  { timestamps: true }
);

// Pre-save hook for password hashing
baseUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance methods
baseUserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

baseUserSchema.methods.generateAuthToken = function (): string {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role,
    tokenVersion: this.tokenVersion,
  };
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: "12h",
  });
};

baseUserSchema.methods.generateRefreshToken = function (): string {
  const payload = {
    id: this._id,
    email: this.email,
    tokenVersion: this.tokenVersion,
    role: this.role,
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "30d",
  });
};

baseUserSchema.methods.invalidateAllTokens = async function (): Promise<void> {
  this.tokenVersion += 1;
  this.refreshToken = undefined; // Clear the single refresh token
  await this.save();
};

// Static method
baseUserSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email }).select(
    "+password +otp +otpExpiry +refreshToken +tokenVersion"
  );
};

export default baseUserSchema;