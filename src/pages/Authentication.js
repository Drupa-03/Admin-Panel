import { LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import api from "@/utills/api";

export default function SocialAuthForm() {
  const [loadingPlatform, setLoadingPlatform] = useState(null); // ✅ track which button is loading
  const [authStatus, setAuthStatus] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const { platform, success, error } = router.query;

    if (success === "true" && platform) {
      setAuthStatus({ 
        success: true, 
        message: `${platform} authentication successful! Redirecting...` 
      });
      
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } else if (error) {
      setAuthStatus({ 
        success: false, 
        message: `Authentication failed: ${error}` 
      });
    }
  }, [router.query]);

  const handleAuthClick = async (provider) => {
    setLoadingPlatform(provider); // ✅ Set loading for specific provider
    try {
      const token = localStorage.getItem("access_token") || localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await api.get(`/nodesetup/social/auth/${provider}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const redirectUrl = response.data?.data?.authUrl;

      if (redirectUrl) {
        const newWindow = window.open(redirectUrl, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
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
      setLoadingPlatform(null); // ✅ Reset loading state
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
          disabled={loadingPlatform === "linkedin"}
          onClick={() => handleAuthClick("linkedin")}
          className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-lg hover:bg-[#003b73] cursor-pointer transition"
        >
          LinkedIn Authentication
          <LogIn size={16} />
        </button>

        <button
          type="button"
          disabled={loadingPlatform === "facebook"}
          onClick={() => handleAuthClick("facebook")}
          className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-lg hover:bg-[#003b73] cursor-pointer transition"
        >
          Facebook/Instagram Authentication
          <LogIn size={16} />
        </button>
      </div>
    </form>
  );
}
