// utils/logout.js
import api from "@/utills/api";

export const performLogout = async (router) => {
  try {
    const access_token = localStorage.getItem("access_token");
    if (access_token) {
      await api.post(
        "/nodesetup/auth/logout",
        null,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      );
    }
  } catch (error) {
    console.error("Logout API failed:", error);
  }

  localStorage.clear();
  router.push("/login");
};
