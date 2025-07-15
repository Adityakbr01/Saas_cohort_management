import { authApi } from "@/store/features/auth/authApi";
import { setUser, logout, setInitialized } from "@/store/features/slice/UserAuthSlice"; // 👈 add setInitialized
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

        if (!accessToken) {
          console.log("[DEBUG] No accessToken found, trying refresh...");
          accessToken = await tryRefreshToken();
        }

        if (!accessToken) {
          console.log("[DEBUG] Refresh failed, logging out");
          dispatch(logout());
          dispatch(setInitialized(true)); // ✅ INIT STATE SET
          return;
        }

        try {
          const decoded: DecodedToken = jwtDecode(accessToken);
          const isExpired = decoded.exp * 1000 < Date.now();
          if (isExpired) {
            console.log("[DEBUG] Token expired, trying refresh...");
            accessToken = await tryRefreshToken();
            if (!accessToken) {
              dispatch(logout());
              dispatch(setInitialized(true)); // ✅ INIT STATE SET
              return;
            }
          }
        } catch (decodeErr) {
          console.error("[DEBUG] Failed to decode token", decodeErr);
          console.log("[DEBUG] Invalid token, trying refresh...");
          accessToken = await tryRefreshToken();
          if (!accessToken) {
            dispatch(logout());
            dispatch(setInitialized(true)); // ✅ INIT STATE SET
            return;
          }
        }

        try {
          if (!storedUser) {
            const serverUser = await dispatch(
              authApi.endpoints.getProfile.initiate(undefined)
            ).unwrap();
            dispatch(setUser(serverUser.data));
            localStorage.setItem("user", JSON.stringify(serverUser.data));
          } else {
            const parsedUser = JSON.parse(storedUser);
            dispatch(setUser(parsedUser));

            // Optionally verify server user
            const serverUser = await dispatch(
              authApi.endpoints.getProfile.initiate(undefined)
            ).unwrap();
            dispatch(setUser(serverUser.data));
            localStorage.setItem("user", JSON.stringify(serverUser.data));
          }

          dispatch(setInitialized(true)); // ✅ Success path
        } catch (userErr) {
          console.log("[DEBUG] Failed to load user", userErr);
          dispatch(logout());
          dispatch(setInitialized(true)); // ✅ Even on user error
        }
      } catch (err) {
        console.error("[DEBUG] Critical error", err);
        dispatch(logout());
        dispatch(setInitialized(true)); // ✅ Always finalize
      }
    };

    const tryRefreshToken = async (): Promise<string | null> => {
      try {
        const response = await dispatch(
          authApi.endpoints.refreshToken.initiate(undefined)
        ).unwrap();

        if (response?.data?.accessToken) {
          localStorage.setItem("accessToken", response.data.accessToken);
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
