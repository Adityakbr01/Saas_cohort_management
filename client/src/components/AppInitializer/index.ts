// src/components/AppInitializer/index.tsx

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
        // First, check localStorage for existing authentication data
        const storedUser = localStorage.getItem("user");
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");

        console.log("[DEBUG] AppInitializer: Checking localStorage auth data");

        if (!storedUser || !accessToken || !refreshToken) {
          console.log("[DEBUG] AppInitializer: No complete auth data in localStorage");
          // Clear any partial data
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          dispatch(logout());
          return;
        }

        // Validate access token
        try {
          const decoded: DecodedToken = jwtDecode(accessToken);
          const isExpired = decoded.exp * 1000 < Date.now();

          if (isExpired) {
            console.log("[DEBUG] AppInitializer: Access token expired, clearing auth data");
            localStorage.removeItem("user");
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            dispatch(logout());
            return;
          }
        } catch (tokenError) {
          console.error("[DEBUG] AppInitializer: Invalid access token:", tokenError);
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          dispatch(logout());
          return;
        }

        // Parse and set user data in Redux
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log("[DEBUG] AppInitializer: Setting user from localStorage:", parsedUser);
          dispatch(setUser(parsedUser));

          // Optionally, verify with server (but don't block on it)
          try {
            const serverUser = await dispatch(
              authApi.endpoints.getProfile.initiate(undefined)
            ).unwrap();

            if (serverUser?.data) {
              console.log("[DEBUG] AppInitializer: Updated user from server:", serverUser.data);
              dispatch(setUser(serverUser.data));
            }
          } catch (serverError) {
            console.warn("[DEBUG] AppInitializer: Server verification failed, using localStorage data:", serverError);
            // Continue with localStorage data if server fails
          }
        } catch (parseError) {
          console.error("[DEBUG] AppInitializer: Failed to parse user data:", parseError);
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          dispatch(logout());
        }
      } catch (error) {
        console.error("[DEBUG] AppInitializer: Initialization failed:", error);
        dispatch(logout());
      }
    };

    initializeAuth();
  }, [dispatch]);

  return null;
};

export default AppInitializer;
