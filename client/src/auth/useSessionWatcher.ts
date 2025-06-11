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
        if (!token) {
          console.warn("No token found in user object");
          return; // Don't logout
        }

        const decoded: DecodedToken = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) {
          logout(); // Logout only on expiry
        }
      } catch (err) {
        console.error("Error checking session:", err);
        // Don't logout on parsing errors
      }
    };

    // Start interval (every 15s)
    intervalRef.current = setInterval(checkSession, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
};

export default useSessionWatcher;