import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Edit, Eye, Filter, Loader2, Mail, MoreHorizontal, Search, Trash2, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'

// Interface for mentor type
interface Mentor {
    id: string;
    name: string;
    email: string;
    phone?: string;
    specialization: string;
    experience?: string;
    studentsCount: number;
    cohortsCount: number;
    rating: number;
    status: "active" | "inactive";
    lastActive: string;
    avatar?: string;
    bio?: string;
    certifications?: string[];
}

// Interface for creating a new mentor
interface CreateMentorData {
    name: string;
    email: string;
    phone: string;
    specialization: string;
    experience: string;
    bio: string;
    certifications: string;
}

// Props interface - now much simpler
interface MentorsTabProps {
    onViewMentor?: (mentorId: string) => void; // Optional callback for navigation
    apiBaseUrl?: string; // Optional API base URL for configuration
}

function MentorsTab({ onViewMentor, apiBaseUrl = '/api' }: MentorsTabProps) {
    const [mentors, setMentors] = useState<Mentor[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [specializationFilter, setSpecializationFilter] = useState("all")
    const [isLoading, setIsLoading] = useState(true)
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [createMentorData, setCreateMentorData] = useState<CreateMentorData>({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        experience: '',
        bio: '',
        certifications: ''
    })

    // Simple toast replacement for now
    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        console.log(`${type.toUpperCase()}: ${message}`)
        // In a real app, you'd use a proper toast library
        alert(`${type.toUpperCase()}: ${message}`)
    }

    // Fetch mentors from API
    const fetchMentors = async () => {
        try {
            setIsLoading(true)
            const response = await fetch(`${apiBaseUrl}/mentors`)
            if (!response.ok) {
                throw new Error('Failed to fetch mentors')
            }
            const data = await response.json()
            setMentors(data)
        } catch (error) {
            console.error('Error fetching mentors:', error)
            showToast("Failed to load mentors. Using mock data.", 'error')
            // Fallback to mock data for development
            setMentors(getMockMentors())
        } finally {
            setIsLoading(false)
        }
    }

    // Create a new mentor
    const handleCreateMentor = async () => {
        try {
            setIsCreating(true)
            const response = await fetch(`${apiBaseUrl}/mentors`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...createMentorData,
                    certifications: createMentorData.certifications.split(',').map(cert => cert.trim()).filter(cert => cert),
                    status: 'active',
                    studentsCount: 0,
                    cohortsCount: 0,
                    rating: 0,
                    lastActive: new Date().toISOString()
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to create mentor')
            }

            const newMentor = await response.json()
            setMentors(prev => [...prev, newMentor])
            setIsCreateDialogOpen(false)
            setCreateMentorData({
                name: '',
                email: '',
                phone: '',
                specialization: '',
                experience: '',
                bio: '',
                certifications: ''
            })

            showToast("Mentor created successfully!")
        } catch (error) {
            console.error('Error creating mentor:', error)
            showToast("Failed to create mentor. Please try again.", 'error')
        } finally {
            setIsCreating(false)
        }
    }

    // View mentor details
    const handleViewMentor = (mentorId: string) => {
        if (onViewMentor) {
            onViewMentor(mentorId)
        } else {
            // Default behavior - could navigate to mentor detail page
            console.log('Viewing mentor:', mentorId)
            showToast("Mentor detail view not implemented yet.")
        }
    }

    // Delete mentor
    const handleDeleteMentor = async (mentorId: string) => {
        try {
            const response = await fetch(`${apiBaseUrl}/mentors/${mentorId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error('Failed to delete mentor')
            }

            setMentors(prev => prev.filter(mentor => mentor.id !== mentorId))
            showToast("Mentor removed successfully!")
        } catch (error) {
            console.error('Error deleting mentor:', error)
            showToast("Failed to remove mentor. Please try again.", 'error')
        }
    }

    // Mock data fallback
    const getMockMentors = (): Mentor[] => [
        {
            id: "1",
            name: "Dr. Sarah Johnson",
            email: "sarah.johnson@edulaunch.com",
            phone: "+1 (555) 123-4567",
            specialization: "Data Science",
            experience: "8 years",
            rating: 4.9,
            studentsCount: 45,
            cohortsCount: 3,
            status: "active",
            lastActive: "2 hours ago",
            avatar: "/placeholder.svg?height=40&width=40",
            bio: "Experienced data scientist with expertise in machine learning and AI.",
            certifications: ["AWS Certified", "Google Cloud Professional"],
        },
        {
            id: "2",
            name: "Michael Chen",
            email: "michael.chen@edulaunch.com",
            phone: "+1 (555) 234-5678",
            specialization: "Web Development",
            experience: "6 years",
            rating: 4.8,
            studentsCount: 38,
            cohortsCount: 2,
            status: "active",
            lastActive: "1 day ago",
            avatar: "/placeholder.svg?height=40&width=40",
            bio: "Full-stack developer specializing in modern web technologies.",
            certifications: ["React Certified", "Node.js Expert"],
        },
    ]

    // Filter mentors based on search and specialization
    const filteredMentors = mentors.filter(mentor => {
        const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mentor.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesSpecialization = specializationFilter === "all" ||
            mentor.specialization.toLowerCase().includes(specializationFilter.toLowerCase())
        return matchesSearch && matchesSpecialization
    })

    // Load mentors on component mount
    useEffect(() => {
        fetchMentors()
    }, [apiBaseUrl]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className='space-y-6'>
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
                    <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
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
                    <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Advanced Filters
                    </Button>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Mentor
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Create New Mentor</DialogTitle>
                            <DialogDescription>Add a new mentor to the platform with their details and specialization.</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    placeholder="Enter full name"
                                    value={createMentorData.name}
                                    onChange={(e) => setCreateMentorData(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter email address"
                                    value={createMentorData.email}
                                    onChange={(e) => setCreateMentorData(prev => ({ ...prev, email: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    placeholder="Enter phone number"
                                    value={createMentorData.phone}
                                    onChange={(e) => setCreateMentorData(prev => ({ ...prev, phone: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="specialization">Specialization</Label>
                                <Select value={createMentorData.specialization} onValueChange={(value) => setCreateMentorData(prev => ({ ...prev, specialization: value }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select specialization" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Data Science">Data Science</SelectItem>
                                        <SelectItem value="Web Development">Web Development</SelectItem>
                                        <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                                        <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="experience">Experience</Label>
                                <Input
                                    id="experience"
                                    placeholder="e.g., 5 years"
                                    value={createMentorData.experience}
                                    onChange={(e) => setCreateMentorData(prev => ({ ...prev, experience: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="certifications">Certifications</Label>
                                <Input
                                    id="certifications"
                                    placeholder="Comma-separated list"
                                    value={createMentorData.certifications}
                                    onChange={(e) => setCreateMentorData(prev => ({ ...prev, certifications: e.target.value }))}
                                />
                            </div>
                            <div className="col-span-2 space-y-2">
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    placeholder="Brief description of the mentor's background and expertise"
                                    value={createMentorData.bio}
                                    onChange={(e) => setCreateMentorData(prev => ({ ...prev, bio: e.target.value }))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateMentor} disabled={isCreating}>
                                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Mentor
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Mentors Overview</CardTitle>
                    <CardDescription>
                        {isLoading ? "Loading mentors..." : `${filteredMentors.length} mentor(s) found`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <span className="ml-2">Loading mentors...</span>
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
                                {filteredMentors.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            No mentors found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMentors.map((mentor) => (
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
                                            <TableCell>{mentor.rating}</TableCell>
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
                                                        <DropdownMenuItem>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Mail className="mr-2 h-4 w-4" />
                                                            Send Message
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDeleteMentor(mentor.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Remove Mentor
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default MentorsTab