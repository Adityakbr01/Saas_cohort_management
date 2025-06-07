import { Role } from "@/configs/roleConfig";
import { orgController } from "@/controllers/orgController";
import { protect, restrictTo } from "@/middleware/authMiddleware";
import { validateRequest } from "@/middleware/validateRequest";
import { CreateOrgInput } from "@/utils/zod/org";
import express from "express";
const router = express.Router();

router.post(
  "/create",
  validateRequest(CreateOrgInput),
  protect,
  restrictTo(Role.org_admin),
  orgController.createOrg
);

export default router;
