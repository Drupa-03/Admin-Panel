// -------------------------------------------------working code for credential-----------------------------------------------------------------------------

import React, { useState } from "react";
import { Filter, Info, Send, Save, LogIn } from "lucide-react";
import api from "@/utills/api"; // Adjust this path if needed
import SocialAuthForm from "./Authentication";
import Post from "./Post";
export default function SocialPostForm() {
  const [platform, setPlatform] = useState("select");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Updated platform values to match backend expectations
  const platforms = [
    { label: "Select Platform", value: "select" },
    { label: "Instagram", value: "instagram" }, // lowercase
    { label: "LinkedIn", value: "linkedin" }, // lowercase
    { label: "Facebook", value: "facebook" }, // lowercase
  ];

  // URL validation function
  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // Client-side validation
    if (platform === "select") {
      setMessage("Please select a valid platform.");
      setLoading(false);
      return;
    }

    if (!isValidUrl(redirectUri)) {
      setMessage(
        "Please enter a valid redirect URI (must start with http:// or https://)"
      );
      setLoading(false);
      return;
    }

    if (!clientId.trim()) {
      setMessage("Client ID is required.");
      setLoading(false);
      return;
    }

    if (!clientSecret.trim()) {
      setMessage("Client Secret is required.");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post(
        "/nodesetup/social/credentials",
        {
          platform,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_Token")}`,
          },
        }
      );

      setMessage("Credentials submitted successfully!");
      setClientId("");
      setClientSecret("");
      setRedirectUri("");
      setPlatform("select");
    } catch (error) {
      // Better error handling
      if (error?.response?.data?.result?.errors) {
        const errors = error.response.data.result.errors;
        const errorMessages = errors
          .map((err) => `${err.path}: ${err.msg}`)
          .join(", ");
        setMessage(`Validation errors: ${errorMessages}`);
      } else {
        setMessage(error?.response?.data?.message || "Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:ml-64 pt-24'>
      <h2 className='text-3xl font-bold text-[#004b8f] dark:text-white mb-6 pl-5 pt-2'>
        Add post
      </h2>
      <form
        onSubmit={handleSubmit}
        className='max-w-6xl mx-auto bg-white dark:bg-gray-800 border border-[#004b8f]/30 rounded-2xl shadow-lg p-8'>
        <h2 className='text-2xl font-bold text-[#004b8f] dark:text-white mb-6 pt-2'>
          Credentials
        </h2>
        {/* Platform Dropdown */}
        <div className='mb-6'>
          <label className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
            Select Platform
          </label>
          <div className='flex items-center gap-2'>
            <Filter size={18} className='text-gray-500' />
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]'>
              {platforms.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Client ID */}
        <div className='mb-6'>
          <label className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
            Client ID
          </label>
          <input
            type='text'
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder='Enter Client ID'
            className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]'
            required
          />
        </div>

        {/* Client Secret */}
        <div className='mb-6'>
          <label className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
            Client Secret
          </label>
          <input
            type='password'
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder='Enter Client Secret'
            className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]'
            required
          />
        </div>

        {/* Redirect URL */}
        <div className='mb-6'>
          <label className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
            Redirect URL
          </label>
          <input
            type='url'
            value={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
            placeholder='https://yourapp.com/callback'
            className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]'
            required
          />
        </div>

        {/* Submit Button */}
        <div className='flex justify-center'>
          <button
            type='submit'
            disabled={loading}
            className='flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-lg hover:bg-[#003b73] disabled:opacity-50 disabled:cursor-not-allowed transition'>
            {loading ? "Submitting..." : "Save"}
            <Save size={16} />
          </button>
        </div>

        {/* Notes Section */}
        <div className='mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300 rounded-xl p-4 flex items-start gap-3'>
          <Info className='mt-1' size={20} />
          <div className='text-sm leading-relaxed'>
            <p className='mb-2'>
              Please select the desired platform from the dropdown above and
              enter the corresponding credentials provided by the platform.
            </p>
            <p className='mb-2'>
              <strong>Important:</strong> Make sure your redirect URL is exactly
              as configured in your app settings on the respective platform.
            </p>
            <p>Common redirect URL formats:</p>
            <ul className='list-disc list-inside mt-1 space-y-1'>
              <li>https://yourapp.com/auth/callback</li>
              <li>https://localhost:3000/callback (for development)</li>
              <li>https://yourdomain.com/api/auth/callback</li>
            </ul>
          </div>
        </div>

        {/* Response Message */}
        {message && (
          <div
            className={`mt-6 p-3 rounded-lg text-sm ${
              message.includes("success")
                ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-700"
                : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700"
            }`}>
            {message}
          </div>
        )}
      </form>
      <SocialAuthForm />
      <div>
        <Post />
      </div>
    </div>
  );
}
