import { LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/utills/api";

export default function SocialAuthForm() {
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const { platform, success, error } = router.query;

    if (success === "true" && platform) {
      setAuthStatus({ 
        success: true, 
        message: `${platform} authentication successful! Redirecting...` 
      });
      
      // Redirect after showing message
      setTimeout(() => {
        window.location.href = "/dashboard"; // Full page reload to ensure clean state
      }, 1500);
      
    } else if (error) {
      setAuthStatus({ 
        success: false, 
        message: `Authentication failed: ${error}` 
      });
    }
  }, [router.query]);

const handleAuthClick = async (provider) => {
  setLoading(true);
  try {
    const token = localStorage.getItem("access_token") || localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await api.get(`/nodesetup/social/auth/${provider}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const redirectUrl = response.data?.data?.authUrl;

    if (redirectUrl) {
      // Open auth URL in new tab
      const newWindow = window.open(redirectUrl, '_blank');
      
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // Fallback if popup is blocked
        window.location.href = redirectUrl;
      }
    } else {
      setAuthStatus({ success: false, message: "Redirect URL not found." });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    setAuthStatus({ 
      success: false, 
      message: error.message || "Authentication failed. Please try again." 
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <form className="max-w-6xl mx-auto bg-white dark:bg-gray-800 border border-[#004b8f]/30 rounded-2xl shadow-lg p-8 mt-10">
      <h2 className="text-2xl font-bold text-[#004b8f] dark:text-white mb-6 pt-2">
        Authentication
      </h2>

      {authStatus && (
        <div className={`mb-4 p-4 rounded-lg ${
          authStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {authStatus.message}
        </div>
      )}

      <div className="flex justify-center gap-5">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleAuthClick("linkedin")}
          className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-lg hover:bg-[#003b73] disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          LinkedIn Authentication
          <LogIn size={16} />
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleAuthClick("facebook")}
          className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-lg hover:bg-[#003b73] disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Facebook/Instagram Authentication
          <LogIn size={16} />
        </button>
      </div>
    </form>
  );
}


// import { LogIn } from "lucide-react";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/router";
// import api from "@/utills/api";

// export default function SocialAuthForm() {
//   const [loading, setLoading] = useState(false);
//   const [token, setToken] = useState("");
//   const [authStatus, setAuthStatus] = useState(null);
//   const router = useRouter();

//   useEffect(() => {
//     // Get token from localStorage
//     const storedToken = localStorage.getItem("access_token");
    
//     if (storedToken) {
//       setToken(storedToken);
//     }

//     // Handle callback query parameters
//     const { platform, success, error } = router.query;

//     if (success === "true" && platform) {
//       setAuthStatus({ success: true, message: `${platform} authentication successful!` });
//       router.push("/dashboard");
//     } else if (error) {
//       setAuthStatus({ success: false, message: `Authentication failed: ${error}` });
//     }
//   }, [router.query]);

//   const handleAuthClick = async (provider) => {
//     setLoading(true);
//     try {
//       const currentToken = localStorage.getItem("access_token");
      
//       if (!currentToken) {
//         throw new Error("No authentication token found. Please log in first.");
//       }

//       const response = await api.get(`/nodesetup/social/auth/${provider}`, {
//         headers: {
//           Authorization: `Bearer ${currentToken}`,
//         },
//       });

//       const redirectUrl = response.data?.data?.authUrl;

//       if (redirectUrl) {
//         // Store token in multiple places for persistence
//         localStorage.setItem("access_token", currentToken);
//         sessionStorage.setItem("access_token", currentToken);
        
//         // Also store a backup with timestamp
//         localStorage.setItem("auth_backup", JSON.stringify({
//           token: currentToken,
//           timestamp: Date.now(),
//           provider: provider
//         }));

//         // Use window.open with popup or direct navigation
//         // Option 1: Direct navigation (current approach)
//         window.location.href = redirectUrl;
        
//         // Option 2: Alternative - Open in popup (uncomment if preferred)
//         // const popup = window.open(
//         //   redirectUrl,
//         //   `${provider}_auth`,
//         //   'width=600,height=700,scrollbars=yes,resizable=yes'
//         // );
//         // 
//         // // Listen for popup close or message
//         // const checkClosed = setInterval(() => {
//         //   if (popup.closed) {
//         //     clearInterval(checkClosed);
//         //     // Refresh the current page or handle callback
//         //     window.location.reload();
//         //   }
//         // }, 1000);
        
//       } else {
//         setAuthStatus({ success: false, message: "Redirect URL not found." });
//       }
//     } catch (error) {
//       console.error("Authentication error:", error);
//       setAuthStatus({ 
//         success: false, 
//         message: error.message || "Authentication failed. Please try again." 
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Function to restore token if missing
//   const restoreTokenIfNeeded = () => {
//     const currentToken = localStorage.getItem("access_token");
    
//     if (!currentToken) {
//       // Try to restore from sessionStorage
//       const sessionToken = sessionStorage.getItem("access_token");
//       if (sessionToken) {
//         localStorage.setItem("access_token", sessionToken);
//         setToken(sessionToken);
//         return sessionToken;
//       }
      
//       // Try to restore from backup
//       const backupData = localStorage.getItem("auth_backup");
//       if (backupData) {
//         try {
//           const parsed = JSON.parse(backupData);
//           // Check if backup is less than 24 hours old
//           if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
//             localStorage.setItem("access_token", parsed.token);
//             setToken(parsed.token);
//             return parsed.token;
//           }
//         } catch (e) {
//           console.error("Error parsing backup token:", e);
//         }
//       }
//     }
    
//     return currentToken;
//   };

//   // Check and restore token on component focus/visibility
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (document.visibilityState === 'visible') {
//         restoreTokenIfNeeded();
//       }
//     };

//     const handleFocus = () => {
//       restoreTokenIfNeeded();
//     };

//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     window.addEventListener('focus', handleFocus);

//     return () => {
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//       window.removeEventListener('focus', handleFocus);
//     };
//   }, []);

//   return (
//     <form className="max-w-6xl mx-auto bg-white dark:bg-gray-800 border border-[#004b8f]/30 rounded-2xl shadow-lg p-8 mt-10">
//       <h2 className="text-2xl font-bold text-[#004b8f] dark:text-white mb-6 pt-2">
//         Authentication
//       </h2>

//       {/* Debug info - remove in production */}
//       {process.env.NODE_ENV === 'development' && (
//         <div className="mb-4 p-2 bg-gray-100 rounded text-sm">
//           Token present: {token ? 'Yes' : 'No'}
//         </div>
//       )}

//       {authStatus && (
//         <div
//           className={`mb-4 p-4 rounded-lg ${
//             authStatus.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
//           }`}
//         >
//           {authStatus.message}
//         </div>
//       )}

//       <div className="flex justify-center gap-5">
//         <button
//           type="button"
//           disabled={loading}
//           onClick={() => handleAuthClick("linkedin")}
//           className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-lg hover:bg-[#003b73] disabled:opacity-50 disabled:cursor-not-allowed transition"
//         >
//           LinkedIn Authentication
//           <LogIn size={16} />
//         </button>

//         <button
//           type="button"
//           disabled={loading}
//           onClick={() => handleAuthClick("facebook")}
//           className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-lg hover:bg-[#003b73] disabled:opacity-50 disabled:cursor-not-allowed transition"
//         >
//           Facebook/Instagram Authentication
//           <LogIn size={16} />
//         </button>
//       </div>

//       {/* Manual token restore button - for debugging */}
//       {process.env.NODE_ENV === 'development' && (
//         <div className="mt-4 text-center">
//           <button
//             type="button"
//             onClick={restoreTokenIfNeeded}
//             className="text-sm text-gray-600 hover:text-gray-800 underline"
//           >
//             Restore Token (Debug)
//           </button>
//         </div>
//       )}
//     </form>
//   );
// }