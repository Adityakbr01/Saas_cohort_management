// User type
export interface User {
  id: string;            // usually _id from DB
  name: string;
  email: string;
  role: "super_admin" | "org_admin" | "mentor" | "user"; // example roles
  avatarUrl?: string;    // optional user avatar image URL
  createdAt: string;     // ISO date string
  updatedAt: string;
  plan: any
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
  students: string[];
  createdAt: string;
  updatedAt: string;
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