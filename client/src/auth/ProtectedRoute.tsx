import AnimatedPencil from "@/components/AnimatedPencil";
import { getCurrentUserRole } from "@/utils/authUtils";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userRole = getCurrentUserRole();
    setRole(userRole);
    setIsLoading(false);
  }, []);

  

  if (isLoading) {
    return <AnimatedPencil />; 
  }

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;