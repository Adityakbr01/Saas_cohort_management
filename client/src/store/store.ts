import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "./features/auth/authApi";
import {subscriptionApi} from "@/store/features/api/superAdmin/superAdminApi"
import { plansApi } from "./features/api/plans/planApi";
import { paymentApi } from "./features/api/payment/payment";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [plansApi.reducerPath] : plansApi.reducer,
    [paymentApi.reducerPath]:paymentApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, subscriptionApi.middleware,plansApi.middleware,paymentApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

setupListeners(store.dispatch);

// type support ke liye
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
