import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Eye, Filter, Mail, MoreHorizontal, Search, Trash2, UserPlus } from "lucide-react";
import MentorProfileView from "@/components/orgAdmin/pages/Mentor_profile_page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// Interface for type safety
interface Mentor {
    id: string;
    name: string;
    specialization: string;
    avatar?: string;
    email: string;
    studentsCount: number;
    cohortsCount: number;
    rating: number;
    status: "active" | "inactive";
    lastActive: string;
}

// Sample mentors data
const mentors: Mentor[] = [
    {
        id: "1",
        name: "Dr. Sarah Johnson",
        specialization: "Data Science",
        email: "sarah.johnson@email.com",
        studentsCount: 25,
        cohortsCount: 1,
        rating: 4.8,
        status: "active",
        lastActive: "1 hour ago",
    },
    {
        id: "2",
        name: "Michael Chen",
        specialization: "Web Development",
        email: "michael.chen@email.com",
        studentsCount: 20,
        cohortsCount: 1,
        rating: 4.5,
        status: "active",
        lastActive: "2 hours ago",
    },
    {
        id: "3",
        name: "Lisa Patel",
        specialization: "UI/UX Design",
        email: "lisa.patel@email.com",
        studentsCount: 18,
        cohortsCount: 1,
        rating: 4.7,
        status: "inactive",
        lastActive: "1 day ago",
    },
    {
        id: "4",
        name: "David Kim",
        specialization: "Mobile Development",
        email: "david.kim@email.com",
        studentsCount: 22,
        cohortsCount: 1,
        rating: 4.6,
        status: "active",
        lastActive: "3 hours ago",
    },
];

const MentorManagement: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterSpecialization, setFilterSpecialization] = useState<string>("all");
    const [selectedMentorId, setSelectedMentorId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newMentor, setNewMentor] = useState({
        name: "",
        email: ""
    });

    // Filter mentors based on search term and specialization
    const filteredMentors = mentors.filter((mentor) => {
        const matchesSearch =
            mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mentor.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialization =
            filterSpecialization === "all" ||
            mentor.specialization.toLowerCase().replace(" ", "-") === filterSpecialization;
        return matchesSearch && matchesSpecialization;
    });

    const handleViewMentor = (mentorId: string) => {
        setSelectedMentorId(mentorId);
    };

    const handleCloseMentorProfile = () => {
        setSelectedMentorId(null);
    };

    const handleAddMentor = () => {
        // In a real application, you would make an API call to save the new mentor
        console.log("Adding new mentor:", newMentor);
        setIsDialogOpen(false);
        setNewMentor({
            name: "",
            email: ""
        });
    };

    const handleEditMentor = (mentorId: string) => {
        console.log(`Editing mentor with ID: ${mentorId}`);
        // Add logic for editing a mentor
    };

    const handleSendMessage = (mentorId: string) => {
        console.log(`Sending message to mentor with ID: ${mentorId}`);
        // Add logic for sending a message
    };

    const handleRemoveMentor = (mentorId: string) => {
        console.log(`Removing mentor with ID: ${mentorId}`);
        // Add logic for removing a mentor
    };

    return (
        <>
            {selectedMentorId ? (
                <MentorProfileView
                    mentorId={selectedMentorId}
                    onClose={handleCloseMentorProfile}
                />
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search mentors..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-80"
                                />
                            </div>
                            <Select value={filterSpecialization} onValueChange={setFilterSpecialization}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Specialization" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Specializations</SelectItem>
                                    <SelectItem value="data-science">Data Science</SelectItem>
                                    <SelectItem value="web-dev">Web Development</SelectItem>
                                    <SelectItem value="mobile-dev">Mobile Development</SelectItem>
                                    <SelectItem value="ui-ux">UI/UX Design</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={() => console.log("Opening advanced filters")}>
                                <Filter className="h-4 w-4 mr-2" />
                                Advanced Filters
                            </Button>
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="cursor-pointer">
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add Mentor
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Add New Mentor</DialogTitle>
                                    <DialogDescription>
                                        Enter the details for the new mentor. All fields are required.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={newMentor.name}
                                            onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                                            className="col-span-3"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="email" className="text-right">
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={newMentor.email}
                                            onChange={(e) => setNewMentor({ ...newMentor, email: e.target.value })}
                                            className="col-span-3"
                                            required
                                        />
                                    </div>


                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="secondary" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleAddMentor}
                                        disabled={!newMentor.name || !newMentor.email}
                                    >
                                        Request to Add Mentor
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Mentors Overview</CardTitle>
                            <CardDescription>
                                Click on a mentor to view detailed information and manage their cohorts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredMentors.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground">No mentors found with the selected filters.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mentor</TableHead>
                                            <TableHead>Specialization</TableHead>
                                            <TableHead>Students</TableHead>
                                            <TableHead>Cohorts</TableHead>
                                            <TableHead>Rating</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Last Active</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredMentors.map((mentor) => (
                                            <TableRow key={mentor.id} className="cursor-pointer hover:bg-muted/50">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar>
                                                            <AvatarImage src={mentor.avatar || "/placeholder.svg"} alt={mentor.name} />
                                                            <AvatarFallback>
                                                                {mentor.name
                                                                    .split(" ")
                                                                    .map((n) => n[0])
                                                                    .join("")}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium">{mentor.name}</p>
                                                            <p className="text-sm text-muted-foreground">{mentor.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{mentor.specialization}</TableCell>
                                                <TableCell>{mentor.studentsCount}</TableCell>
                                                <TableCell>{mentor.cohortsCount}</TableCell>
                                                <TableCell>{mentor.rating.toFixed(1)}</TableCell>
                                                <TableCell>
                                                    <Badge variant={mentor.status === "active" ? "default" : "secondary"}>{mentor.status}</Badge>
                                                </TableCell>
                                                <TableCell>{mentor.lastActive}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem onClick={() => handleViewMentor(mentor.id)}>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Profile
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEditMentor(mentor.id)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Profile
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleSendMessage(mentor.id)}>
                                                                <Mail className="mr-2 h-4 w-4" />
                                                                Send Message
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="text-red-600" onClick={() => handleRemoveMentor(mentor.id)}>
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Remove Mentor
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
};

export default MentorManagement;