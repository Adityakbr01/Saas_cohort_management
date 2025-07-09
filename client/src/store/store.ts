import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authApi } from "./features/auth/authApi";
import {subscriptionApi} from "@/store/features/api/superAdmin/superAdminApi"
import { plansApi } from "./features/api/plans/planApi";
import { paymentApi } from "./features/api/payment/payment";
import { orgApi } from "./features/api/organization/orgApi";
import {mentorApi} from "./features/api/mentor/mentorApi";
import {cohortsApi} from "./features/api/cohorts/cohorts.api";
import {chapterApi} from "./features/api/chapters/chapter";
import {lessonApi} from "./features/api/lessons/lesson"

import authReducer from "@/store/features/slice/UserAuthSlice"; // ✅ correct path lagayein

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [subscriptionApi.reducerPath]: subscriptionApi.reducer,
    [plansApi.reducerPath] : plansApi.reducer,
    [paymentApi.reducerPath]:paymentApi.reducer,
    [orgApi.reducerPath]:orgApi.reducer,
    [mentorApi.reducerPath]:mentorApi.reducer,
    [cohortsApi.reducerPath]:cohortsApi.reducer,  
    [chapterApi.reducerPath]:chapterApi.reducer,
    [lessonApi.reducerPath]:lessonApi.reducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, subscriptionApi.middleware,plansApi.middleware,paymentApi.middleware,orgApi.middleware,mentorApi.middleware,cohortsApi.middleware,chapterApi.middleware,lessonApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

setupListeners(store.dispatch);

// type support ke liye
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
