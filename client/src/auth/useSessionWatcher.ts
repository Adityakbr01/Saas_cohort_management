import { useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { logout } from "@/utils/authUtils";
import { useLogoutMutation, useRefreshTokenMutation } from "@/store/features/auth/authApi";

interface DecodedToken {
  exp: number;
}

const useSessionWatcher = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [refreshToken] = useRefreshTokenMutation();
  const [logoutApi] = useLogoutMutation()

  useEffect(() => {
    const checkSession = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshTokenStr = localStorage.getItem("refreshToken");

      if (!accessToken) {
        if (refreshTokenStr) {
          try {
            const result = await refreshToken({
              refreshToken: refreshTokenStr,
            }).unwrap();

            console.log(result?.data?.accessToken);
            if (result?.data?.accessToken) {
              console.log(result?.data?.accessToken);
              localStorage.setItem("accessToken", result?.data?.accessToken);
              return;
            }
          } catch (refreshError) {
            console.error(
              "[DEBUG] useSessionWatcher: Failed to refresh token:",
              refreshError
            );
            logout();
            await logoutApi(undefined).unwrap();
          }
        } else {
          console.log(
            "[DEBUG] useSessionWatcher: No refresh token found, logging out"
          );
          logout();
          await logoutApi(undefined).unwrap();
        }
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(accessToken);
        const isExpired = decoded.exp * 1000 < Date.now();
        const isNearExpiry = decoded.exp * 1000 - Date.now() < 5 * 60 * 1000;

        if (isExpired) {
          console.log(
            "[DEBUG] useSessionWatcher: Access token expired, logging out"
          );
          logout();
          await logoutApi(undefined).unwrap();
          return;
        }

        if (isNearExpiry && refreshTokenStr) {
          try {
            const result = await refreshToken({
              refreshToken: refreshTokenStr,
            }).unwrap();
            if (result?.data?.accessToken) {
              console.log(
                "[DEBUG] useSessionWatcher: New access token received"
              );
              localStorage.setItem("accessToken", result?.data?.accessToken);
            }
          } catch (refreshError) {
            console.error(
              "[DEBUG] useSessionWatcher: Failed to refresh token:",
              refreshError
            );
            // Don't logout immediately; let next interval handle it
          }
        }
      } catch (err) {
        console.error("[DEBUG] useSessionWatcher: JWT Decode Error:", err);
        // Don't logout on decode error; let next interval retry
      }
    };

    // Start interval (every 15s)
    intervalRef.current = setInterval(checkSession, 15000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshToken]);

  return null; // Hook doesn't need to return anything
};

export default useSessionWatcher;
