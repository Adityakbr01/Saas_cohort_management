import express from 'express';


import { Role } from '@/configs/roleConfig';
import { SubscriptionController } from '@/controllers/subscriptionController';
import { protect, restrictTo } from '@/middleware/authMiddleware';
import { validateRequest } from '@/middleware/validateRequest';
import { CreateSubscriptionSchema } from '@/utils/zod/subscription';

const router = express.Router();



router.post(
  '/create',
  validateRequest(CreateSubscriptionSchema),
  protect,
  restrictTo(Role.super_admin),
  SubscriptionController.createSubscriptionController
);

router.get(
  '/',
  SubscriptionController.getAllSubscriptions
);

router.get(
  '/:id',
  protect,
  SubscriptionController.getSubscriptionById
);

router.put(
  '/:id',
  protect,
  restrictTo(Role.super_admin),
  validateRequest(CreateSubscriptionSchema),
  SubscriptionController.updateSubscription
);

router.delete(
  '/:id',
  protect,
  restrictTo(Role.super_admin),
  SubscriptionController.deleteSubscription
);

export default router;  