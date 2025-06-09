import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number; // Unix timestamp
  role: string;
}

export const getCurrentUserRole = (): string | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    const token = user.token;

    if (!token) return null;

    const decoded: DecodedToken = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();

    if (isExpired) {
      logout(); // Auto logout
      return null;
    }

    return decoded.role || null;
  } catch (err) {
    logout();
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem("user");
  window.location.href = "/login"; // or use navigate() in React
};
