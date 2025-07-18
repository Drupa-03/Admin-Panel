//Working code 27/06
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { LogIn } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/utills/api";
export default function SocialAuthForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { query } = router;
  useEffect(() => {
    const platform = query.platform;
    const success = query.success;
    const error = query.error;
    if (success === "true" && platform) {
      toast.success(
        `${
          platform.charAt(0).toUpperCase() + platform.slice(1)
        } authentication successful!`
      );
      router.replace("/dashboard.html");
    } else if (error) {
      toast.error(`Authentication failed: ${error}`);
      console.error("Auth error:", { platform, error });
    } else if (Object.keys(query).length > 0) {
      console.warn("Unexpected query params:", query);
    }
  }, [query, router]);
  const handleAuthClick = async (provider) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/nodesetup/social/auth/${provider}`);
      if (data.data?.authUrl) {
        window.location.href = data.data.authUrl;
      } else {
        toast.error("Redirect URL not found.");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Authentication failed. Please try again.";
      toast.error(errorMsg);
      console.error("API error:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className='max-w-6xl mx-auto bg-white dark:bg-gray-800 border border-[#004B8F]/30 rounded-2xl shadow-lg p-8 mt-10'>
      <h2 className='text-2xl font-bold text-[#004B8F] dark:text-white mb-6 pt-2'>
        Platform Authentication
      </h2>
      <div className='flex justify-center gap-5'>
        <button
          type='button'
          disabled={loading}
          onClick={() => handleAuthClick("linkedin")}
          className='flex items-center gap-2 px-6 py-3 bg-[#004B8F] text-white rounded-lg hover:bg-[#003B73] disabled:opacity-50 disabled:cursor-not-allowed transition'>
          Authenticate LinkedIn
          <LogIn size={16} />
        </button>
        <button
          type='button'
          disabled={loading}
          onClick={() => handleAuthClick("facebook")}
          className='flex items-center gap-2 px-6 py-3 bg-[#004B8F] text-white rounded-lg hover:bg-[#003B73] disabled:opacity-50 disabled:cursor-not-allowed transition'>
          Authenticate Facebook/Instagram
          <LogIn size={16} />
        </button>
      </div>
    </div>
  );
}
