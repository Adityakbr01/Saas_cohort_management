import { Role } from "@/configs/roleConfig";
import { orgController } from "@/controllers/orgController";
import { protect, restrictTo } from "@/middleware/authMiddleware";
import { uploadMedia } from "@/middleware/multerConfig";
import { validateRequest } from "@/middleware/validateRequest";
import Organization from "@/models/organizationModel";
import PendingInvite from "@/models/PendingInvite";
import { createOrgSchema, inviteMentorSchema } from "@/utils/zod/org";
import express from "express";
const router = express.Router();

router.post(
  "/create",
  uploadMedia("logo"),
  validateRequest(createOrgSchema),
  protect,
  restrictTo(Role.org_admin),
  orgController.createOrg
);
router.get("/myOrg", protect, orgController.getmyOrg);
//Todo : Invite New Mentor jab frontend me email dalu to automatically data fetch kar ke fronted fill ho jaye like exprince,specliest amany more fields.
router.post(
  "/invite",
  validateRequest(inviteMentorSchema),
  protect,
  restrictTo(Role.org_admin, Role.organization),
  orgController.inviteUserToOrg
);

router.get("/resend-invite", protect, orgController.resendInvite);
router.post("/cencel-invite", protect, orgController.cancelInvite);
router.delete("/delete-Mentor", protect, orgController.deleteMentor);
router.get("/accept-invite", orgController.acceptInvite);
// POST /api/org/approve-invite
router.post(
  "/approve-invite",
  protect,
  restrictTo(Role.org_admin, Role.organization),
  orgController.finalizeInvite
);
router.get(
  "/pending-invites/:orgId",
  protect,
  restrictTo(Role.org_admin, Role.organization),
  async (req, res) => {
    const org = await Organization.findById(req.user.id);

    const invites = await PendingInvite.find({
      invitedBy: req?.user.id,
      status: { $in: ["PENDING_USER", "PENDING_ADMIN"] },
    });
    console.log(invites);
    res.json(invites);
  }
);
router.get(
  "/",
  protect,
  restrictTo(Role.super_admin),
  orgController.getAllOrgs
);
router.get(
  "/getOrgMentors",
  protect,
  restrictTo(Role.org_admin, Role.organization),
  orgController.getOrgMentors
);
router.post(
  "/getMentorsDetails",
  protect,
  restrictTo(Role.organization, Role.super_admin),
  orgController.getMentorDetails
);

export default router;
