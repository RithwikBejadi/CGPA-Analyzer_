import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://cgpa-analyzer-mq5f.onrender.com";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 90000, // 90 seconds to account for server cold starts
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors (except for auth check endpoints)
    if (error.response?.status === 401) {
      const skipAuthRedirect = error.config?.skipAuthRedirect;

      if (!skipAuthRedirect) {
        localStorage.removeItem("isAuthenticated");
        // Clear all cookies by setting them to expire
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(
              /=.*/,
              "=;expires=" + new Date().toUTCString() + ";path=/",
            );
        });
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
