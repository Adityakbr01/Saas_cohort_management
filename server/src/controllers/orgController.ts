import { OrganizationService } from "@/services/organization.service";
import { sendSuccess } from "@/utils/responseUtil";
import { wrapAsync } from "@/utils/wrapAsync";
import { Request, Response } from "express";

export const orgController = {
  createOrg: wrapAsync(async (req: Request, res: Response) => {
    const { name, logo } = req.body;
    const userId = req.user?.id;

    const organization = await OrganizationService.createOrganization({
      name,
      logo,
      ownerId: userId,
    });

    sendSuccess(res, 201, "Organization created successfully", organization);
  }),
};
