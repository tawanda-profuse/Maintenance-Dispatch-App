import axios from "axios";
import Cookies from "js-cookie";
import { useAuthStore } from "@/stores/auth-store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

// Add CSRF token to requests that need it when cookie is not already available
api.interceptors.request.use((config) => {
  if (
    ["post", "put", "patch", "delete"].includes(
      config.method?.toLowerCase() || "",
    )
  ) {
    let csrfToken = Cookies.get("csrftoken");
    if (!csrfToken) {
      csrfToken = useAuthStore.getState().csrfToken || "";
    }
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
    }
  }
  return config;
});

export default api;
