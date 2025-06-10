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
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import { Route, Routes } from "react-router-dom";

const AppRoutes = () => {
  return (
    <Routes>


      <Route path="/" element={<Home />}></Route>

      {/* super_admin Dashboard layout with nested routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/super_admin" element={<Overview />} />
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
      {/* login and register routes */}
      <Route
        path="/login" element={<Login />} />
      <Route
        path="/register"
        element={<Register />} />

      {/* Add more role-based routes below */}
      <Route path="/unauthorized" element={<div>403 Unauthorized</div>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
