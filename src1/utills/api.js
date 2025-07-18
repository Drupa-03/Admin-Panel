
import axios from "axios";

export const API_URL = "http://192.168.0.108:3007"; // Adjust for live environment

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
});

export const isAccessTokenExpired = (accessToken) => {
  if (!accessToken) {
    console.warn("No access token provided to isAccessTokenExpired");
    return true;
  }
  try {
    const decodedToken = JSON.parse(atob(accessToken.split('.')[1]));
    if (!decodedToken?.exp) {
      console.warn("Token has no expiry claim:", decodedToken);
      return true;
    }
    const isExpired = Date.now() >= decodedToken.exp * 1000;
    console.log("Token expiry check:", {
      isExpired,
      exp: decodedToken.exp,
      now: Date.now() / 1000,
    });
    return isExpired;
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

export const refreshToken = async () => {
  try {
    const refresh_token = localStorage.getItem("refresh_token");
    if (!refresh_token) {
      console.error("No refresh token available");
      throw new Error("No refresh token available");
    }

    console.log("Attempting token refresh with:", refresh_token.slice(0, 10) + "...");
    const response = await axios.post(`${API_URL}/nodesetup/auth/refresh`, { refresh_token });
    console.log("Refresh response:", response.data);

    const { token, refresh_token: newRefreshToken } = response.data.data;

    if (!token || !newRefreshToken) {
      throw new Error("Invalid refresh response");
    }

    localStorage.setItem("access_token", token);
    localStorage.setItem("refresh_token", newRefreshToken);
    console.log("Token refreshed successfully:", token.slice(0, 10) + "...");
    return token;
  } catch (error) {
    console.error("Error refreshing token:", error.response?.data || error.message);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("Auth");
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw error;
  }
};

api.interceptors.request.use(
  async (config) => {
    let accessToken = localStorage.getItem("access_token");
    if (accessToken && isAccessTokenExpired(accessToken)) {
      console.log("Access token expired, attempting refresh");
      accessToken = await refreshToken();
    }
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("401 error detected, attempting token refresh");
      try {
        const newAccessToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed in response interceptor:", refreshError);
        return Promise.reject(refreshError);
      }
    }
    console.error("Response error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;