import { useEffect, useRef } from "react";
import {jwtDecode} from "jwt-decode";
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
        const decoded: DecodedToken = jwtDecode(token);

        const isExpired = decoded.exp * 1000 < Date.now();
        if (isExpired) logout();
      } catch {
        logout();
      }
    };

    // Start interval (every 15s, debounced)
    intervalRef.current = setInterval(checkSession, 15000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
};

export default useSessionWatcher;
