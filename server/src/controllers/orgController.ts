import Organization from "@/models/organizationModel";
import { OrganizationService } from "@/services/organization.service";
import { sendSuccess } from "@/utils/responseUtil";
import { wrapAsync } from "@/utils/wrapAsync";
import { Request, Response } from "express";

export const orgController = {
  createOrg: wrapAsync(async (req: Request, res: Response) => {
    const { name, logo } = req.body;
    const userId = req.user?.id;

    console.log(req.body)
    const organization = await OrganizationService.createOrganization({
      name,
      logo,
      ownerId: userId,
    });

    sendSuccess(res, 201, "Organization created successfully", organization);
  }),

  getmyOrg:wrapAsync(async(req: Request, res: Response)=>{

    const userId = req.user.id

    const org = await Organization.findOne({ownerId:userId})

    console.log(org)
    sendSuccess(res,200,"Org fetch succces",org)

  }),
  // Fetch all organizations for a super admin
  getAllOrgs: wrapAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const organizations = await OrganizationService.getAllOrg({
      userId,
      page,
      limit,
    });

    sendSuccess(res, 200, "Organizations fetched successfully", organizations);
  }),

  // Fetch all users in an organization
  getOrgUsers: wrapAsync(async (req: Request, res: Response) => {
    const orgId = req.params.orgId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await OrganizationService.getOrgUsers({ orgId, page, limit });
    sendSuccess(res, 200, "Organization users fetched successfully", data);
  }),
};
