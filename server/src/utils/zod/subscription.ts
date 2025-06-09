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
  price: z.number().positive("Price must be a positive number"),
});
