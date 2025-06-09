import ProtectedRoute from "@/auth/ProtectedRoute";
import DashboardHome from "@/components/superAdmin/DashboardHome";
import DashboardLayout from "@/components/superAdmin/DashboardLayout";
import OrganizationsList from "@/components/superAdmin/OrganizationsList";
import UsersList from "@/components/superAdmin/UsersList";
import Login from "@/pages/Auth/Login";
import Register from "@/pages/Auth/Register";
import NotFound from "@/pages/NotFound";
import { Navigate, Route, Routes } from "react-router-dom";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/super_admin/dashboard" replace />} />
      {/* Super Admin Dashboard (Only for super_admin) */}
      <Route
        path="/super_admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="organizations" element={<OrganizationsList />} />
        <Route path="users" element={<UsersList />} />
      </Route>


      {/* login and register routes */}

      <Route
        path="/login" element={<Login />} />

      <Route
        path="/register"
        element={<Register />} />

      {/* Add more role-based routes below */}
      <Route path="/unauthorized" element={<div>403 Unauthorized</div>} />
      <Route path="*" element={<NotFound/>} />
    </Routes>
  );
};

export default AppRoutes;
