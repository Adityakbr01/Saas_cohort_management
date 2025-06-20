import mongoose, { Document, Schema, Model, Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { boolean } from "zod";

// RefreshToken Interface
interface RefreshToken {
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// Instance Methods
interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
  generateRefreshToken(): string;
  invalidateAllTokens(): Promise<void>;
}

// User Document Interface
export interface IUser extends Document, IUserMethods {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: "super_admin" | "mentor" | "student" | "org_admin";
  organization: Types.ObjectId;
  profile: {
    bio?: string;
    skills?: string[];
    xp?: number;
    streak?: number;
  };
  isVerified: boolean;
  createdAt: Date;
  isActive: boolean;
  lastLogin: Date;
  tokenVersion: number;
  refreshTokens: RefreshToken[];
  otp?: string;
  otpExpiry?: Date;
  plan?: Types.ObjectId; // Reference to SubscriptionPlan
  subscriptionMeta: {
    startDate: Date; // Start date of the subscription,
    expiresDate: Date | null; // Nullable for plans that don't expire,
    isActive: boolean; // Indicates if the subscription is active
    isExpired: boolean; // Indicates if the subscription is expired
  };
  suspended?: boolean; // Optional field for suspension status

  //New fields
  Education?: [
    {
      degree: string;
      institution: string;
      year: string;
    }
  ];
  Experience?: {
    role: string;
    company: string;
    year: string;
  };
  Skills?: string[];

  Certifications?: {
    name: string;
    issuer: string;
    date: Date;
  }[];
}

// Static methods
interface UserModel extends Model<IUser, {}, IUserMethods> {
  findByEmailWithPassword(email: string): Promise<IUser | null>;
}

// Schema
const userSchema = new Schema<IUser, UserModel>(
  {
    name: { type: String, required: true, trim: true },
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
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["super_admin", "mentor", "student", "org_admin"],
      default: "student",
    },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
      required: false, // Optional field for subscription plan
      default: null,
    },
    subscriptionMeta: {
      startDate: { type: Date, default: Date.now },
      expiresDate: { type: Date },
      isExpired: Boolean,
      isActive: Boolean,
    },
    suspended: {
      type: Boolean,
      default: false,
    },

    profile: {
      bio: { type: String, default: "" },
      skills: { type: [String], default: [] },
      xp: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    tokenVersion: {
      type: Number,
      default: 0,
    },
    refreshTokens: [
      {
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    //New fields
    Education: [
      {
        degree: String,
        institution: String,
        year: String,
      },
    ],
    Experience: {
      role: String,
      company: String,
      year: String,
    },
    Skills: [String],
    Certifications: [
      {
        name: String,
        issuer: String,
        date: Date,
      },
    ],
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ createdAt: 1 });
userSchema.index({ organization: 1 });

// Pre-save hash
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function (): string {
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

userSchema.methods.generateRefreshToken = function (): string {
  const payload = {
    id: this._id,
    email: this.email,
    tokenVersion: this.tokenVersion,
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: "30d",
  });
};

userSchema.methods.invalidateAllTokens = async function (): Promise<void> {
  this.tokenVersion += 1;
  this.refreshTokens = [];
  await this.save();
};

// Static method
userSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email }).select(
    "+password +otp +otpExpiry +refreshTokens"
  );
};

// Final export
const User = mongoose.model<IUser, UserModel>("User", userSchema);
export default User;
