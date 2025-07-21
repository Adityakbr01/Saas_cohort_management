import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  role?: string;
}

export const getCurrentUserRole = (): string | null => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const decoded: DecodedToken = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      console.warn("[DEBUG] Token expired in getCurrentUserRole");
      return null;
    }
    return decoded.role || null;
  } catch (err) {
    console.error("[DEBUG] Error decoding token:", err);
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("accessToken");
  window.location.href = "/login";
};
