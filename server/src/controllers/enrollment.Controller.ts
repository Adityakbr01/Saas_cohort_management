// // controllers/enrollmentController.ts
// import { Request, Response } from "express";
// import { CohortEnrollment } from "../models/CohortEnrollment";
// import { Cohort } from "@/models/cohort.model";

// export const enrollUserToCohort = async (req: Request, res: Response) => {
//   try {
//     const { userId, cohortId } = req.body;

//     const existing = await CohortEnrollment.findOne({ user: userId, cohort: cohortId });
//     if (existing) {
//       return res.status(400).json({ message: "User already enrolled in this cohort." });
//     }

//     const enrollment = await CohortEnrollment.create({
//       user: userId,
//       cohort: cohortId,
//     });

//     Cohort.students.push(userId);
//     await Cohort.save();

//     res.status(201).json({
//       message: "User enrolled successfully",
//       enrollment,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Enrollment failed", error });
//   }
// };
