import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { selectCurrentUser, setUser } from "@/store/features/slice/UserAuthSlice";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { CertificatesTab } from "./CertificatesTab";
import { CoursesTab, type UserData } from "./CoursesTab";
import { SettingsTab } from "./SettingsTab";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  location?: string;
  avatar?: string;
  profileImageUrl?: string;
  createdAt: string;
  streakDays: number;
  xp: number;
  courseProgress?: any[];
  certificates?: { id: string; title: string; instructor: string; issueDate: string }[];
  stats?: {
    coursesCompleted: number;
    coursesInProgress: number;
    totalHoursLearned: number;
    certificatesEarned: number;
  };
  role: string;
    enrolledCourses: {
    id: string;
    title: string;
    thumbnail: string;
    progress: number;
    status: "In Progress" | "Completed";
    lastAccessed: string;
    timeSpent: string;
    streakDays: number;
    xp: number;
    byType: Record<string, number>;
    timeSpentSeconds: number;
  }[];

}

export default function ProfilePage() {
  const user = useSelector(selectCurrentUser) as User | null;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>(() => localStorage.getItem("activeTab") || "courses");

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem("user");
      const accessToken = localStorage.getItem("accessToken");
      if (storedUser && accessToken) {
        try {
          const parsedUser = JSON.parse(storedUser);
          dispatch(setUser(parsedUser));
        } catch (error) {
          console.error("[DEBUG] ProfilePage: Failed to parse user:", error);
          navigate("/login", { replace: true });
        }
      } else {
        navigate("/login", { replace: true });
      }
    }
  }, [user, dispatch, navigate]);

const enrichedCourses: UserData["enrolledCourses"] = (user?.courseProgress || []).map((progress) => {
  const timeSpentSeconds = progress.timeSpentSeconds || 0;

  return {
    id: String(progress.cohortId || ""),
    title: String(progress.title || ""),
    thumbnail: String(progress.thumbnail || ""),
    progress: Number(progress.overallProgress || 0),
    status: progress.overallProgress >= 100 ? "Completed" : "In Progress",
    lastAccessed: String(progress.lastUpdated || new Date().toISOString()),
    timeSpent: String(progress.timeSpent || "0h 0m"),
    streakDays: Number(progress.streakDays || 0),
    xp: Number(progress.xp || 0),
    byType: progress.byType || { video: 0, quiz: 0, assignment: 0 },
    timeSpentSeconds,
  };
});


const userData = {
  name: user?.name || "Unknown User",
  email: user?.email || "N/A",
  phone: user?.phone || "N/A",
  location: user?.location || "N/A",
  bio: user?.bio || "No bio provided",
  avatar: user?.avatar || user?.profileImageUrl || "/placeholder.svg",
  profileImageUrl: user?.profileImageUrl || "",
  createdAt: user?.createdAt || new Date().toISOString(),
  role: user?.role || "student",
  xp: user?.xp || 0,
  streakDays: user?.streakDays || 0,
  enrolledCourses: enrichedCourses,
  courseProgress: user?.courseProgress || [],
  certificates: user?.certificates || [],
  stats: user?.stats || {
    coursesCompleted: enrichedCourses.filter(c => c.status === "Completed").length,
    coursesInProgress: enrichedCourses.filter(c => c.status === "In Progress").length,
    totalHoursLearned: enrichedCourses.reduce((acc, c) => acc + (c.timeSpentSeconds || 0) / 3600, 0),
    certificatesEarned: user?.certificates?.length || 0,
  },
};


  if (!user) return null;
  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="rounded-lg shadow p-6">
              <img src={userData.avatar} alt="Profile" className="h-24 w-24 rounded-full mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-center">{userData.name}</h3>
              <p className="text-sm text-gray-600 text-center">{userData.email}</p>
              <p className="text-sm text-gray-600 text-center mt-2">{userData.bio}</p>
              <p className="text-sm text-gray-600 text-center mt-2">Joined: {new Date(userData.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-200 rounded-lg">
                <TabsTrigger value="courses" className="data-[state=active]:bg-white">My Courses</TabsTrigger>
                <TabsTrigger value="certificates" className="data-[state=active]:bg-white">Certificates</TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-white">Settings</TabsTrigger>
              </TabsList>
              <CoursesTab userData={userData} />
              <CertificatesTab userData={userData} />
              <SettingsTab userData={userData} />
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}