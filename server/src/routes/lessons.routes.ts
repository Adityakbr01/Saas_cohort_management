import express from "express"; import { protect, restrictTo } from "@/middleware/authMiddleware";
import { Role } from "@/configs/roleConfig";
import { validateRequest } from "@/middleware/validateRequest";
// import { uploadMedia } from "@/middleware/multerConfig"; import { createLessonSchema, updateLessonSchema } from "@/utils/zod/lessonSchema";
import { LessonController } from "@/controllers/lesson.controller";
import { uploadMedia } from "@/middleware/multerConfig";
import { createLessonSchema } from "@/utils/zod/lessonSchema";
const router = express.Router();
// Create lesson under a chapterrouter.post
router.post(
    "/:chapterId", uploadMedia("video"),
    protect, restrictTo(Role.organization, Role.mentor),
    validateRequest(createLessonSchema),
    LessonController.createLessonUnderChapter);



    //Delete lesson with id
    router.delete(
        "/:lessonId",
        protect,
        restrictTo(Role.organization, Role.mentor),
        LessonController.deleteLesson
    );

// // Update lessonrouter.put(
// "/chapter/:chapterId/:lessonId", protect,
//     restrictTo(Role.organization, Role.mentor),
//     validateRequest(updateLessonSchema),
//     LessonController.updateLesso);
// // Update lesson positionrouter.put(
// "/:lessonId/position", protect,
//     restrictTo(Role.organization, Role.mentor),
//     LessonController.updateLessonPosition);
// // Get all lessons of a chapterrouter.get("/chapter/:chapterId", protect, LessonController.getLessonsByChapter);


// // Delete lesson
// router.delete("/:lessonId",
//     protect, restrictTo(Role.organization, Role.mentor),
//     LessonController.deleteLesson);

export default router;























