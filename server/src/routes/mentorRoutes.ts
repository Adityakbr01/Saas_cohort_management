import { Role } from "@/configs/roleConfig";
import { protect, restrictTo } from "@/middleware/authMiddleware";
import express from "express";
const router = express.Router();

import { MentorController } from "@/controllers/mentorController";

router.get("/accept-invite-mentor", MentorController.acceptinvitementor);

router.get("/getmyorg", protect, MentorController.getMyOrganizations);

//get all my org cohorts
router.get(
  "/getmentorCohorts",
  protect,
  restrictTo(Role.mentor),
  MentorController.getMentorCohorts
);

export default router;
