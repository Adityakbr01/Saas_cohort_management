"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useGetCohortByIdQuery } from "@/store/features/api/cohorts/cohorts.api"
import {
    ArrowLeft,
    BookOpen,
    Clock,
    Edit,
    Eye,
    FileText,
    GripVertical,
    Link,
    Plus,
    Save,
    Trash2,
    Users,
    Video,
} from "lucide-react"
import { useCallback, useState } from "react"

interface CurriculumBuilderProps {
    cohortId: string
    onBack: () => void
}

// Mock curriculum data with drag-and-drop structure
const curriculumData = {
    cohortId: "cohort_1",
    cohortName: "Data Science Bootcamp - Fall 2024",
    modules: [
        {
            id: "module_1",
            title: "Python Fundamentals",
            description: "Introduction to Python programming language",
            duration: "2 weeks",
            order: 1,
            status: "completed",
            lectures: [
                {
                    id: "lecture_1_1",
                    title: "Variables and Data Types",
                    type: "video",
                    duration: "45 min",
                    order: 1,
                    status: "completed",
                    description: "Learn about Python variables and basic data types",
                },
                {
                    id: "lecture_1_2",
                    title: "Control Structures",
                    type: "video",
                    duration: "60 min",
                    order: 2,
                    status: "completed",
                    description: "If statements, loops, and conditional logic",
                },
                {
                    id: "lecture_1_3",
                    title: "Functions and Modules",
                    type: "video",
                    duration: "50 min",
                    order: 3,
                    status: "completed",
                    description: "Creating and using functions, importing modules",
                },
                {
                    id: "lecture_1_4",
                    title: "Python Fundamentals Quiz",
                    type: "assignment",
                    duration: "30 min",
                    order: 4,
                    status: "completed",
                    description: "Test your knowledge of Python basics",
                },
            ],
        },
        {
            id: "module_2",
            title: "Data Analysis with Pandas",
            description: "Working with data using the Pandas library",
            duration: "3 weeks",
            order: 2,
            status: "in-progress",
            lectures: [
                {
                    id: "lecture_2_1",
                    title: "Introduction to Pandas",
                    type: "video",
                    duration: "40 min",
                    order: 1,
                    status: "completed",
                    description: "Getting started with Pandas DataFrames",
                },
                {
                    id: "lecture_2_2",
                    title: "Data Cleaning Techniques",
                    type: "video",
                    duration: "55 min",
                    order: 2,
                    status: "in-progress",
                    description: "Handling missing data and data preprocessing",
                },
                {
                    id: "lecture_2_3",
                    title: "Data Visualization",
                    type: "video",
                    duration: "45 min",
                    order: 3,
                    status: "upcoming",
                    description: "Creating charts and graphs with Matplotlib",
                },
                {
                    id: "lecture_2_4",
                    title: "Data Analysis Project",
                    type: "project",
                    duration: "2 hours",
                    order: 4,
                    status: "upcoming",
                    description: "Hands-on project analyzing real-world data",
                },
            ],
        },
        {
            id: "module_3",
            title: "Machine Learning Basics",
            description: "Introduction to machine learning concepts",
            duration: "4 weeks",
            order: 3,
            status: "upcoming",
            lectures: [
                {
                    id: "lecture_3_1",
                    title: "ML Fundamentals",
                    type: "video",
                    duration: "60 min",
                    order: 1,
                    status: "upcoming",
                    description: "Understanding machine learning concepts",
                },
                {
                    id: "lecture_3_2",
                    title: "Supervised Learning",
                    type: "video",
                    duration: "75 min",
                    order: 2,
                    status: "upcoming",
                    description: "Classification and regression algorithms",
                },
            ],
        },
    ],
}

export default function CurriculumBuilder({ cohortId, onBack }: CurriculumBuilderProps) {
    const [curriculum, setCurriculum] = useState(curriculumData)
    const [draggedItem, setDraggedItem] = useState<any>(null)
    const [dragOverItem, setDragOverItem] = useState<any>(null)
    const [isAddingModule, setIsAddingModule] = useState(false)
    const [isAddingLecture, setIsAddingLecture] = useState<string | null>(null)
    const [editingItem, setEditingItem] = useState<any>(null)


    const { data, isLoading, error } = useGetCohortByIdQuery(cohortId, {
        skip: !cohortId,
    })
    console.log(data?.data)


    const start = new Date(data?.data?.startDate);
    const end = new Date(data?.data?.endDate);

    // Difference in milliseconds
    const diffInMs = end.getTime() - start.getTime();

    // Convert ms to weeks
    const weeks = Math.ceil(diffInMs / (1000 * 60 * 60 * 24 * 7));

    console.log(`${weeks} weeks`);

    // Drag and drop handlers
    const handleDragStart = useCallback((e: React.DragEvent, item: any, type: "module" | "lecture") => {
        setDraggedItem({ ...item, type })
        e.dataTransfer.effectAllowed = "move"
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent, item: any, type: "module" | "lecture") => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "move"
        setDragOverItem({ ...item, type })
    }, [])

    const handleDrop = useCallback(
        (e: React.DragEvent, targetItem: any, targetType: "module" | "lecture") => {
            e.preventDefault()

            if (!draggedItem || draggedItem.id === targetItem.id) {
                setDraggedItem(null)
                setDragOverItem(null)
                return
            }

            // Handle reordering logic here
            console.log("Reordering:", draggedItem, "to position of:", targetItem)

            setDraggedItem(null)
            setDragOverItem(null)
        },
        [draggedItem],
    )

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "default"
            case "in-progress":
                return "secondary"
            case "upcoming":
                return "outline"
            default:
                return "outline"
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "video":
                return <Video className="h-4 w-4" />
            case "assignment":
                return <FileText className="h-4 w-4" />
            case "project":
                return <BookOpen className="h-4 w-4" />
            case "reading":
                return <FileText className="h-4 w-4" />
            case "link":
                return <Link className="h-4 w-4" />
            default:
                return <BookOpen className="h-4 w-4" />
        }
    }

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-background">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" onClick={onBack}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Cohort
                            </Button>
                            <div className="h-6 w-px bg-border" />
                            <div>
                                <h1 className="text-3xl font-bold">Curriculum Builder</h1>
                                <p className="text-muted-foreground">{curriculum.cohortName}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                            </Button>
                            <Button>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </Button>
                        </div>
                    </div>

                    {/* Curriculum Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{data?.data?.chapters?.length}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Lectures</CardTitle>
                                <Video className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {curriculum.modules.reduce((total, module) => total + module.lectures.length, 0)}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Estimated Duration</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{weeks} weeks</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">65%</div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Curriculum Modules */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Course Modules</h2>
                            <Dialog open={isAddingModule} onOpenChange={setIsAddingModule}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Module
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                        <DialogTitle>Add New Module</DialogTitle>
                                        <DialogDescription>Create a new learning module for your curriculum.</DialogDescription>
                                    </DialogHeader>
                                    <div className="grid grid-cols-2 gap-4 py-4">
                                        <div className="col-span-2 space-y-2">
                                            <Label>Module Title</Label>
                                            <Input placeholder="Enter module title" />
                                        </div>
                                        <div className="col-span-2 space-y-2">
                                            <Label>Description</Label>
                                            <Textarea placeholder="Enter module description" rows={3} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Duration</Label>
                                            <Input placeholder="e.g., 2 weeks" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Position</Label>
                                            <Select>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select position" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="beginning">At the beginning</SelectItem>
                                                    <SelectItem value="end">At the end</SelectItem>
                                                    <SelectItem value="after-1">After Module 1</SelectItem>
                                                    <SelectItem value="after-2">After Module 2</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddingModule(false)}>
                                            Cancel
                                        </Button>
                                        <Button onClick={() => setIsAddingModule(false)}>Add Module</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {curriculum.modules.map((module, moduleIndex) => (
                            <Card
                                key={module.id}
                                className={`transition-all duration-200 ${dragOverItem?.id === module.id && dragOverItem?.type === "module" ? "border-primary bg-primary/5" : ""
                                    }`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, module, "module")}
                                onDragOver={(e) => handleDragOver(e, module, "module")}
                                onDrop={(e) => handleDrop(e, module, "module")}
                            >
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab hover:text-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Drag to reorder modules</p>
                                                </TooltipContent>
                                            </Tooltip>
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    Module {module.order}: {module.title}
                                                    <Badge variant={getStatusColor(module.status)}>{module.status}</Badge>
                                                </CardTitle>
                                                <CardDescription>{module.description}</CardDescription>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline">{module.duration}</Badge>
                                            <Button variant="ghost" size="sm" onClick={() => setEditingItem(module)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {module.lectures.map((lecture, lectureIndex) => (
                                            <div
                                                key={lecture.id}
                                                className={`flex items-center gap-3 p-3 border rounded-lg transition-all duration-200 ${dragOverItem?.id === lecture.id && dragOverItem?.type === "lecture"
                                                    ? "border-primary bg-primary/5"
                                                    : "hover:bg-muted/50"
                                                    }`}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, lecture, "lecture")}
                                                onDragOver={(e) => handleDragOver(e, lecture, "lecture")}
                                                onDrop={(e) => handleDrop(e, lecture, "lecture")}
                                            >
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab hover:text-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Drag to reorder lectures</p>
                                                    </TooltipContent>
                                                </Tooltip>

                                                <div className="flex items-center gap-2">
                                                    {getTypeIcon(lecture.type)}
                                                    <Badge variant={getStatusColor(lecture.status)} className="text-xs">
                                                        {lecture.status}
                                                    </Badge>
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium text-sm">{lecture.title}</p>
                                                            <p className="text-xs text-muted-foreground">{lecture.description}</p>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Clock className="h-3 w-3" />
                                                            {lecture.duration}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Button variant="ghost" size="sm" onClick={() => setEditingItem(lecture)}>
                                                                <Edit className="h-3 w-3" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Edit lecture</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <Button variant="ghost" size="sm">
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Delete lecture</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        ))}

                                        <Dialog
                                            open={isAddingLecture === module.id}
                                            onOpenChange={(open) => setIsAddingLecture(open ? module.id : null)}
                                        >
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Plus className="h-4 w-4 mr-2" />
                                                    Add Lecture
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-2xl">
                                                <DialogHeader>
                                                    <DialogTitle>Add New Lecture</DialogTitle>
                                                    <DialogDescription>Add a new lecture to {module.title}.</DialogDescription>
                                                </DialogHeader>
                                                <div className="grid grid-cols-2 gap-4 py-4">
                                                    <div className="col-span-2 space-y-2">
                                                        <Label>Lecture Title</Label>
                                                        <Input placeholder="Enter lecture title" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Type</Label>
                                                        <Select>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="video">Video Lecture</SelectItem>
                                                                <SelectItem value="assignment">Assignment</SelectItem>
                                                                <SelectItem value="project">Project</SelectItem>
                                                                <SelectItem value="reading">Reading Material</SelectItem>
                                                                <SelectItem value="link">External Link</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Duration</Label>
                                                        <Input placeholder="e.g., 45 min" />
                                                    </div>
                                                    <div className="col-span-2 space-y-2">
                                                        <Label>Description</Label>
                                                        <Textarea placeholder="Enter lecture description" rows={3} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Position</Label>
                                                        <Select>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select position" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="beginning">At the beginning</SelectItem>
                                                                <SelectItem value="end">At the end</SelectItem>
                                                                {module.lectures.map((lecture, index) => (
                                                                    <SelectItem key={lecture.id} value={`after-${index}`}>
                                                                        After "{lecture.title}"
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Status</Label>
                                                        <Select defaultValue="upcoming">
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                                                <SelectItem value="in-progress">In Progress</SelectItem>
                                                                <SelectItem value="completed">Completed</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setIsAddingLecture(null)}>
                                                        Cancel
                                                    </Button>
                                                    <Button onClick={() => setIsAddingLecture(null)}>Add Lecture</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Edit Item Dialog */}
                    <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Edit {editingItem?.lectures ? "Module" : "Lecture"}</DialogTitle>
                                <DialogDescription>
                                    Update the details for this {editingItem?.lectures ? "module" : "lecture"}.
                                </DialogDescription>
                            </DialogHeader>
                            {editingItem && (
                                <div className="grid grid-cols-2 gap-4 py-4">
                                    <div className="col-span-2 space-y-2">
                                        <Label>Title</Label>
                                        <Input defaultValue={editingItem.title} />
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label>Description</Label>
                                        <Textarea defaultValue={editingItem.description} rows={3} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Duration</Label>
                                        <Input defaultValue={editingItem.duration} />
                                    </div>
                                    {!editingItem.lectures && (
                                        <div className="space-y-2">
                                            <Label>Type</Label>
                                            <Select defaultValue={editingItem.type}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="video">Video Lecture</SelectItem>
                                                    <SelectItem value="assignment">Assignment</SelectItem>
                                                    <SelectItem value="project">Project</SelectItem>
                                                    <SelectItem value="reading">Reading Material</SelectItem>
                                                    <SelectItem value="link">External Link</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select defaultValue={editingItem.status}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="upcoming">Upcoming</SelectItem>
                                                <SelectItem value="in-progress">In Progress</SelectItem>
                                                <SelectItem value="completed">Completed</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setEditingItem(null)}>
                                    Cancel
                                </Button>
                                <Button onClick={() => setEditingItem(null)}>Save Changes</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </TooltipProvider>
    )
}
