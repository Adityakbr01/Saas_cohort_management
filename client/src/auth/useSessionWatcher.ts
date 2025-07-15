import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { logout as localLogout } from "@/utils/authUtils";
import {
  useLogoutMutation,
  useRefreshTokenMutation,
} from "@/store/features/auth/authApi";
import { selectIsAuthenticated } from "@/store/features/slice/UserAuthSlice";

interface DecodedToken {
  exp: number;
}

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email",
  "/reset-password",
  "/about",
  "/subscription",
  "/courses",
];

const useSessionWatcher = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [refreshToken] = useRefreshTokenMutation();
  const [logoutApi] = useLogoutMutation();

  useEffect(() => {
    const isPublicRoute = () => {
      if (typeof window === "undefined") return false;
      const currentPath = window.location.pathname;
      return PUBLIC_ROUTES.some((route) => currentPath.startsWith(route));
    };

    const canWatchSession =
      isAuthenticated &&
      !isPublicRoute() &&
      localStorage.getItem("accessToken") &&
      localStorage.getItem("user");

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!canWatchSession) return;

    const checkSession = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.warn("[DEBUG] No token found, logging out");
        handleLogout();
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(accessToken);
        const now = Date.now();
        const expiry = decoded.exp * 1000;
        const nearExpiry = expiry - now < 5 * 60 * 1000; // 5 min

        if (expiry < now) {
          console.log("[DEBUG] Token expired");
          handleLogout();
        } else if (nearExpiry) {
          try {
            const res = await refreshToken(undefined).unwrap();
            if (res?.data?.accessToken) {
              localStorage.setItem("accessToken", res.data.accessToken);
              console.log("[DEBUG] Access token refreshed");
            }
          } catch (err) {
            console.error("[DEBUG] Refresh failed", err);
          }
        }
      } catch (err) {
        console.error("[DEBUG] Failed to decode token", err);
        // Let next interval handle it
      }
    };

    const handleLogout = async () => {
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
      localLogout();
      try {
        await logoutApi().unwrap();
      } catch (err) {
        console.error("[DEBUG] Logout API failed:", err);
      }
    };

    intervalRef.current = setInterval(checkSession, 5000); // 5 sec

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log("[DEBUG] Watcher cleanup complete.");
      }
    };
  }, [isAuthenticated, refreshToken, logoutApi]);

  return null;
};

export default useSessionWatcher;
