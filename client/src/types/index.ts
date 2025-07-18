// User type
export interface User {
  id: string;            // usually _id from DB
  name: string;
  email: string;
  role: "super_admin" | "org_admin" | "mentor" | "user"; // example roles
  avatarUrl?: string;    // optional user avatar image URL
  createdAt: string;     // ISO date string
  updatedAt: string;
  plan: string;
  _id: string;
  profileImageUrl: string;
  specialization: string;
  experience: string;
  bio: string;
  certifications: {
    name: string;
    issuer: string;
    date: string;
  }[];
  skillsExpertise: string[];
  yearsOfExperience: number;
  availability: string[];
  teachingStyle: string;
  studentCapacity: number;
  currentStudents: number;
  rating: number;
  overallRating: number;
  studentCompletionRate: number;
  responseTime: string;
  phone:string
}


export interface OrganizationMember {
  _id: string;
  user: string; // ya `User` agar populated hai to
  joinDate: string;
  suspended: {
    isSuspended: boolean;
    suspendedAt: string | null;
    reason: string;
  };
}

// Organization type
export interface Organization {
  id: string;            // org _id
  name: string;
  slug: string;
  logo?: string;
  ownerId: User;         // populated owner info
  Members: User[];       // populated members array
  createdAt: string;
  updatedAt: string;
  _id: string
  email: string;
  isVerified: boolean;
  isActive: boolean;
  plan: string;
}

// DashboardData type - example with counts and lists
export interface DashboardData {
  totalUsers: number;
  totalOrganizations: number;
  recentOrganizations: Organization[];
  recentUsers: User[];
  // you can add more stats or lists as per your dashboard
}



export interface FieldError {
  path: string[];
  message: string;
}

export interface APIErrorResponse {
  status: number;
  data: {
    message?: string;
    error?: FieldError[];
  };
}


export interface Cohort {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  organization: string;
  mentors: string[];

  createdAt: string;
  updatedAt: string;
  shortDescription: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  students: number;
  Thumbnail: string;
  price: string;
  status: "upcoming" | "active" | "completed";
}


export interface Student {
  _id: string;
  name: string;
  email: string;
  status: string;
  progress: number;
  lastActive: string;
  avatar: string;
  assignments: { completed: number; total: number };
  grade: string;
  attendanceRate: number;
}

export interface Cohort {
  _id: string;
  title: string;
  shortDescription: string;
  description: string;
  startDate: string;
  endDate: string;
  status: "upcoming" | "active" | "completed";
  organization: string;
  mentors: string[];
  mentor: Mentor;
  students: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  Thumbnail: string;
  demoVideo: string;
  category: string;
  certificateAvailable: boolean;
  chapters: string[];
  completionRate: number;
  progress: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  language: string;
  location: string;
  maxCapacity: number;
  isDeleted: boolean;
  isPrivate: boolean;
  schedule: string;
  tags: string[];
  prerequisites: string[];
  __v: number;
}

export interface Mentor {
  _id: string;
  name: string;
  phone: string;
  // aap aur fields bhi add kar sakte hain based on actual data
  refreshToken?: string;
  suspended?: boolean;
}



export interface Chapter {
  _id: string;
  title: string;
  description: string;
  position: number;
  cohort: string;
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
  status: string;
  totalDuration: number;
  totalLessons: number;
  shortDescription:string
}

export interface Lesson {
  _id: string;
  title: string;
  description: string;
  position: number;
  chapter: string;
  createdAt: string;
  updatedAt: string;
  shortDescription: string;
  status: string;
  contentType: string;
  isPrivate?: boolean;
  videoUrl?: string;
duration: number;
  type: string;
  id: string;
  order: number;
}