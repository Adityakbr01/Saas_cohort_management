import { Request, Response } from "express";
import { registerUser } from "@/services/user.service";
import { sendSuccess } from "@/utils/responseUtil";
import { wrapAsync } from "@/utils/wrapAsync";

// Register controller
export const registerController = wrapAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role, organization } = req.body;

    // Call service to register user
    const user = await registerUser({
      name,
      email,
      password,
      role,
      organization,
    });

    // Return success response
    sendSuccess(res, 201, "User registered successfully", user);
    return;
  }
);
