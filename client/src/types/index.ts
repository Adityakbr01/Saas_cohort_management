// User type
export interface User {
  id: string;            // usually _id from DB
  name: string;
  email: string;
  role: "super_admin" | "org_admin" | "mentor" | "user"; // example roles
  avatarUrl?: string;    // optional user avatar image URL
  createdAt: string;     // ISO date string
  updatedAt: string;
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
}

// DashboardData type - example with counts and lists
export interface DashboardData {
  totalUsers: number;
  totalOrganizations: number;
  recentOrganizations: Organization[];
  recentUsers: User[];
  // you can add more stats or lists as per your dashboard
}
