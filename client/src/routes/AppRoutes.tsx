import ProtectedRoute from "@/auth/ProtectedRoute"; // Import ProtectedRoute
import PublicRoute from "@/auth/PublicRoute"; // Import PublicRoute
import About from "@/components/About";
import SubscriptionPage from "@/components/Subscription/Subscription";
import { DashboardLayout } from "@/components/superAdmin/DashboardLayout";
import { AnalyticsPage } from "@/components/superAdmin/pages/analytics-page";
import { CalendarPage } from "@/components/superAdmin/pages/calendar-page";
import { HelpPage } from "@/components/superAdmin/pages/help-page";
import { NotificationsPage } from "@/components/superAdmin/pages/notifications-page";
import { OrgAdminsPage } from "@/components/superAdmin/pages/org-admins-page";
import { Overview } from "@/components/superAdmin/pages/overview";
import { PermissionsPage } from "@/components/superAdmin/pages/permissions-page";
import { ReportsPage } from "@/components/superAdmin/pages/reports-page";
import { SettingsPage } from "@/components/superAdmin/pages/settings-page";
import { SubscriptionsPage } from "@/components/superAdmin/pages/subscriptions-page";
import { UserManagementPage } from "@/components/superAdmin/pages/user-management-page";
import { UserProfilePage } from "@/components/superAdmin/pages/user-profile-page";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";
import { Route, Routes } from "react-router-dom";
// import Org_admin_Dashboard from "@/components/orgAdmin/Org_admin_Dashboard";
import OrgAdminDashboard from "@/components/orgAdmin/DashboardLayout";
import CreateOrg from "@/components/orgAdmin/pages/CreateOrg";
import MentorPage from "@/components/mentorDashboard/MentorPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />

      <Route path="/about" element={<About />} />
      <Route path="/subscription" element={<SubscriptionPage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      {/* Protected Super Admin Routes */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard/super_admin" element={<Overview />} />
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/org-admins" element={<OrgAdminsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/users" element={<UserManagementPage />} />
        <Route path="/permissions" element={<PermissionsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
      </Route>

      {/* Protected org admin Routes */}
      <Route
        path="/dashboard/org_admin"
        element={
          <ProtectedRoute allowedRoles={["super_admin", "org_admin"]}>
            <OrgAdminDashboard />
          </ProtectedRoute>
        }
      >
      </Route>

      <Route
        path="/create-org"
        element={
          <ProtectedRoute allowedRoles={["org_admin"]}>
            <CreateOrg />
          </ProtectedRoute>
        }
      />

      {/* Mentor Routes */}

      <Route
        path="/dashboard/mentor"
        element={
          <ProtectedRoute allowedRoles={["mentor","org_admin"]}>
            <MentorPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;