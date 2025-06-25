import { getCurrentUserRole } from "@/utils/authUtils";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userRole = getCurrentUserRole();
    setRole(userRole);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return; // Replace with spinner if needed
  }

  if (role) {
    // Redirect based on role
    const redirectPath =
      role === "super_admin" ? "/dashboard/super_admin" :
      role === "org_admin" ? "/dashboard/org_admin" :
      role === "user" ? "/dashboard/user" : "/";
    return <Navigate to={redirectPath} replace />;
  }

  return <div className="w-full">{children}</div>;
};

export default PublicRoute;