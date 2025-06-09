import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['basic', 'pro', 'business'],
    required: true,
    unique: true,
  },
  price: {
    type: Number,
    required: true,
  }
}, { timestamps: true });

export const SubscriptionModel = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
