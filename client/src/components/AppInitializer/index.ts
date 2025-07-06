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

        // 🔁 Try Refresh if no accessToken
        if (!accessToken) {
          console.log("[DEBUG] No accessToken found, trying refresh...");
          accessToken = await tryRefreshToken();
          if (accessToken) {
            console.log("[DEBUG] Refresh successful");
          }
        }

        // ❌ If still no accessToken after refresh
        if (!accessToken) {
          console.log("[DEBUG] Refresh failed, logging out");
          localStorage.clear();
          dispatch(logout());
          return;
        }

        // ✅ Decode and validate token
        try {
          const decoded: DecodedToken = jwtDecode(accessToken);
          const isExpired = decoded.exp * 1000 < Date.now();
          if (isExpired) {
            console.log("[DEBUG] Token expired, trying refresh...");
            accessToken = await tryRefreshToken();
            if (!accessToken) {
              localStorage.clear();
              dispatch(logout());
              return;
            }
          }
        } catch (decodeErr) {
          console.log("[DEBUG] Invalid token, trying refresh...", decodeErr);
          accessToken = await tryRefreshToken();
          if (!accessToken) {
            localStorage.clear();
            dispatch(logout());
            return;
          }
        }

        // ✅ Load user
        try {
          if (!storedUser) {
            console.log(
              "[DEBUG] No stored user found, fetching from server..."
            );
            const serverUser = await dispatch(
              authApi.endpoints.getProfile.initiate(undefined)
            ).unwrap();

            if (serverUser?.data) {
              dispatch(setUser(serverUser.data));
              localStorage.setItem("user", JSON.stringify(serverUser.data));
              return;
            }

            throw new Error("No user data from server");
          }

          const parsedUser = JSON.parse(storedUser);
          dispatch(setUser(parsedUser));

          // Optionally verify latest profile
          const serverUser = await dispatch(
            authApi.endpoints.getProfile.initiate(undefined)
          ).unwrap();

          if (serverUser?.data) {
            dispatch(setUser(serverUser.data));
            localStorage.setItem("user", JSON.stringify(serverUser.data));
          }
        } catch (userErr) {
          console.log("[DEBUG] Failed to load user", userErr);
          localStorage.clear();
          dispatch(logout());
        }
      } catch (err) {
        console.error("[DEBUG] Critical error", err);
        localStorage.clear();
        dispatch(logout());
      }
    };

    const tryRefreshToken = async (): Promise<string | null> => {
      try {
        const response = await dispatch(
          authApi.endpoints.refreshToken.initiate(undefined)
        ).unwrap();

        if (response?.data?.accessToken) {
          localStorage.setItem("accessToken", response.data.accessToken);
          console.log("[DEBUG] Access token refreshed");
          return response.data.accessToken;
        }
      } catch (err) {
        console.error("[DEBUG] Refresh token failed", err);
      }
      return null;
    };

    initializeAuth();
  }, [dispatch]);

  return null;
};

export default AppInitializer;
