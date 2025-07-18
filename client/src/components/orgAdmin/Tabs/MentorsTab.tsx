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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
    useCancelInviteMutation,
    useDeleteMentorMutation,
    useFinalizeInviteMutation,
    useGetOrgMentorsQuery,
    useInviteMentorsMutation,
    useMyOrgQuery,
    usePendingInvitesQuery,
    useResendInviteMutation,
    useGetMentorDetailsMutation
} from '@/store/features/api/organization/orgApi'
import {
    Clock,
    Edit,
    Eye,
    Filter,
    Loader2,
    Mail,
    MoreHorizontal,
    RefreshCw,
    Search,
    Send,
    Trash2,
    UserCheck,
    UserPlus,
    UserX,
    X
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

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
    userId?: string;
    orgId?: string;
    _id?: string;
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

// Interface for pending invitation
interface PendingInvite {
    _id: string;
    email: string;
    name: string;
    phone: string;
    specialization: string;
    experience: string;
    bio: string;
    certifications: string;
    status: "PENDING_USER" | "PENDING_ADMIN";
    createdAt: string;
    expiresAt: string;
    role: string;
    orgId: string;
    invitedBy: string;
}

// Props interface
interface MentorsTabProps {
    onViewMentor?: (mentorId: string) => void;
    apiBaseUrl?: string;
}

// Zod schema for form validation
const mentorInvitationSchema = z.object({
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must not exceed 100 characters")
        .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
    email: z.string()
        .email("Please enter a valid email address"),
    phone: z.string()
        .min(1, "Phone number is required")
        .regex(/^[+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"),
    specialization: z.enum([
        "Web Development",
        "Mobile Development",
        "Data Science",
        "Machine Learning",
        "UI/UX Design",
        "Cybersecurity",
        "Cloud Computing",
        "DevOps",
        "Blockchain",
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "English",
        "Commerce",
        "Product Management",
        "Startup Mentorship",
        "Career Counseling",
        "Soft Skills",
        "Public Speaking",
        "Mental Health",
        "Other"
    ], {
        errorMap: () => ({ message: "Please select a specialization" })
    }),
    experience: z.string()
        .min(1, "Experience is required"),
    bio: z.string()
        .min(10, "Bio must be at least 10 characters")
        .max(500, "Bio must not exceed 500 characters"),
    certifications: z.string()
        .optional()
        .refine((val) => {
            if (!val || val.trim() === '') return true;
            const certs = val.split(',').map(cert => cert.trim()).filter(cert => cert.length > 0);
            return certs.length > 0 && certs.every(cert => cert.length >= 2);
        }, "Certifications must be comma-separated and each certification must be at least 2 characters")
});

// Interface for form errors
interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    specialization?: string;
    experience?: string;
    bio?: string;
    certifications?: string;
}

// List of valid specializations (must match the schema)
const validSpecializations = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Machine Learning",
    "UI/UX Design",
    "Cybersecurity",
    "Cloud Computing",
    "DevOps",
    "Blockchain",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Commerce",
    "Product Management",
    "Startup Mentorship",
    "Career Counseling",
    "Soft Skills",
    "Public Speaking",
    "Mental Health",
    "Other"
];

function MentorsTab({ onViewMentor }: MentorsTabProps) {
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

    // State for pending invitations
    const [pendingSearchTerm, setPendingSearchTerm] = useState("")
    const [pendingStatusFilter, setPendingStatusFilter] = useState("all")

    // Form validation state
    const [formErrors, setFormErrors] = useState<FormErrors>({})
    const [isValidating, setIsValidating] = useState(false)

    // API hooks
    const { data: orgData } = useMyOrgQuery()
    const [invitementor] = useInviteMentorsMutation()
    const [resendInvite] = useResendInviteMutation()
    const [cancelInvite] = useCancelInviteMutation()
    const [deleteMentor] = useDeleteMentorMutation()
    const [getMentorDetails] = useGetMentorDetailsMutation()
    const { data: getOrgMentors,refetch:refetchMentors } = useGetOrgMentorsQuery(undefined)
    const { data: pendingInvitesData, isLoading: pendingInvitesLoading, refetch: refetchPendingInvites } = usePendingInvitesQuery(
        orgData?.data?._id || '',
        {
            skip: !orgData?.data?._id
        }
    )
    const [finalizeInvite] = useFinalizeInviteMutation()

    useEffect(() => {
        if (getOrgMentors?.data) {
            setMentors(getOrgMentors.data)
            setIsLoading(false)
        }
    }, [getOrgMentors])

    // Validation functions
    const validateField = useCallback((fieldName: keyof FormErrors, value: string) => {
        try {
            const fieldSchema = mentorInvitationSchema.shape[fieldName];
            fieldSchema.parse(value);
            setFormErrors(prev => ({ ...prev, [fieldName]: undefined }));
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errorMessage = error.errors[0]?.message || `Invalid ${fieldName}`;
                setFormErrors(prev => ({ ...prev, [fieldName]: errorMessage }));
                return false;
            }
            return false;
        }
    }, []);

    const validateForm = useCallback((): boolean => {
        try {
            setIsValidating(true);
            mentorInvitationSchema.parse(createMentorData);
            setFormErrors({});
            return true;
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors: FormErrors = {};
                error.errors.forEach((err) => {
                    if (err.path[0]) {
                        errors[err.path[0] as keyof FormErrors] = err.message;
                    }
                });
                setFormErrors(errors);
                toast.error("Please fix the form errors before submitting");
                return false;
            }
            return false;
        } finally {
            setIsValidating(false);
        }
    }, [createMentorData]);

    // Handle form field changes with validation
    const handleFieldChange = useCallback((fieldName: keyof CreateMentorData, value: string) => {
        setCreateMentorData(prev => ({ ...prev, [fieldName]: value }));
        if (formErrors[fieldName as keyof FormErrors]) {
            setFormErrors(prev => ({ ...prev, [fieldName]: undefined }));
        }
        setTimeout(() => {
            validateField(fieldName as keyof FormErrors, value);
        }, 300);
    }, [formErrors, validateField]);

    // Normalize specialization to match Select options
    const normalizeSpecialization = (specialization: string): string => {
        if (!specialization) return 'Other';

        // Convert to title case for consistency
        const titleCase = specialization
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        // Check if the normalized specialization is in the valid list
        return validSpecializations.includes(titleCase) ? titleCase : 'Other';
    };

    // Fetch and populate mentor details
    const handleGetMentorDetails = async (email: string) => {
        if (!email || !z.string().email().safeParse(email).success) {
            toast.error("Please enter a valid email address to fetch details");
            return;
        }

        try {
            const response = await getMentorDetails(email).unwrap();
            if (response.success && response.data) {
                const mentorData = response.data;
                const normalizedSpecialization = normalizeSpecialization(mentorData.specialization || '');
                
                setCreateMentorData({
                    name: mentorData.name || '',
                    email: mentorData.email || email,
                    phone: mentorData.phone || '',
                    specialization: normalizedSpecialization,
                    experience: mentorData.experience || '',
                    bio: mentorData.bio || '',
                    certifications: Array.isArray(mentorData.certifications)
                        ? mentorData.certifications.join(', ')
                        : mentorData.certifications || ''
                });

                if (normalizedSpecialization === 'Other' && mentorData.specialization) {
                    toast.warning(`Specialization "${mentorData.specialization}" is not in the list. Defaulted to 'Other'.`);
                } else {
                    toast.success("Mentor details fetched and populated successfully!");
                }
            } else {
                toast.info("No mentor details found. Please fill in the remaining fields.");
            }
        } catch (error) {
            console.error("Failed to fetch mentor details:", error);
            toast.error("Failed to fetch mentor details. Please try again.");
        }
    };

    // Create a new mentor with validation
    const handleCreateMentor = async () => {
        if (!validateForm()) {
            return;
        }

        setIsCreating(true);
        const loadingToastId = toast.loading("Sending invitation...");

        try {
            const inviteData = {
                ...createMentorData,
                certifications: createMentorData.certifications || ''
            };

            const response = await invitementor(inviteData).unwrap();
            toast.dismiss(loadingToastId);

            if (response.success) {
                toast.success(response?.message || "Mentor invitation sent successfully!");
                setIsCreateDialogOpen(false);
                setCreateMentorData({
                    name: '',
                    email: '',
                    phone: '',
                    specialization: '',
                    experience: '',
                    bio: '',
                    certifications: ''
                });
                setFormErrors({});
                refetchPendingInvites();
            }
        } catch (error) {
            toast.dismiss(loadingToastId);
            let errorMessage = "Failed to send mentor invitation. Please try again.";
            if (error && typeof error === 'object') {
                const err = error as { data?: { message?: string }; message?: string };
                errorMessage = err?.data?.message || err?.message || errorMessage;
            }
            toast.error(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    // View mentor details
    const handleViewMentor = (mentorId: string) => {
        if (onViewMentor) {
            onViewMentor(mentorId);
        } else {
            toast.info("Mentor detail view not implemented yet.");
        }
    };

    // Delete mentor
    const handleDeleteMentor = async (mentorId: string) => {
        try {
            const response = await deleteMentor(mentorId).unwrap();
            if (response.success) {
                toast.success("Mentor deleted successfully!");
                setMentors(mentors.filter(mentor => mentor.id !== mentorId));
            }
        } catch (error) {
            console.error("Failed to delete mentor:", error);
            toast.error("Failed to delete mentor. Please try again.");
        }
    };

    // Handle pending invitation actions
    const handleResendInvitation = async (inviteId: string) => {
        try {
            const response = await resendInvite(inviteId).unwrap();
            if (response.success) {
                toast.success("Invitation resent successfully!");
                refetchPendingInvites();
            }
        } catch (error) {
            console.error("Failed to resend invitation:", error);
            toast.error("Failed to resend invitation. Please try again.");
        }
    };

    const handleCancelInvitation = async (inviteId: string) => {
        try {
            const response = await cancelInvite(inviteId).unwrap();
            if (response.success) {
                toast.success("Invitation cancelled successfully!");
                refetchPendingInvites();
            }
        } catch (error) {
            console.error("Failed to cancel invitation:", error);
            toast.error("Failed to cancel invitation. Please try again.");
        }
    };

    const handleFinalizeInvitation = async (inviteId: string) => {
        try {
            const response = await finalizeInvite(inviteId).unwrap();
            if (response.success) {
                toast.success("Mentor invitation finalized successfully!");
                refetchPendingInvites();
                refetchMentors()
                setMentors([...mentors, response.data]);
            }
        } catch (error) {
            console.error("Failed to finalize invitation:", error);
            toast.error("Failed to finalize invitation. Please try again.");
        }
    };

    // Filter functions
    const filteredMentors = mentors.filter(mentor => {
        if (!mentor) return false;
        const matchesSearch = (mentor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
            (mentor?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
        const matchesSpecialization = specializationFilter === "all" ||
            (mentor?.specialization?.toLowerCase() === specializationFilter.toLowerCase());
        return matchesSearch && matchesSpecialization;
    });

    const pendingInvitesArray = Array.isArray(pendingInvitesData)
        ? pendingInvitesData
        : (pendingInvitesData?.data && Array.isArray(pendingInvitesData.data))
            ? pendingInvitesData.data
            : [];

    const filteredPendingInvites = pendingInvitesArray.filter((invite: PendingInvite) => {
        if (!invite || typeof invite !== 'object' || !invite.name || !invite.email) {
            return false;
        }
        try {
            const matchesSearch = invite.name.toLowerCase().includes(pendingSearchTerm.toLowerCase()) ||
                invite.email.toLowerCase().includes(pendingSearchTerm.toLowerCase());
            const matchesStatus = pendingStatusFilter === "all" || invite.status === pendingStatusFilter;
            return matchesSearch && matchesStatus;
        } catch (error) {
            console.error("Error filtering pending invites:", error);
            return false;
        }
    });

    return (
        <div className='space-y-6'>
            <Tabs defaultValue="active" className="w-full">
                <div className="flex justify-between items-center mb-6">
                    <TabsList className="grid w-fit grid-cols-2">
                        <TabsTrigger value="active" className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            Active Mentors ({filteredMentors.length})
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Pending Invitations ({filteredPendingInvites.length})
                        </TabsTrigger>
                    </TabsList>

                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Invite Mentor
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>Invite New Mentor</DialogTitle>
                                <DialogDescription>Send an invitation to a mentor to join your organization.</DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="Enter full name"
                                        value={createMentorData.name}
                                        onChange={(e) => handleFieldChange('name', e.target.value)}
                                        className={formErrors.name ? "border-red-500 focus:border-red-500" : ""}
                                    />
                                    {formErrors.name && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <X className="h-3 w-3" />
                                            {formErrors.name}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address *</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter email address"
                                            value={createMentorData.email}
                                            onChange={(e) => handleFieldChange('email', e.target.value)}
                                            className={formErrors.email ? "border-red-500 focus:border-red-500" : ""}
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => handleGetMentorDetails(createMentorData.email)}
                                            disabled={isCreating || isValidating || !createMentorData.email}
                                        >
                                            Fetch Details
                                        </Button>
                                    </div>
                                    {formErrors.email && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <X className="h-3 w-3" />
                                            {formErrors.email}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number *</Label>
                                    <Input
                                        id="phone"
                                        placeholder="Enter phone number"
                                        value={createMentorData.phone}
                                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                                        className={formErrors.phone ? "border-red-500 focus:border-red-500" : ""}
                                    />
                                    {formErrors.phone && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <X className="h-3 w-3" />
                                            {formErrors.phone}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="specialization">Specialization *</Label>
                                    <Select
                                        value={createMentorData.specialization}
                                        onValueChange={(value) => handleFieldChange('specialization', value)}
                                    >
                                        <SelectTrigger className={formErrors.specialization ? "border-red-500 focus:border-red-500" : ""}>
                                            <SelectValue placeholder="Select specialization" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {validSpecializations.map((spec) => (
                                                <SelectItem key={spec} value={spec}>
                                                    {spec}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {formErrors.specialization && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <X className="h-3 w-3" />
                                            {formErrors.specialization}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="experience">Experience *</Label>
                                    <Input
                                        id="experience"
                                        placeholder="e.g., 5 years"
                                        value={createMentorData.experience}
                                        onChange={(e) => handleFieldChange('experience', e.target.value)}
                                        className={formErrors.experience ? "border-red-500 focus:border-red-500" : ""}
                                    />
                                    {formErrors.experience && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <X className="h-3 w-3" />
                                            {formErrors.experience}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="certifications">Certifications</Label>
                                    <Input
                                        id="certifications"
                                        placeholder="Comma-separated list (optional)"
                                        value={createMentorData.certifications}
                                        onChange={(e) => handleFieldChange('certifications', e.target.value)}
                                        className={formErrors.certifications ? "border-red-500 focus:border-red-500" : ""}
                                    />
                                    {formErrors.certifications && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <X className="h-3 w-3" />
                                            {formErrors.certifications}
                                        </p>
                                    )}
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <Label htmlFor="bio">Bio *</Label>
                                    <Textarea
                                        id="bio"
                                        placeholder="Brief description of the mentor's background and expertise (10-500 characters)"
                                        value={createMentorData.bio}
                                        onChange={(e) => handleFieldChange('bio', e.target.value)}
                                        className={formErrors.bio ? "border-red-500 focus:border-red-500" : ""}
                                        rows={3}
                                    />
                                    <div className="flex justify-between items-center">
                                        {formErrors.bio ? (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <X className="h-3 w-3" />
                                                {formErrors.bio}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                {createMentorData.bio.length}/500 characters
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreateDialogOpen(false);
                                        setFormErrors({});
                                        setCreateMentorData({
                                            name: '',
                                            email: '',
                                            phone: '',
                                            specialization: '',
                                            experience: '',
                                            bio: '',
                                            certifications: ''
                                        });
                                    }}
                                    disabled={isCreating}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateMentor}
                                    disabled={isCreating || isValidating || Object.keys(formErrors).some(key => formErrors[key as keyof FormErrors])}
                                >
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isCreating ? "Sending..." : "Send Invitation"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Active Mentors Tab */}
                <TabsContent value="active" className="space-y-4">
                    <div className="flex gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search active mentors..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by specialization" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Specializations</SelectItem>
                                {validSpecializations.map((spec) => (
                                    <SelectItem key={spec} value={spec.toLowerCase()}>
                                        {spec}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline">
                            <Filter className="h-4 w-4 mr-2" />
                            Advanced Filters
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Active Mentors</CardTitle>
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
                                            filteredMentors.map((mentor) => {
                                                return (
                                                    <TableRow key={mentor.id} className="cursor-pointer hover:bg-muted/50">
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar>
                                                                    <AvatarImage src={mentor.avatar || "/placeholder.svg"} alt={mentor.name || 'Mentor'} />
                                                                    <AvatarFallback>
                                                                        {mentor.name
                                                                            ? mentor.name.split(" ").map((n) => n[0]).join("")
                                                                            : "M"}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium">{mentor.name || 'Unknown'}</p>
                                                                    <p className="text-sm text-muted-foreground">{mentor.email || 'No email'}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{mentor.specialization || 'N/A'}</TableCell>
                                                        <TableCell>{mentor.studentsCount || 0}</TableCell>
                                                        <TableCell>{mentor.cohortsCount || 0}</TableCell>
                                                        <TableCell>{mentor.rating || 0}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={mentor.status === "active" ? "default" : "secondary"}>
                                                                {mentor.status || 'inactive'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>{mentor.lastActive || 'Never'}</TableCell>
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
                                                                        onClick={() => handleDeleteMentor(mentor._id!)}
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Remove Mentor
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Pending Invitations Tab */}
                <TabsContent value="pending" className="space-y-4">
                    <div className="flex gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search pending invitations..."
                                value={pendingSearchTerm}
                                onChange={(e) => setPendingSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={pendingStatusFilter} onValueChange={setPendingStatusFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="PENDING_USER">Pending User</SelectItem>
                                <SelectItem value="PENDING_ADMIN">Pending Admin</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => refetchPendingInvites()}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Mentor Invitations</CardTitle>
                            <CardDescription>
                                {pendingInvitesLoading ? "Loading invitations..." : `${filteredPendingInvites.length} pending invitation(s)`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {pendingInvitesLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                    <span className="ml-2">Loading pending invitations...</span>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invited Mentor</TableHead>
                                            <TableHead>Specialization</TableHead>
                                            <TableHead>Experience</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Invited Date</TableHead>
                                            <TableHead>Expires</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPendingInvites.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                    No pending invitations found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredPendingInvites.map((invite: PendingInvite) => {
                                                if (!invite || !invite._id) {
                                                    return null;
                                                }
                                                return (
                                                    <TableRow key={invite._id} className="hover:bg-muted/50">
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <Avatar>
                                                                    <AvatarFallback>
                                                                        {invite.name
                                                                            ? invite.name.split(" ").map((n) => n[0]).join("")
                                                                            : "I"}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <p className="font-medium">{invite.name || 'Unknown'}</p>
                                                                    <p className="text-sm text-muted-foreground">{invite.email || 'No email'}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>{invite.specialization || 'N/A'}</TableCell>
                                                        <TableCell>{invite.experience || 'N/A'}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={invite.status === "PENDING_USER" ? "secondary" : "outline"}>
                                                                {invite.status === "PENDING_USER" ? "Awaiting User" : "Awaiting Admin"}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {invite.createdAt ? new Date(invite.createdAt).toLocaleDateString() : 'N/A'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : 'N/A'}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                    {invite.status === "PENDING_ADMIN" && (
                                                                        <DropdownMenuItem onClick={() => handleFinalizeInvitation(invite._id)}>
                                                                            <UserCheck className="mr-2 h-4 w-4" />
                                                                            Approve Invitation
                                                                        </DropdownMenuItem>
                                                                    )}
                                                                    <DropdownMenuItem onClick={() => handleResendInvitation(invite._id)}>
                                                                        <Send className="mr-2 h-4 w-4" />
                                                                        Resend Invitation
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem>
                                                                        <Eye className="mr-2 h-4 w-4" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem
                                                                        className="text-red-600"
                                                                        onClick={() => handleCancelInvitation(invite._id)}
                                                                    >
                                                                        <UserX className="mr-2 h-4 w-4" />
                                                                        Cancel Invitation
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default MentorsTab