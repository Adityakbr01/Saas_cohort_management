import { useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { logout } from "@/utils/authUtils";
import { useLogoutMutation, useRefreshTokenMutation } from "@/store/features/auth/authApi";
import { selectIsAuthenticated } from "@/store/features/slice/UserAuthSlice";

interface DecodedToken {
  exp: number;
}

// Routes where session watcher should not run
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/verify-email',
  '/reset-password',
  '/about',
  '/subscription',
  '/courses'
];

const useSessionWatcher = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [refreshToken] = useRefreshTokenMutation();
  const [logoutApi] = useLogoutMutation();

  // Check if current route is public by examining window.location
  const isPublicRoute = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const currentPath = window.location.pathname;
    return PUBLIC_ROUTES.some(route => currentPath.startsWith(route));
  }, []);

  // Check if user has valid tokens in localStorage
  const hasValidTokens = useCallback(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshTokenStr = localStorage.getItem("refreshToken");
    const user = localStorage.getItem("user");

    return !!(accessToken && refreshTokenStr && user);
  }, []);

  // Determine if session watcher should be active
  const shouldWatchSession = isAuthenticated && !isPublicRoute() && hasValidTokens();

  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      console.log("[DEBUG] useSessionWatcher: Clearing existing interval");
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only start session watcher if user is authenticated and not on public routes
    if (!shouldWatchSession) {
      console.log("[DEBUG] useSessionWatcher: Not starting - shouldWatchSession:", shouldWatchSession, "isAuthenticated:", isAuthenticated, "isPublicRoute:", isPublicRoute(), "hasValidTokens:", hasValidTokens());
      return;
    }

    console.log("[DEBUG] useSessionWatcher: Starting session watcher");

    const checkSession = async () => {
      // Double-check authentication state before proceeding
      if (!hasValidTokens()) {
        console.log("[DEBUG] useSessionWatcher: No valid tokens found, stopping watcher");
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      const accessToken = localStorage.getItem("accessToken");
      const refreshTokenStr = localStorage.getItem("refreshToken");

      if (!accessToken) {
        if (refreshTokenStr) {
          try {
            console.log("[DEBUG] useSessionWatcher: Attempting token refresh");
            const result = await refreshToken({
              refreshToken: refreshTokenStr,
            }).unwrap();

            if (result?.data?.accessToken) {
              console.log("[DEBUG] useSessionWatcher: Token refresh successful");
              localStorage.setItem("accessToken", result?.data?.accessToken);
              return;
            }
          } catch (refreshError) {
            console.error("[DEBUG] useSessionWatcher: Failed to refresh token:", refreshError);
            // Clear interval before logout to prevent further execution
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            logout();
            try {
              await logoutApi(undefined).unwrap();
            } catch (logoutError) {
              console.error("[DEBUG] useSessionWatcher: Logout API failed:", logoutError);
            }
          }
        } else {
          console.log("[DEBUG] useSessionWatcher: No refresh token found, logging out");
          // Clear interval before logout
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          logout();
          try {
            await logoutApi(undefined).unwrap();
          } catch (logoutError) {
            console.error("[DEBUG] useSessionWatcher: Logout API failed:", logoutError);
          }
        }
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(accessToken);
        const isExpired = decoded.exp * 1000 < Date.now();
        const isNearExpiry = decoded.exp * 1000 - Date.now() < 5 * 60 * 1000;

        if (isExpired) {
          console.log("[DEBUG] useSessionWatcher: Access token expired, logging out");
          // Clear interval before logout
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          logout();
          try {
            await logoutApi(undefined).unwrap();
          } catch (logoutError) {
            console.error("[DEBUG] useSessionWatcher: Logout API failed:", logoutError);
          }
          return;
        }

        if (isNearExpiry && refreshTokenStr) {
          try {
            console.log("[DEBUG] useSessionWatcher: Token near expiry, refreshing");
            const result = await refreshToken({
              refreshToken: refreshTokenStr,
            }).unwrap();
            if (result?.data?.accessToken) {
              console.log("[DEBUG] useSessionWatcher: Token refresh successful");
              localStorage.setItem("accessToken", result?.data?.accessToken);
            }
          } catch (refreshError) {
            console.error("[DEBUG] useSessionWatcher: Failed to refresh near-expiry token:", refreshError);
            // Don't logout immediately on refresh failure; let next interval handle it
          }
        }
      } catch (err) {
        console.error("[DEBUG] useSessionWatcher: JWT Decode Error:", err);
        // Don't logout on decode error; let next interval retry
      }
    };

    // Start interval (every 15s) only if should watch session
    intervalRef.current = setInterval(checkSession, 15000);
    console.log("[DEBUG] useSessionWatcher: Interval started");

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        console.log("[DEBUG] useSessionWatcher: Cleaning up interval");
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [shouldWatchSession, logoutApi, refreshToken, isAuthenticated, isPublicRoute, hasValidTokens]);

  // Additional cleanup effect for when authentication state changes
  useEffect(() => {
    if (!isAuthenticated && intervalRef.current) {
      console.log("[DEBUG] useSessionWatcher: User logged out, clearing interval");
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isAuthenticated]);

  return null; // Hook doesn't need to return anything
};

export default useSessionWatcher;
