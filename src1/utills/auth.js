
import axios from "axios";
import { API_URL } from "./api";

export const logout = async () => {
  try {
    const refresh_token = localStorage.getItem("refresh_token");
    if (refresh_token) {
      await axios.post(`${API_URL}/nodesetup/auth/logout`, { refresh_token });
    }
  } catch (error) {
    console.error("Logout API failed:", error);
  }
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("Auth");
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

export const setAuthTokens = (accessToken, refreshToken, userData = {}) => {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
  localStorage.setItem(
    "Auth",
    JSON.stringify({
      token: accessToken,
      id: userData.id || null,
      user_type: userData.user_type || "staff",
      role_id: userData.role_id || null,
    })
  );
};

export const headersApplication = () => {
  try {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  } catch (error) {
    console.error("Error setting headers:", error);
    return {
      "Content-Type": "application/json",
    };
  }
};

export const headersMultipart = () => {
  try {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "multipart/form-data",
      Authorization: token ? `Bearer ${token}` : "",
    };
  } catch (error) {
    console.error("Error setting headers:", error);
    return {
      "Content-Type": "multipart/form-data",
    };
  }
};

export const getUserRole = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("Auth"));
    return {
      token: auth?.token,
      role_id: auth?.role_id,
      user_type: auth?.user_type,
      id: auth?.id,
    };
  } catch {
    return { role_id: null, user_type: null, id: null, token: null };
  }
};

export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};
