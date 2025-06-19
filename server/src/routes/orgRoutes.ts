import { Role } from "@/configs/roleConfig";
import { orgController } from "@/controllers/orgController";
import { protect, restrictTo } from "@/middleware/authMiddleware";
import { uploadLogo } from "@/middleware/multerConfig";
import { validateRequest } from "@/middleware/validateRequest";
import Organization from "@/models/organizationModel";
import PendingInvite from "@/models/PendingInvite";
import User from "@/models/userModel";
import { createOrgSchema } from "@/utils/zod/org";
import express from "express";
const router = express.Router();

router.post(
  "/create",
  uploadLogo,
  validateRequest(createOrgSchema),
  protect,
  restrictTo(Role.org_admin),
  orgController.createOrg
);

router.get("/myOrg", protect, orgController.getmyOrg);

router.post(
  "/invite",
  protect,
  restrictTo(Role.org_admin),
  orgController.inviteUserToOrg
);
router.get("/accept-invite", orgController.acceptInvite);
// POST /api/org/approve-invite
router.post(
  "/approve-invite",
  protect,
  restrictTo(Role.org_admin),
  orgController.finalizeInvite
);
router.get(
  "/pending-invites/:orgId",
  protect,
  restrictTo(Role.org_admin),
  async (req, res) => {

  

   const user =  await User.findById(req.user.id);

   const org = await Organization.findOne({ ownerId: user?.id });
   console.log(org);

    const invites = await PendingInvite.find({
      orgId:org?.id,
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
  "/:orgId/users",
  protect,
  restrictTo(Role.org_admin, Role.mentor),
  orgController.getOrgUsers
);

export default router;
