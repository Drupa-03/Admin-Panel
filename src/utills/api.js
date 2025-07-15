//utils/api.js
import axios from "axios";
import { refreshAccessToken, logout } from "./auth";

const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
export const API_URL = isLocalhost ? "http://192.168.0.108:3007" : "https://node.esirt.co.in";

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

// ✅ Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if it's a 401 error and we haven't already tried to refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh") &&
      !originalRequest.url.includes("/login")
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
          // Update the authorization header for the original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          // Retry the original request
          return api(originalRequest);
        } else {
          // Refresh failed, logout user
          logout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// import axios from "axios";
// import { refreshAccessToken, getApiUrl, logout } from "./auth";

// const api = axios.create({
//   baseURL: getApiUrl(),
//   timeout: 10000,
// });

// // Request interceptor
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("access_token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     // Skip refresh logic for auth endpoints or if already retried
//     if (
//       error.response?.status === 401 &&
//       !originalRequest._retry &&
//       !originalRequest.url.includes("/auth/")
//     ) {
//       originalRequest._retry = true;

//       try {
//         const newToken = await refreshAccessToken();
//         if (newToken) {
//           originalRequest.headers.Authorization = `Bearer ${newToken}`;
//           return api(originalRequest);
//         }
//       } catch (refreshError) {
//         console.error("Refresh token failed:", refreshError);
//         await logout();
//         return Promise.reject(refreshError);
//       }
//     }

//     // If not 401 or refresh failed, reject normally
//     return Promise.reject(error);
//   }
// );

// export default api;