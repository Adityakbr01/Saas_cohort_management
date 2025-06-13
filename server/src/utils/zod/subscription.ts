import z from 'zod';

// For fetching or returning a full subscription
export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  planId: z.string().uuid(),
  status: z.enum(['active', 'inactive', 'canceled']),
  startDate: z.date(),
  endDate: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ✅ Correct CreateSubscriptionSchema
export const CreateSubscriptionSchema = z.object({
  name: z.enum(['basic', 'pro', 'business'], {
    errorMap: () => ({ message: "Invalid subscription plan name" })
  }),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  yearlyPrice: z.number().min(0, { message: "Yearly price must be a positive number" }),
  tax: z.number().min(0).max(100).default(18), // 0–100% GST
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  features: z.array(z.string()).min(5, { message: "At least five features are required" }),
  popular: z.boolean(),
});

