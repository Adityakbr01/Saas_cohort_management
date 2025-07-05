import { MentorService } from "@/services/mentor.service";
import { sendSuccess } from "@/utils/responseUtil";
import { wrapAsync } from "@/utils/wrapAsync";

export const MentorController = {
  acceptinvitementor: wrapAsync(async (req, res) => {
    const token = req.query.token as string;
    const { redirectUrl } = await MentorService.acceptInviteMentor({ token });
    res.redirect(redirectUrl);
  }),

  getMyOrganizations: wrapAsync(async (req, res) => {
    const userId = req.user?.id;
    const orgs = await MentorService.getMyOrganizations(userId);
    res.json(orgs);
  }),

  getMentorCohorts: wrapAsync(async (req, res) => {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await MentorService.getMentorCohorts(userId, page, limit);

    sendSuccess(res, 200, "All cohorts", result);
  }),
};
