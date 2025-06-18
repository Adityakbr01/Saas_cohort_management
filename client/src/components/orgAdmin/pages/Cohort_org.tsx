import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Eye, Plus, Users } from "lucide-react";
import CohortDetailView from "./CohortDetailView";
import MentorProfileView from "@/components/orgAdmin/pages/Mentor_profile_page";

// Interfaces for type safety
interface Mentor {
    id: string;
    name: string;
    specialization: string;
}

interface Student {
    id: string;
    name: string;
    email: string;
    progress: number;
    lastActive: string;
    status: "active" | "at-risk" | "inactive";
    joinDate: string;
    assignments: number;
    completedAssignments: number;
    grade: string;
}

interface Cohort {
    id: string;
    name: string;
    mentor: string;
    mentorId: string;
    startDate: string;
    endDate: string;
    studentsCount: number;
    maxCapacity: number;
    status: "active" | "completed" | "upcoming";
    progress: number;
    completionRate: number;
    category: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    createdBy: string;
    students: Student[];
}

interface NewCohortForm {
    name: string;
    mentorId: string;
    category: string;
    startDate: string;
    endDate: string;
    maxCapacity: string;
    difficulty: string;
    description: string;
}

// Sample mentors data
const mentors: Mentor[] = [
    { id: "1", name: "Dr. Sarah Johnson", specialization: "Data Science" },
    { id: "2", name: "Michael Chen", specialization: "Web Development" },
    { id: "3", name: "Lisa Patel", specialization: "UI/UX Design" },
    { id: "4", name: "David Kim", specialization: "Mobile Development" },
];

// Cohort data
const cohortData: Cohort[] = [
    {
        id: "1",
        name: "Data Science Bootcamp - Fall 2024",
        mentor: "Dr. Sarah Johnson",
        mentorId: "1",
        startDate: "2024-09-01",
        endDate: "2024-12-15",
        studentsCount: 25,
        maxCapacity: 30,
        status: "active",
        progress: 65,
        completionRate: 92,
        category: "Data Science",
        difficulty: "Intermediate",
        createdBy: "John Smith",
        students: [
            {
                id: "s1",
                name: "John Doe",
                email: "john.doe@email.com",
                progress: 78,
                lastActive: "2 hours ago",
                status: "active",
                joinDate: "2024-09-01",
                assignments: 12,
                completedAssignments: 9,
                grade: "A-",
            },
            {
                id: "s2",
                name: "Jane Smith",
                email: "jane.smith@email.com",
                progress: 85,
                lastActive: "1 day ago",
                status: "active",
                joinDate: "2024-09-01",
                assignments: 12,
                completedAssignments: 10,
                grade: "A",
            },
            {
                id: "s3",
                name: "Bob Wilson",
                email: "bob.wilson@email.com",
                progress: 45,
                lastActive: "3 days ago",
                status: "at-risk",
                joinDate: "2024-09-01",
                assignments: 12,
                completedAssignments: 5,
                grade: "C",
            },
        ],
    },
    {
        id: "2",
        name: "React Development - Summer 2024",
        mentor: "Michael Chen",
        mentorId: "2",
        startDate: "2024-06-15",
        endDate: "2024-09-15",
        studentsCount: 20,
        maxCapacity: 25,
        status: "active",
        progress: 40,
        completionRate: 78,
        category: "Web Development",
        difficulty: "Intermediate",
        createdBy: "John Smith",
        students: [],
    },
    {
        id: "3",
        name: "UI/UX Fundamentals - Fall 2024",
        mentor: "Lisa Patel",
        mentorId: "3",
        startDate: "2024-10-01",
        endDate: "2024-12-01",
        studentsCount: 18,
        maxCapacity: 20,
        status: "completed",
        progress: 100,
        completionRate: 95,
        category: "UI/UX Design",
        difficulty: "Beginner",
        createdBy: "John Smith",
        students: [],
    },
    {
        id: "4",
        name: "Mobile App Development - Spring 2025",
        mentor: "David Kim",
        mentorId: "4",
        startDate: "2025-03-01",
        endDate: "2025-06-01",
        studentsCount: 22,
        maxCapacity: 25,
        status: "upcoming",
        progress: 0,
        completionRate: 0,
        category: "Mobile Development",
        difficulty: "Intermediate",
        createdBy: "John Smith",
        students: [],
    },
];

const CohortManagement: React.FC = () => {
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [isCreateCohortOpen, setIsCreateCohortOpen] = useState<boolean>(false);
    const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
    const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
    const [newCohort, setNewCohort] = useState<NewCohortForm>({
        name: "",
        mentorId: "",
        category: "",
        startDate: "",
        endDate: "",
        maxCapacity: "",
        difficulty: "",
        description: "",
    });
    const [formErrors, setFormErrors] = useState<Partial<NewCohortForm>>({});

    // Filter cohorts based on status and category
    const filteredCohorts = cohortData.filter((cohort) => {
        const statusMatch = filterStatus === "all" || cohort.status === filterStatus;
        const categoryMatch =
            filterCategory === "all" ||
            cohort.category.toLowerCase().replace(" ", "-") === filterCategory;
        return statusMatch && categoryMatch;
    });

    const handleViewCohort = (cohortId: string) => {
        setSelectedCohortId(cohortId);
        setSelectedMentorId(null); // Clear mentor selection
    };

    const handleViewMentor = (mentorId: string) => {
        setSelectedMentorId(mentorId);
        setSelectedCohortId(null); // Clear cohort selection
    };

    const handleViewStudent = (studentId: string) => {
        console.log(`Viewing student with ID: ${studentId}`);
        // Add navigation or modal logic here
    };

    const handleCloseCohortDetail = () => {
        setSelectedCohortId(null);
    };

    const handleCloseMentorProfile = () => {
        setSelectedMentorId(null);
    };

    const validateForm = (): boolean => {
        const errors: Partial<NewCohortForm> = {};
        if (!newCohort.name) errors.name = "Cohort name is required";
        if (!newCohort.mentorId) errors.mentorId = "Mentor is required";
        if (!newCohort.category) errors.category = "Category is required";
        if (!newCohort.startDate) errors.startDate = "Start date is required";
        if (!newCohort.endDate) errors.endDate = "End date is required";
        if (!newCohort.maxCapacity || isNaN(Number(newCohort.maxCapacity)) || Number(newCohort.maxCapacity) <= 0)
            errors.maxCapacity = "Valid max capacity is required";
        if (!newCohort.difficulty) errors.difficulty = "Difficulty level is required";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreateCohort = () => {
        if (validateForm()) {
            console.log("Creating cohort:", newCohort);
            // Add logic to save the new cohort (e.g., API call)
            setIsCreateCohortOpen(false);
            setNewCohort({
                name: "",
                mentorId: "",
                category: "",
                startDate: "",
                endDate: "",
                maxCapacity: "",
                difficulty: "",
                description: "",
            });
            setFormErrors({});
        }
    };

    const handleFormChange = (field: keyof NewCohortForm, value: string) => {
        setNewCohort((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <>
            {selectedCohortId ? (
                <CohortDetailView
                    cohortId={selectedCohortId}
                    onClose={handleCloseCohortDetail}
                    onViewStudent={handleViewStudent}
                />
            ) : selectedMentorId ? (
                <MentorProfileView
                    mentorId={selectedMentorId}
                    onClose={handleCloseMentorProfile}
                />
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="upcoming">Upcoming</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={filterCategory} onValueChange={setFilterCategory}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    <SelectItem value="data-science">Data Science</SelectItem>
                                    <SelectItem value="web-dev">Web Development</SelectItem>
                                    <SelectItem value="mobile-dev">Mobile Development</SelectItem>
                                    <SelectItem value="ui-ux">UI/UX Design</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Dialog open={isCreateCohortOpen} onOpenChange={setIsCreateCohortOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Cohort
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create New Cohort</DialogTitle>
                                    <DialogDescription>
                                        Set up a new learning cohort with mentor assignment.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="cohort-name">Cohort Name</Label>
                                        <Input
                                            id="cohort-name"
                                            placeholder="Enter cohort name"
                                            value={newCohort.name}
                                            onChange={(e) => handleFormChange("name", e.target.value)}
                                            className={formErrors.name ? "border-red-500" : ""}
                                        />
                                        {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="mentor">Assign Mentor</Label>
                                        <Select
                                            value={newCohort.mentorId}
                                            onValueChange={(value) => handleFormChange("mentorId", value)}
                                        >
                                            <SelectTrigger className={formErrors.mentorId ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Select mentor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {mentors.map((mentor) => (
                                                    <SelectItem key={mentor.id} value={mentor.id}>
                                                        {mentor.name} - {mentor.specialization}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {formErrors.mentorId && <p className="text-sm text-red-500">{formErrors.mentorId}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select
                                            value={newCohort.category}
                                            onValueChange={(value) => handleFormChange("category", value)}
                                        >
                                            <SelectTrigger className={formErrors.category ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="data-science">Data Science</SelectItem>
                                                <SelectItem value="web-dev">Web Development</SelectItem>
                                                <SelectItem value="mobile-dev">Mobile Development</SelectItem>
                                                <SelectItem value="ui-ux">UI/UX Design</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {formErrors.category && <p className="text-sm text-red-500">{formErrors.category}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="start-date">Start Date</Label>
                                        <Input
                                            id="start-date"
                                            type="date"
                                            value={newCohort.startDate}
                                            onChange={(e) => handleFormChange("startDate", e.target.value)}
                                            className={formErrors.startDate ? "border-red-500" : ""}
                                        />
                                        {formErrors.startDate && <p className="text-sm text-red-500">{formErrors.startDate}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="end-date">End Date</Label>
                                        <Input
                                            id="end-date"
                                            type="date"
                                            value={newCohort.endDate}
                                            onChange={(e) => handleFormChange("endDate", e.target.value)}
                                            className={formErrors.endDate ? "border-red-500" : ""}
                                        />
                                        {formErrors.endDate && <p className="text-sm text-red-500">{formErrors.endDate}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="capacity">Max Capacity</Label>
                                        <Input
                                            id="capacity"
                                            type="number"
                                            placeholder="Enter max students"
                                            value={newCohort.maxCapacity}
                                            onChange={(e) => handleFormChange("maxCapacity", e.target.value)}
                                            className={formErrors.maxCapacity ? "border-red-500" : ""}
                                        />
                                        {formErrors.maxCapacity && <p className="text-sm text-red-500">{formErrors.maxCapacity}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="difficulty">Difficulty Level</Label>
                                        <Select
                                            value={newCohort.difficulty}
                                            onValueChange={(value) => handleFormChange("difficulty", value)}
                                        >
                                            <SelectTrigger className={formErrors.difficulty ? "border-red-500" : ""}>
                                                <SelectValue placeholder="Select difficulty" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Beginner">Beginner</SelectItem>
                                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                <SelectItem value="Advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {formErrors.difficulty && <p className="text-sm text-red-500">{formErrors.difficulty}</p>}
                                    </div>
                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Enter cohort description"
                                            value={newCohort.description}
                                            onChange={(e) => handleFormChange("description", e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsCreateCohortOpen(false);
                                            setNewCohort({
                                                name: "",
                                                mentorId: "",
                                                category: "",
                                                startDate: "",
                                                endDate: "",
                                                maxCapacity: "",
                                                difficulty: "",
                                                description: "",
                                            });
                                            setFormErrors({});
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreateCohort}>Create Cohort</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {filteredCohorts.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No cohorts found with the selected filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredCohorts.map((cohort) => (
                                <Card
                                    key={cohort.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-lg">{cohort.name}</CardTitle>
                                                <CardDescription>
                                                    {cohort.category} • {cohort.difficulty}
                                                </CardDescription>
                                            </div>
                                            <Badge
                                                variant={cohort.status === "active" ? "default" : "secondary"}
                                            >
                                                {cohort.status}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Progress</span>
                                                <span>{cohort.progress}%</span>
                                            </div>
                                            <Progress value={cohort.progress} className="h-2" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Students:</span>
                                                <span className="ml-1 font-medium">
                          {cohort.studentsCount}/{cohort.maxCapacity}
                        </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Mentor:</span>
                                                <span className="ml-1 font-medium">{cohort.mentor}</span>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleViewCohort(cohort.id)}>
                                                <Eye className="h-4 w-4 mr-2" />
                                                View Details
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewMentor(cohort.mentorId)}
                                            >
                                                <Users className="h-4 w-4 mr-2" />
                                                View Mentor
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default CohortManagement;