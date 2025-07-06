import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { logout } from "@/utils/authUtils";
import { useLogoutMutation, useRefreshTokenMutation } from "@/store/features/auth/authApi";
import { selectIsAuthenticated } from "@/store/features/slice/UserAuthSlice";

interface DecodedToken {
  exp: number;
}

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/verify-email',
  '/reset-password',
  '/about',
  '/subscription',
  '/courses',
];

const useSessionWatcher = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [refreshToken] = useRefreshTokenMutation();
  const [logoutApi] = useLogoutMutation();

  useEffect(() => {
    const isPublicRoute = () => {
      if (typeof window === 'undefined') return false;
      const currentPath = window.location.pathname;
      return PUBLIC_ROUTES.some(route => currentPath.startsWith(route));
    };

    const hasValidTokens = () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshTokenStr = localStorage.getItem("refreshToken");
      const user = localStorage.getItem("user");
      return !!(accessToken && refreshTokenStr && user);
    };

    const canWatchSession = isAuthenticated && !isPublicRoute() && hasValidTokens();

    // Cleanup existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!canWatchSession) {
      return;
    }

    const checkSession = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshTokenStr = localStorage.getItem("refreshToken");

      if (!accessToken) {
        if (refreshTokenStr) {
          try {
            const result = await refreshToken({ refreshToken: refreshTokenStr }).unwrap();
            if (result?.data?.accessToken) {
              console.log("[DEBUG] Token refreshed from absence");
              localStorage.setItem("accessToken", result?.data?.accessToken);
              return;
            }
          } catch (refreshError) {
            console.error("[DEBUG] Refresh failed (no accessToken):", refreshError);
            handleLogout();
          }
        } else {
          console.warn("[DEBUG] No tokens found, logging out");
          handleLogout();
        }
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(accessToken);
        const currentTime = Date.now();
        const expiryTime = decoded.exp * 1000;
        const isExpired = expiryTime < currentTime;
        const isNearExpiry = expiryTime - currentTime < 5 * 60 * 1000;

        if (isExpired) {
          console.log("[DEBUG] Access token expired, logging out");
          handleLogout();
          return;
        }

        if (isNearExpiry && refreshTokenStr) {
          try {
            const result = await refreshToken({ refreshToken: refreshTokenStr }).unwrap();
            if (result?.data?.accessToken) {
              console.log("[DEBUG] Access token refreshed (near expiry)");
              localStorage.setItem("accessToken", result?.data?.accessToken);
            }
          } catch (refreshError) {
            console.error("[DEBUG] Refresh failed (near expiry):", refreshError);
            // Don’t force logout immediately, next interval will handle
          }
        }
      } catch (decodeError) {
        console.error("[DEBUG] Failed to decode token:", decodeError);
        // Retry on next interval
      }
    };

    const handleLogout = async () => {
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
      logout(); // Local logout
      try {
        await logoutApi(undefined).unwrap(); // Server logout
      } catch (logoutError) {
        console.error("[DEBUG] Logout API failed:", logoutError);
      }
    };

    intervalRef.current = setInterval(checkSession, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        console.log("[DEBUG] Watcher cleanup complete.");
      }
    };
  }, [isAuthenticated, refreshToken, logoutApi]);

  // Safety: stop watcher if user logs out
  useEffect(() => {
    if (!isAuthenticated && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log("[DEBUG] Cleared session watcher after logout");
    }
  }, [isAuthenticated]);

  return null;
};

export default useSessionWatcher;
