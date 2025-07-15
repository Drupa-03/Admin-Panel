// let refreshTimer = null;
// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// export const startRefreshTimer = () => {
//   if (refreshTimer) clearTimeout(refreshTimer);

//   const tokenExpiry = localStorage.getItem("token_expiry");
//   let timeUntilRefresh;

//   if (tokenExpiry) {
//     const expiryTime = new Date(tokenExpiry).getTime();
//     const currentTime = new Date().getTime();
//     const timeUntilExpiry = expiryTime - currentTime;
//     // Refresh 15 seconds before expiry (aggressive for 1min tokens)
//     timeUntilRefresh = Math.max(timeUntilExpiry - 15000, 5000); // Min 5 seconds
//   } else {
//     timeUntilRefresh = 45000; // Default 45s if no expiry set
//   }

//   refreshTimer = setTimeout(async () => {
//     try {
//       console.log("Auto-refreshing token...");
//       const newToken = await refreshAccessToken();
//       if (newToken) {
//         startRefreshTimer(); // Reset timer on success
//       }
//     } catch (error) {
//       console.error("Refresh failed, retrying in 5s:", error);
//       // Retry sooner if refresh fails
//       refreshTimer = setTimeout(() => startRefreshTimer(), 5000);
//     }
//   }, timeUntilRefresh);

//   console.log(`Next refresh in ${Math.round(timeUntilRefresh / 1000)}s`);
// };

// export const refreshAccessToken = async () => {
//   if (isRefreshing) {
//     return new Promise((resolve, reject) => {
//       failedQueue.push({ resolve, reject });
//     });
//   }

//   isRefreshing = true;
//   const refreshToken = localStorage.getItem("refresh_token");

//   if (!refreshToken) {
//     console.warn("No refresh token available");
//     isRefreshing = false;
//     processQueue(new Error("No refresh token"), null);
//     return null;
//   }

//   try {
//     const { default: axios } = await import("axios");
//     const API_URL = getApiUrl();

//     const response = await axios.post(
//       `${API_URL}/nodesetup/auth/refresh`,
//       { refresh_token: refreshToken },
//       { timeout: 5000 }
//     );

//     const { access_token, refresh_token: newRefreshToken } = response.data;

//     if (!access_token) {
//       throw new Error("No access token in response");
//     }

//     // Store tokens
//     localStorage.setItem("access_token", access_token);
//     localStorage.setItem("Auth", `Bearer ${access_token}`);
//     if (newRefreshToken) {
//       localStorage.setItem("refresh_token", newRefreshToken);
//     }

//     // Set expiry time (1 minute from now)
//     const expiryTime = new Date(Date.now() + 60 * 1000);
//     localStorage.setItem("token_expiry", expiryTime.toISOString());

//     isRefreshing = false;
//     processQueue(null, access_token);
//     console.log("Token refreshed successfully");
//     return access_token;
//   } catch (error) {
//     console.error("Token refresh failed:", error?.response?.data || error?.message);
//     isRefreshing = false;
//     processQueue(error, null);
    
//     // If refresh token is invalid, force logout
//     if (error.response?.status === 401) {
//       await logout();
//     }
//     return null;
//   }
// };

// export const logout = async (silent = false) => {
//   try {
//     const { default: axios } = await import("axios");
//     const API_URL = getApiUrl();
//     const token = localStorage.getItem("access_token");

//     if (token) {
//       await axios.post(
//         `${API_URL}/nodesetup/auth/logout`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//     }
//   } catch (error) {
//     console.error("Logout API error:", error);
//   }

//   // Clear all auth-related data
//   localStorage.removeItem("access_token");
//   localStorage.removeItem("refresh_token");
//   localStorage.removeItem("Auth");
//   localStorage.removeItem("token_expiry");

//   // Clear refresh timer
//   if (refreshTimer) {
//     clearTimeout(refreshTimer);
//     refreshTimer = null;
//   }

//   // Reset state
//   isRefreshing = false;
//   failedQueue = [];

//   if (!silent && typeof window !== "undefined") {
//     window.location.href = "/login";
//   }
// };

// export const setAuthTokens = (accessToken, refreshToken) => {
//   localStorage.setItem("access_token", accessToken);
//   localStorage.setItem("Auth", `Bearer ${accessToken}`);
//   localStorage.setItem("refresh_token", refreshToken);

//   // Set expiry time (1 minute from now)
//   const expiryTime = new Date(Date.now() + 60 * 1000);
//   localStorage.setItem("token_expiry", expiryTime.toISOString());

//   startRefreshTimer();
// };

// export const getApiUrl = () => {
//   return typeof window !== "undefined" && window.location.hostname === "localhost"
//     ? "http://192.168.0.102:3007"
//     : "https://node.esirt.co.in";
// };

// export const headersApplication = () => {
//   const token = localStorage.getItem("access_token");
//   return {
//     "Content-Type": "application/json",
//     Authorization: token ? `Bearer ${token}` : "",
//   };
// };

// export const headersMultipart = () => {
//   const token = localStorage.getItem("access_token");
//   return {
//     "Content-Type": "multipart/form-data",
//     Authorization: token ? `Bearer ${token}` : "",
//   };
// };

// export const getUserRole = () => {
//   try {
//     const token = localStorage.getItem("access_token");
//     if (!token) return { role_id: null, user_type: null, id: null, token: null };
    
//     // Note: In a real app, you should decode the JWT to get these values
//     // This is just a placeholder implementation
//     return {
//       token,
//       role_id: localStorage.getItem("role_id"),
//       user_type: localStorage.getItem("user_type"),
//       id: localStorage.getItem("user_id"),
//     };
//   } catch {
//     return { role_id: null, user_type: null, id: null, token: null };
//   }
// };

// export const getAccessToken = () => {
//   return localStorage.getItem("access_token");
// };

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
      ? "http://192.168.0.116:3007"
      : "https://node.esirt.co.in";
    const response = await axios.post(`${API_URL}/nodesetup/auth/refresh`, {
      refresh_token: refreshToken,
    }, {
      timeout: 1000000,
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
    // :large_yellow_circle: Call the backend logout API to clear session/token from DB
    const { default: axios } = await import("axios");
    const API_URL = typeof window !== "undefined" && window.location.hostname === "localhost"
      ? "http://192.168.0.104:3007"
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
  // :white_check_mark: Clear all tokens and state
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
  // :white_check_mark: Redirect to login
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
    return { role_id: null, user_type: null, id: null, token: null }; // :white_check_mark: include id
  }
};
export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

