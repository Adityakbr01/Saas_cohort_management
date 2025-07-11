import { TooltipProvider } from "@/components/ui/tooltip";
import { useCreateChapterMutation } from "@/store/features/api/chapters/chapter";
import { useGetCohortByIdQuery } from "@/store/features/api/cohorts/cohorts.api";
import { useState } from "react";
import { z } from "zod";
import AddModuleDialog from "./AddModuleDialog";
import CurriculumHeader from "./CurriculumHeader";
import CurriculumOverview from "./CurriculumOverview";
import EditItemDialog from "./EditItemDialog";
import ModuleList from "./ModuleList";
import type { Chapter, Lesson } from "@/types";
import type { ChapterSchema } from "@/utils/zod";



// Mock curriculum data
// const curriculumData = {
//     cohortId: "cohort_1",
//     cohortName: "Data Science Bootcamp - Fall 2024",
//     modules: [
//         {
//             id: "module_1",
//             title: "Python Fundamentals",
//             description: "Introduction to Python programming language",
//             duration: "2 weeks",
//             order: 1,
//             status: "completed",
//             lectures: [
//                 {
//                     id: "lecture_1_1",
//                     title: "Variables and Data Types",
//                     type: "video",
//                     duration: "45 min",
//                     order: 1,
//                     status: "completed",
//                     description: "Learn about Python variables and basic data types",
//                 },
//                 // Additional lectures omitted for brevity
//             ],
//         },
//         // Additional modules omitted for brevity
//     ],
// };

interface CurriculumBuilderProps {
    cohortId: string;
    onBack: () => void;
}



export type DragItem =
    | (Chapter & { type: "module" })
    | (Lesson & { type: "lecture" });


// Main CurriculumBuilder Component
export default function CurriculumBuilder({ cohortId, onBack }: CurriculumBuilderProps) {
    // const [curriculum, setCurriculum] = useState(curriculumData);
    // const [draggedItem, setDraggedItem] = useState<Chapter | Lesson | null>(null);
    // const [dragOverItem, setDragOverItem] = useState<Chapter | Lesson | null>(null);
    const [isAddingModule, setIsAddingModule] = useState(false);
    // const [isAddingLecture, setIsAddingLecture] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<Chapter | Lesson | null>(null);

    const [createChapter] = useCreateChapterMutation();
    const { data, isLoading, error, refetch } = useGetCohortByIdQuery(cohortId, { skip: !cohortId });

    const chapters = data?.data?.chapters || [];

    // Calculate duration in weeks
    const start = new Date(data?.data?.startDate);
    const end = new Date(data?.data?.endDate);
    const diffInMs = end.getTime() - start.getTime();
    const weeks = Math.ceil(diffInMs / (1000 * 60 * 60 * 24 * 7));

    

    // // Drag and drop handlers
    // const handleDragStart = useCallback(
    //     (e: React.DragEvent, item: Chapter | Lesson, type: "module" | "lecture") => {
    //         setDraggedItem({ ...item, type });
    //         e.dataTransfer.effectAllowed = "move";
    //     },
    //     []
    // );

    // const handleDragOver = useCallback(
    //     (e: React.DragEvent, item: Chapter | Lesson, type: "module" | "lecture") => {
    //         e.preventDefault();
    //         e.dataTransfer.dropEffect = "move";
    //         setDragOverItem({ ...item, type });
    //     },
    //     []
    // );

    // const handleDrop = useCallback(

    //                                                 //targetType: "module" | "lecture"         

    //     (e: React.DragEvent, targetItem: Chapter | Lesson, ) => {
    //         e.preventDefault();
    //         if (!draggedItem || draggedItem?.id === targetItem?.id) {
    //             setDraggedItem(null);
    //             setDragOverItem(null);
    //             return;
    //         }
    //         // Implement reordering logic here if needed
    //         setDraggedItem(null);
    //         setDragOverItem(null);
    //     },
    //     [draggedItem]
    // );

    // Chapter creation handler
    const handleCreateChapter = async (formData: z.infer<typeof ChapterSchema>) => {
        try {
            await createChapter(formData).unwrap();
            setIsAddingModule(false);
            refetch();
        } catch (err) {
            console.error("Failed to create chapter:", err);
        }
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading curriculum</div>;

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    <CurriculumHeader cohortName={data?.data?.name} onBack={onBack} />
                    <CurriculumOverview
                        chaptersLength={chapters.length}
                        totalLectures={chapters.reduce((total: number, chapter: Chapter) => total + chapter.lessons.length, 0)}
                        durationWeeks={weeks}
                    />
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Course Modules</h2>
                        <AddModuleDialog
                            isOpen={isAddingModule}
                            onOpenChange={setIsAddingModule}
                            cohortId={cohortId}
                            onAddModule={handleCreateChapter}
                        />
                    </div>
                    <ModuleList
                        chapters={chapters}
                        // draggedItem={draggedItem}
                        // dragOverItem={dragOverItem}
                        // handleDragStart={handleDragStart}
                        // handleDragOver={handleDragOver}
                        // handleDrop={handleDrop}
                        setEditingItem={setEditingItem}
                        // setIsAddingLecture={setIsAddingLecture}
                        refetch={refetch}

                    />
                    <EditItemDialog editingItem={editingItem} onClose={() => setEditingItem(null)} refetch={refetch} />
                </div>
            </div>
        </TooltipProvider>
    );
}