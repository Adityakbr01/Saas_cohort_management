import { getCurrentUserRole } from "@/utils/authUtils";
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AnimatedPencil from "@/components/AnimatedPencil";

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
    return <AnimatedPencil />; // Replace with spinner if needed
  }

  if (role) {
    // Redirect based on role
    const redirectPath =
      role === "super_admin" ? "/dashboard/super_admin" :
      role === "org_admin" ? "/dashboard/org_admin" :
      role === "user" ? "/dashboard/user" : "/";
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;