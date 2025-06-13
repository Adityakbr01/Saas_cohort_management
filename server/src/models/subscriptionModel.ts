import mongoose, { Document } from "mongoose";
import { number } from "zod";

export interface ISubscriptionPlan extends Document {
  _id: mongoose.Types.ObjectId;
  name: "basic" | "pro" | "business";
  price: number;
  yearlyPrice:number;
  description: string;
  features: string[];
  popular?: boolean;
  subscribers?: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
  Owner: mongoose.Types.ObjectId; // Reference to the User who owns this subscription plan
  tax: number;
  discount:number
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
    yearlyPrice:{
      type:Number,
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
    Owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tax: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },

  },
  { timestamps: true }
);

export const SubscriptionModel = mongoose.model<ISubscriptionPlan>(
  "SubscriptionPlan",
  subscriptionPlanSchema
);
