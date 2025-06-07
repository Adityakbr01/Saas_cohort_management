import mongoose, { Document, Schema, Model, Types } from "mongoose";
import bcrypt from "bcrypt";

// Interface for User document
export interface IUser extends Document {
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
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User Schema
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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
    profile: {
      bio: { type: String, default: "" },
      skills: { type: [String], default: [] },
      xp: { type: Number, default: 0 },
      streak: { type: Number, default: 0 },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for performance
userSchema.index({ createdAt: 1 });
userSchema.index({ organization: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export User model
const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;