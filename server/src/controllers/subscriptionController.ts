import { SubscriptionService } from '@/services/subscription.service';
import { sendError, sendSuccess } from '@/utils/responseUtil';
import { wrapAsync } from '../utils/wrapAsync'; // adjust path as needed

export const SubscriptionController = {
  createSubscriptionController: wrapAsync(async (req, res) => {
    const { price, name,description,features,popular } = req.body;
    const userId = req.user?.id; 
    if (!userId) {
       sendError(res, 400, 'User ID is required');
       return
    }
    const created = await SubscriptionService.createSubscription({ price, name,description,features,popular,userId });
    sendSuccess(res, 201, 'Subscription created', created);
  }),

  getAllSubscriptions: wrapAsync(async (req, res) => {
    const subs = await SubscriptionService.getAllSubscriptions();
    sendSuccess(res, 200, 'Subscriptions fetched', subs);
  }),

  getSubscriptionById: wrapAsync(async (req, res) => {
    const sub = await SubscriptionService.getSubscriptionById(req.params.id);
    sendSuccess(res, 200, 'Subscription fetched', sub);
  }),

  updateSubscription: wrapAsync(async (req, res) => {
    const updated = await SubscriptionService.updateSubscription(req.params.id, req.body);
    sendSuccess(res, 200, 'Subscription updated', updated);
  }),

  deleteSubscription: wrapAsync(async (req, res) => {
    const deleted = await SubscriptionService.deleteSubscription(req.params.id);
    sendSuccess(res, 200, 'Subscription deleted', deleted);
  }),
};



