import { authApi } from "@/store/features/auth/authApi";
import { setUser, logout } from "@/store/features/slice/UserAuthSlice";
import { useAppDispatch } from "@/store/hook";
import { useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
}

const AppInitializer = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        let accessToken = localStorage.getItem("accessToken");
        const refreshTokenStr = localStorage.getItem("refreshToken");

        if (!storedUser || !refreshTokenStr) {
          console.log("[DEBUG] AppInitializer: Missing user or refreshToken, logging out");
          localStorage.clear();
          dispatch(logout());
          return;
        }

        // ✅ Try to decode or refresh access token
        let decoded: DecodedToken | null = null;

        try {
          if (accessToken) {
            decoded = jwtDecode(accessToken);
            if(!decoded) throw new Error("Invalid token");
            const isExpired = decoded.exp * 1000 < Date.now();

            if (isExpired) {
              console.log("[DEBUG] AppInitializer: Access token expired, trying refresh");
              accessToken = await tryRefreshToken(refreshTokenStr);
            }
          } else {
            console.log("[DEBUG] AppInitializer: No access token, trying refresh");
            accessToken = await tryRefreshToken(refreshTokenStr);
          }

          if (!accessToken) {
            console.log("[DEBUG] AppInitializer: Refresh failed, logging out");
            localStorage.clear();
            dispatch(logout());
            return;
          }
        } catch (err) {
          console.error("[DEBUG] AppInitializer: Access token invalid/decoding error", err);
          accessToken = await tryRefreshToken(refreshTokenStr);
          if (!accessToken) {
            localStorage.clear();
            dispatch(logout());
            return;
          }
        }

        // ✅ Set user in Redux
        try {
          const parsedUser = JSON.parse(storedUser);
          dispatch(setUser(parsedUser));

          try {
            const serverUser = await dispatch(
              authApi.endpoints.getProfile.initiate(undefined)
            ).unwrap();

            if (serverUser?.data) {
              dispatch(setUser(serverUser.data));
            }
          } catch (err) {
            console.warn("[DEBUG] AppInitializer: Failed to verify user from server", err);
          }
        } catch (err) {
          console.error("[DEBUG] AppInitializer: Invalid user data", err);
          localStorage.clear();
          dispatch(logout());
        }

      } catch (err) {
        console.error("[DEBUG] AppInitializer: Critical error", err);
        localStorage.clear();
        dispatch(logout());
      }
    };

    // 🔁 Try Refresh Function
    const tryRefreshToken = async (refreshTokenStr: string): Promise<string | null> => {
      try {
        const response = await dispatch(
          authApi.endpoints.refreshToken.initiate({ refreshToken: refreshTokenStr })
        ).unwrap();

        if (response?.data?.accessToken) {
          localStorage.setItem("accessToken", response.data.accessToken);
          console.log("[DEBUG] AppInitializer: Token refreshed");
          return response.data.accessToken;
        }
      } catch (err) {
        console.error("[DEBUG] AppInitializer: Refresh token failed", err);
      }
      return null;
    };

    initializeAuth();
  }, [dispatch]);

  return null;
};

export default AppInitializer;
