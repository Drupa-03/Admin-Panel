// utils/logout.js
import api from "@/utills/api";

export const performLogout = async (router) => {
  const refresh_token = localStorage.getItem("refresh_token");

  try {
    if (refresh_token) {
      await api.post("/nodesetup/auth/logout", { refresh_token });
    }
  } catch (error) {
    console.error("Logout API failed:", error);
  }

  localStorage.clear();
  router.push("/login");
};
