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
  price: z.number().min(0, "Price must be a positive number"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  features: z.array(z.string()).min(5, "At least five feature is required"),
  popular: z.boolean(),
});
