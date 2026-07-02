import axios from "axios";
import { emitSessionExpired } from "./sessionEvents";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) {
    req.headers["x-auth-token"] = token;
  }

  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!window.location.pathname.includes("/login")) {
        emitSessionExpired("Your session has expired. Please sign in again.");
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default API;