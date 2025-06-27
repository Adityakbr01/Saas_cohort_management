import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number; // Unix timestamp
  role?: string; // Role is optional to handle missing role
}

export const getCurrentUserRole = (): string | null => {

  const userStr = localStorage.getItem("user");
  if (!userStr) {
    
    return null;
  }

  const token = localStorage.getItem("accessToken");
  if (!token) {
   
    return null;
  }

  try {
    const decoded: DecodedToken = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
      console.log("[DEBUG] getCurrentUserRole: Access token expired");
      return null; // Rely on useSessionWatcher for logout
    }

    if (!decoded.role) {
      console.warn("[DEBUG] getCurrentUserRole: No role found in token");
      return null;
    }

    return decoded.role;
  } catch (err) {
    console.error("[DEBUG] getCurrentUserRole: Error decoding token:", err);
    return null;
  }
};

export const logout = (clearRememberedCredentials: boolean = false) => {
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  if (clearRememberedCredentials) {
    localStorage.removeItem("rememberedCredentials");
  }

  window.location.href = "/login"; // or use navigate() in React
};