import express from "express";
import { validateRequest } from "@/middleware/validateRequest";
import { validateRegisterInput } from "@/utils/zod/user";
import { registerController } from "@/controllers/userController";

const router = express.Router();

router.post("/register",validateRequest(validateRegisterInput),registerController)


export default router;
