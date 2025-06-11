import mongoose, { Document } from "mongoose";

export interface ISubscriptionPlan extends Document {
  name: "basic" | "pro" | "business";
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  subscribers?: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const subscriptionPlanSchema = new mongoose.Schema<ISubscriptionPlan>(
  {
    name: {
      type: String,
      enum: ["basic", "pro", "business"],
      required: true,
      unique: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    features: {
      type: [String],
      required: true,
      validate: {
        validator: function (val: string[]) {
          return val.length >= 5;
        },
        message: "At least 5 features are required.",
      },
    },
    popular: {
      type: Boolean,
      default: false,
    },
    subscribers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  { timestamps: true }
);

export const SubscriptionModel = mongoose.model<ISubscriptionPlan>(
  "SubscriptionPlan",
  subscriptionPlanSchema
);
