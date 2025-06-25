import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number; // Unix timestamp
  role?: string; // Role is optional to handle missing role
}

export const getCurrentUserRole = (): string | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    const token = user?.token;

    if (!token) {
      console.warn("No token found in user object");
      return null; // Don't logout, just return null
    }

    const decoded: DecodedToken = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
      logout(); // Logout only on expiry
      return null;
    }

    if (!decoded.role) {
      console.warn("No role found in token");
      return null; // Don't logout, just return null
    }

    return decoded.role;
  } catch (err) {
    console.error("Error decoding token:", err);
    return null; // Don't logout on parsing errors
  }
};

export const logout = (clearRememberedCredentials: boolean = false) => {
  localStorage.removeItem("user");

  // Optionally clear remembered credentials on explicit logout
  if (clearRememberedCredentials) {
    localStorage.removeItem("rememberedCredentials");
  }

  window.location.href = "/login"; // or use navigate() in React
};