

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { selectCurrentUser, setUser } from "@/store/features/slice/UserAuthSlice"
import { CertificatesTab } from "./CertificatesTab"
import { SettingsTab } from "./SettingsTab"
import {  ProfileSidebar } from "./ProfileSidebar"
import { CoursesTab } from "./CoursesTab"
import { format } from "date-fns";


// TypeScript interface
interface User {
  _id: string
  name: string
  email: string
  phone: string
  bio: string
  location?: string
  avatar?: string
  createdAt: string
  enrolledCourses?: {
    id: string
    title: string
    instructor: string
    progress: number
    thumbnail: string
    status: "In Progress" | "Completed"
    lastAccessed: string
  }[]
  certificates?: {
    id: string
    title: string
    instructor: string
    issueDate: string
  }[]
  stats?: {
    coursesCompleted: number
    coursesInProgress: number
    totalHoursLearned: number
    certificatesEarned: number
  }
  role: string
  isActive: boolean
  isVerified: boolean
  lastLogin: string
  overallProgress: number
  engagementScore: number
  streak: number
  tokenVersion: number
  updatedAt: string
  xp: number
  profileImageUrl: string
}

export default function ProfilePage() {
  const user = useSelector(selectCurrentUser) as User | null
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem("activeTab") || "courses"
  })

  // Persist active tab in localStorage
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab)
    
  }, [activeTab])

  // Check localStorage and restore session
  useEffect(() => {
    if (!user) {

      const storedUser = localStorage.getItem("user")
      const accessToken = localStorage.getItem("accessToken")

      if (storedUser && accessToken) {
        try {
          const parsedUser = JSON.parse(storedUser)
      
          dispatch(setUser(parsedUser))
        } catch (error) {
          console.error("[DEBUG] ProfilePage: Failed to parse user from localStorage:", error)
          navigate("/login", { replace: true })
        }
      } else {
        navigate("/login", { replace: true })
      }
    } else {
    return;
    }
  }, [user, dispatch, navigate])

  // Merge user data with defaults
  const userData = {
    name: user?.name || "Unknown User",
    email: user?.email || "N/A",
    phone: user?.phone || "N/A",
    location: user?.location || "N/A",
    bio: user?.bio || "No bio provided",
    joinDate: user?.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "N/A",
    avatar: user?.avatar || "/placeholder.svg",
    profileImageUrl: user?.profileImageUrl || "/placeholder.svg",
    enrolledCourses: user?.enrolledCourses || [],
    certificates: user?.certificates || [],
    stats: {
      coursesCompleted: user?.stats?.coursesCompleted || 0,
      coursesInProgress: user?.stats?.coursesInProgress || 0,
      totalHoursLearned: user?.stats?.totalHoursLearned || 0,
      certificatesEarned: user?.stats?.certificatesEarned || 0,
    },
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <ProfileSidebar userData={userData} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="courses">My Courses</TabsTrigger>
                <TabsTrigger value="certificates">Certificates</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <CoursesTab userData={userData} />
              <CertificatesTab userData={userData} />
              <SettingsTab userData={userData} />
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}