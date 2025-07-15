import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "@/auth/ProtectedRoute";
import PublicRoute from "@/auth/PublicRoute";
import LoaderPage from "@/components/Loader";
import { Role } from "@/config/constant";
import Home from "@/pages/Home";

// 👇 Lazy-loaded components

const About = lazy(() => import("@/components/About"));
const SubscriptionPage = lazy(() => import("@/components/Subscription/Subscription"));

const CoursesPage = lazy(() => import("@/pages/Courses"));
const CourseDetailPage = lazy(() => import("@/pages/CourseDetailPage"));
const LearnCourse = lazy(() => import("@/pages/LearnCourse"));

const Login = lazy(() => import("@/pages/Auth/Login"));
const Register = lazy(() => import("@/pages/Auth/Register2"));
const ForgotPassword = lazy(() => import("@/pages/Auth/ForgotPassword"));

const NotFound = lazy(() => import("@/pages/NotFound"));
const Unauthorized = lazy(() => import("@/pages/Unauthorized"));

const Whiteboard = lazy(() => import("@/pages/WhiteboardPage"));
const ProfilePage = lazy(() => import("@/pages/Student/ProfilePage"));

const DashboardLayout = lazy(() => import("@/components/superAdmin/DashboardLayout"));
const Overview = lazy(() => import("@/components/superAdmin/pages/overview"));
const SubscriptionsPage = lazy(() => import("@/components/superAdmin/pages/subscriptions-page"));
const OrgAdminsPage = lazy(() => import("@/components/superAdmin/pages/org-admins-page"));
const AnalyticsPage = lazy(() => import("@/components/superAdmin/pages/analytics-page"));
const UserManagementPage = lazy(() => import("@/components/superAdmin/pages/user-management-page"));
const PermissionsPage = lazy(() => import("@/components/superAdmin/pages/permissions-page"));
const NotificationsPage = lazy(() => import("@/components/superAdmin/pages/notifications-page"));
const ReportsPage = lazy(() => import("@/components/superAdmin/pages/reports-page"));
const CalendarPage = lazy(() => import("@/components/superAdmin/pages/calendar-page"));
const HelpPage = lazy(() => import("@/components/superAdmin/pages/help-page"));
const SettingsPage = lazy(() => import("@/components/superAdmin/pages/settings-page"));
const UserProfilePage = lazy(() => import("@/components/superAdmin/pages/user-profile-page"));

const OrgAdminDashboard = lazy(() => import("@/components/orgAdmin/DashboardLayout"));
const CreateOrg = lazy(() => import("@/components/orgAdmin/pages/CreateOrg"));
const MentorPage = lazy(() => import("@/components/mentorDashboard/MentorPage"));

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <Home />
        }
      />

      <Route
        path="/about"
        element={
          <Suspense fallback={<LoaderPage />}>
            <About />
          </Suspense>
        }
      />

      <Route
        path="/subscription"
        element={
          <Suspense fallback={<LoaderPage />}>
            <SubscriptionPage />
          </Suspense>
        }
      />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Suspense fallback={<LoaderPage />}>
              <Login />
            </Suspense>
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Suspense fallback={<LoaderPage />}>
              <Register />
            </Suspense>
          </PublicRoute>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <Suspense fallback={<LoaderPage />}>
            <ForgotPassword />
          </Suspense>
        }
      />

      <Route
        path="/courses"
        element={
          <Suspense fallback={<LoaderPage />}>
            <CoursesPage />
          </Suspense>
        }
      />

      <Route
        path="/courses/:id"
        element={
          <Suspense fallback={<LoaderPage />}>
            <CourseDetailPage />
          </Suspense>
        }
      />

      {/* Protected Super Admin Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <Suspense fallback={<LoaderPage />}>
              <DashboardLayout />
            </Suspense>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard/super_admin" element={<Suspense fallback={<LoaderPage />}><Overview /></Suspense>} />
        <Route path="/subscriptions" element={<Suspense fallback={<LoaderPage />}><SubscriptionsPage /></Suspense>} />
        <Route path="/org-admins" element={<Suspense fallback={<LoaderPage />}><OrgAdminsPage /></Suspense>} />
        <Route path="/analytics" element={<Suspense fallback={<LoaderPage />}><AnalyticsPage /></Suspense>} />
        <Route path="/users" element={<Suspense fallback={<LoaderPage />}><UserManagementPage /></Suspense>} />
        <Route path="/permissions" element={<Suspense fallback={<LoaderPage />}><PermissionsPage /></Suspense>} />
        <Route path="/notifications" element={<Suspense fallback={<LoaderPage />}><NotificationsPage /></Suspense>} />
        <Route path="/reports" element={<Suspense fallback={<LoaderPage />}><ReportsPage /></Suspense>} />
        <Route path="/calendar" element={<Suspense fallback={<LoaderPage />}><CalendarPage /></Suspense>} />
        <Route path="/help" element={<Suspense fallback={<LoaderPage />}><HelpPage /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<LoaderPage />}><SettingsPage /></Suspense>} />
        <Route path="/dashboard/profile" element={<Suspense fallback={<LoaderPage />}><UserProfilePage /></Suspense>} />
      </Route>

      {/* Org Admin */}
      <Route
        path="/dashboard/org_admin"
        element={
          <ProtectedRoute allowedRoles={[Role.organization]}>
            <Suspense fallback={<LoaderPage />}>
              <OrgAdminDashboard />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-org"
        element={
          <ProtectedRoute allowedRoles={["org_admin"]}>
            <Suspense fallback={<LoaderPage />}>
              <CreateOrg />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Mentor */}
      <Route
        path="/dashboard/mentor"
        element={
          <ProtectedRoute allowedRoles={["mentor", "org_admin"]}>
            <Suspense fallback={<LoaderPage />}>
              <MentorPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Student */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={["student"]}>
            <Suspense fallback={<LoaderPage />}>
              <ProfilePage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Whiteboard */}
      <Route
        path="/whiteboard"
        element={
          <ProtectedRoute allowedRoles={["student", "mentor", "org_admin", "super_admin"]}>
            <Suspense fallback={<LoaderPage />}>
              <Whiteboard />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Learn */}
      <Route
        path="/learn/:cohortId"
        element={
          <Suspense fallback={<LoaderPage />}>
            <LearnCourse params={{ cohortId: "1" }} />
          </Suspense>
        }
      />

      {/* Others */}
      <Route path="/unauthorized" element={<Suspense fallback={<LoaderPage />}><Unauthorized /></Suspense>} />
      <Route path="*" element={<Suspense fallback={<LoaderPage />}><NotFound /></Suspense>} />
    </Routes>
  );
};

export default AppRoutes;
