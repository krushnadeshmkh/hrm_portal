import { jwtDecode } from "jwt-decode";

export const validateToken = () => {
  const token = localStorage.getItem("token");

  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp && decoded.exp < currentTime) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

export const clearUserSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("name");
  localStorage.removeItem("user_id");
  localStorage.removeItem("company_id");
  localStorage.removeItem("role");
  localStorage.removeItem("true_role");
  localStorage.removeItem("position");
  localStorage.removeItem("employee_id");
  localStorage.removeItem("userId");
  localStorage.removeItem("employeeId");
};

export const getUserRole = () => {
  return localStorage.getItem("role");
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};