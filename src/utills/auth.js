

export const logout = async () => {
  try {
    const { default: axios } = await import("axios");
    const API_URL =
      typeof window !== "undefined" && window.location.hostname === "localhost"
        ? "http://192.168.0.108:3007"
        : "https://node.esirt.co.in";

    const token = localStorage.getItem("access_token");

    if (token) {
      await axios.post(`${API_URL}/nodesetup/auth/logout`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error("Logout API failed:", error);
  }

  localStorage.removeItem("access_token");
  localStorage.removeItem("Auth");



  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

export const setAuthTokens = (accessToken) => {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("Auth", `Bearer ${accessToken}`);
};

export const headersApplication = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const headersMultipart = () => {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "multipart/form-data",
    Authorization: token ? `Bearer ${token}` : "",
  };
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
