import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/superAdmin/Dashboard";
import ProtectedRoute from "@/auth/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/super_admin/dashboard" replace />} />

      {/* Super Admin Dashboard (Only for super_admin) */}
      <Route
        path="/super_admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={["super_admin"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Add more role-based routes below */}
      <Route path="/unauthorized" element={<div>403 Unauthorized</div>} />
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
