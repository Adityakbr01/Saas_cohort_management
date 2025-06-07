// utils/zod/org.ts

import { z } from "zod";

export const CreateOrgInput = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  logo: z.string().url().optional().nullable(),
});

