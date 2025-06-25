// utils/auth.js
let refreshTimer = null;
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const startRefreshTimer = () => {
  // Clear existing timer (in case of re-login)
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  // Get token expiry time from localStorage or set default
  const tokenExpiry = localStorage.getItem("token_expiry");
  let timeUntilRefresh;

  if (tokenExpiry) {
    const expiryTime = new Date(tokenExpiry).getTime();
    const currentTime = new Date().getTime();
    const timeUntilExpiry = expiryTime - currentTime;
    // Refresh 5 minutes before expiry
    timeUntilRefresh = Math.max(timeUntilExpiry - (5 * 60 * 1000), 60000); // At least 1 minute
  } else {
    // Default: refresh after 55 minutes if no expiry time is set
    timeUntilRefresh = 60 * 60 * 1000;
  }

  refreshTimer = setTimeout(async () => {
    console.log("Auto-refreshing token...");
    const newToken = await refreshAccessToken();
    if (newToken) {
      startRefreshTimer(); // Recursively set new timer
    } else {
      logout(); // Token refresh failed
    }
  }, timeUntilRefresh);

  console.log(`Token refresh scheduled in ${Math.round(timeUntilRefresh / 60000)} minutes`);
};

export const refreshAccessToken = async () => {
  // Prevent multiple simultaneous refresh attempts
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    console.error("No refresh token available");
    isRefreshing = false;
    processQueue(new Error("No refresh token"), null);
    logout();
    return null;
  }

  try {
    // Create a new axios instance to avoid interceptor loops
    const { default: axios } = await import("axios");
    const API_URL = typeof window !== "undefined" && window.location.hostname === "localhost" 
      ? "http://192.168.0.105:3007" 
      : "https://node.esirt.co.in";

    const response = await axios.post(`${API_URL}/nodesetup/auth/refresh`, {
      refresh_token: refreshToken,
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const { access_token, refresh_token: newRefreshToken } = response.data;

    if (access_token) {
      // Store new tokens
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("Auth", `Bearer ${access_token}`);
      
      // Update refresh token if provided
      if (newRefreshToken) {
        localStorage.setItem("refresh_token", newRefreshToken);
      }

      // Set token expiry time (assuming 1 hour expiry)
      const expiryTime = new Date(Date.now() + (60 * 60 * 1000)); // 1 hour from now
      localStorage.setItem("token_expiry", expiryTime.toISOString());

      isRefreshing = false;
      processQueue(null, access_token);
      
      console.log("Token refreshed successfully");
      return access_token;
    } else {
      throw new Error("No access token in response");
    }
  } catch (error) {
    console.error("Token refresh failed:", error);
    isRefreshing = false;
    processQueue(error, null);
    
    // If refresh fails, logout the user
    logout();
    return null;
  }
};
export const logout = async () => {
  try {
    // 🟡 Call the backend logout API to clear session/token from DB
    const { default: axios } = await import("axios");

    const API_URL = typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://192.168.0.105:3007"
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
    // Continue with frontend cleanup even if logout API fails
  }
  // ✅ Clear all tokens and state
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("Auth");
  localStorage.removeItem("token_expiry");

  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  isRefreshing = false;
  failedQueue = [];
  // ✅ Redirect to login
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

export const setAuthTokens = (accessToken, refreshToken) => {
  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("Auth", `Bearer ${accessToken}`);
  localStorage.setItem("refresh_token", refreshToken);
  
  // Set token expiry time (assuming 1 hour expiry)
  const expiryTime = new Date(Date.now() + (60 * 60 * 1000));
  localStorage.setItem("token_expiry", expiryTime.toISOString());
  
  // Start the refresh timer
  startRefreshTimer();
};

// Updated header functions
export const headersApplication = () => {
  try {
    const token = localStorage.getItem("access_token");
    return {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    };
  } catch (error) {
    console.log(error);
    return {
      'Content-Type': 'application/json'
    };
  }
};

export const headersMultipart = () => {
  try {
    const token = localStorage.getItem("access_token");
    return {
      'Content-Type': 'multipart/form-data',
      Authorization: token ? `Bearer ${token}` : ''
    };
  } catch (error) {
    console.log(error);
    return {
      'Content-Type': 'multipart/form-data'
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
      id: auth?.id
    };
  } catch {
    return { role_id: null, user_type: null, id: null, token: null }; // ✅ include id
  }
};


export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};