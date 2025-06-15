// src/components/AppInitializer/index.tsx

import { authApi } from "@/store/features/auth/authApi";
import { setUser } from "@/store/features/slice/UserAuthSlice";
import { useAppDispatch } from "@/store/hook";
import { useEffect } from "react";

const AppInitializer = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await dispatch(
          authApi.endpoints.getProfile.initiate(undefined)
        ).unwrap();

        console.log(user?.data)

        dispatch(setUser(user?.data));
      } catch (err) {
        console.error("User fetch failed:", err);
      }
    };
    loadUser();
  }, [dispatch]);

  return null;
};

export default AppInitializer;
