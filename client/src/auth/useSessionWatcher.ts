import { useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { logout } from "@/utils/authUtils";

interface DecodedToken {
  exp: number;
}

const useSessionWatcher = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkSession = () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) return;

      try {
        const { token } = JSON.parse(userStr);
        // console.log("Token:", token);

        if (!token) {
          // console.warn("No token found in user object");
          return;
        }

        const decoded: DecodedToken = jwtDecode(token);
        // console.log("Decoded token:", decoded);

        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) logout();
      } catch (err: any) {
        console.error("🔴 JWT Decode Error:", err?.message || err);
      }
    };

    // Start interval (every 15s)
    intervalRef.current = setInterval(checkSession, 1500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
};

export default useSessionWatcher;
