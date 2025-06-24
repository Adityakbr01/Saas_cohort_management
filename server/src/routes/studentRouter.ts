// import express from "express";
// import { validateRequest } from "@/middleware/validateRequest";
// import {
//   loginInput,
//   resendOtpInput,
//   updateProfileInput,
//   validateRegisterInput,
//   validateRegisterInputcomplate,
// } from "@/utils/zod/user";
// import { StudentController } from "@/controllers/studentController";
// import { protect, restrictTo } from "@/middleware/authMiddleware";
// import { Role } from "@/configs/roleConfig";
// import { createDynamicRateLimiter } from "@/middleware/rateLimitMiddleware";

// const router = express.Router();


// //Done ✅
// router.post(
//   "/register/initiate",
//   validateRequest(validateRegisterInput),
//   StudentController.initiateRegistrationController
// );
// //Done ✅
// router.post(
//   "/register/complete",
//   validateRequest(validateRegisterInputcomplate),
//   StudentController.complateRegisterController
// );
// //Done ✅
// router.post(
//   "/resend-otp",
//   createDynamicRateLimiter({
//     timeWindow: 10, // 10 minutes
//     maxRequests: 3, // Limit to 3 requests per 10 minutes
//   }),
//   validateRequest(resendOtpInput),
//   StudentController.resendOTPController
// );
// //Done ✅
// router.post(
//   "/login",
//   validateRequest(loginInput),
//   StudentController.loginController
// );
// //Done ✅
// router.get("/profile", protect, StudentController.profile);

// //Done ✅
// router.patch(
//   "/profile",
//   validateRequest(updateProfileInput),
//   protect,
//   StudentController.updateProfile
// );
// //Done ✅
// router.post("/logout", protect, StudentController.logout);

// //Pending || Todo
// router.delete("/delete", protect, StudentController.deleteUser);

// //Done ✅
// router.post("/initiate-forgot-password",createDynamicRateLimiter({
//   timeWindow: 1, // 1 minute
//   maxRequests: 5, // Limit to 5 requests per minute
// }), StudentController.initiateforgotPassword);
// //Done ✅
// router.post("/complete-forgot-password", StudentController.completeforgotPassword);
// //Done ✅
// router.post("/resend-forgot-password-otp",createDynamicRateLimiter({
//   timeWindow: 10,
//   maxRequests: 4,
// }), StudentController.resendForgotPasswordOtp);

// //Done ✅
// router.get("/refresh-token", StudentController.refreshAccessToken);

// export default router;
