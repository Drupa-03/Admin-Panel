import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Filter, Info, Send, Save, LogIn } from "lucide-react";
import api from "@/utills/api"; // Adjust this path if needed
import SocialAuthForm from "./Authentication";
import Post from "./Post";

export default function SocialPostForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Updated platform values to match backend expectations
  const platforms = [
    { label: "Select Platform", value: "select" },
    { label: "Instagram", value: "instagram" }, // lowercase
    { label: "LinkedIn", value: "linkedin" }, // lowercase
    { label: "Facebook", value: "facebook" }, // lowercase
  ];

  // Validation schema
  const validationSchema = Yup.object({
    platform: Yup.string()
      .required("Platform is required")
      .notOneOf(["select"], "Please select a valid platform"),
    clientId: Yup.string()
      .required("Client ID is required")
      .trim()
      .min(1, "Client ID cannot be empty"),
    clientSecret: Yup.string()
      .required("Client Secret is required")
      .trim()
      .min(1, "Client Secret cannot be empty"),
    redirectUri: Yup.string()
      .required("Redirect URI is required")
      .url("Please enter a valid URL (must start with http:// or https://)")
      .matches(
        /^https?:\/\/.+/,
        "Redirect URI must start with http:// or https://"
      ),
  });

  // Formik setup
  const formik = useFormik({
    initialValues: {
      platform: "select",
      clientId: "",
      clientSecret: "",
      redirectUri: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setMessage("");
      setLoading(true);

      try {
        const response = await api.post(
          "/nodesetup/social/credentials",
          {
            platform: values.platform,
            client_id: values.clientId,
            client_secret: values.clientSecret,
            redirect_uri: values.redirectUri,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_Token")}`,
            },
          }
        );

        setMessage("Credentials submitted successfully!");
        resetForm();
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
    },
  });

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:ml-64 pt-24'>
      <h2 className='text-3xl font-bold text-[#004b8f] dark:text-white mb-6 pl-5 pt-2'>
        Add post
      </h2>
      <form
        onSubmit={formik.handleSubmit}
        className='max-w-6xl mx-auto bg-white dark:bg-gray-800 border border-[#004b8f]/30 rounded-2xl shadow-lg p-8'>
        <h2 className='text-2xl font-bold text-[#004b8f] dark:text-white mb-6 pt-2'>
          Credentials
        </h2>
        
        {/* Platform Dropdown */}
        <div className='mb-6'>
          <label className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
            Select Platform<span className='text-red-500'>*</span>
          </label>
          <div className='flex items-center gap-2'>
            <Filter size={18} className='text-gray-500' />
            <select
              name="platform"
              value={formik.values.platform}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]">
              {platforms.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          {formik.touched.platform && formik.errors.platform && (
            <p className="text-sm text-red-500 mt-1">
              {formik.errors.platform}
            </p>
          )}
        </div>

        {/* Client ID */}
        <div className='mb-6'>
          <label className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
            Client ID<span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            name="clientId"
            value={formik.values.clientId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder='Enter Client ID'
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
          />
          {formik.touched.clientId && formik.errors.clientId && (
            <p className="text-sm text-red-500 mt-1">
              {formik.errors.clientId}
            </p>
          )}
        </div>

        {/* Client Secret */}
        <div className='mb-6'>
          <label className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
            Client Secret<span className='text-red-500'>*</span>
          </label>
          <input
            type='password'
            name="clientSecret"
            value={formik.values.clientSecret}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder='Enter Client Secret'
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
              
          />
          {formik.touched.clientSecret && formik.errors.clientSecret && (
            <p className="text-sm text-red-500 mt-1">
              {formik.errors.clientSecret}
            </p>
          )}
        </div>

        {/* Redirect URL */}
        <div className='mb-6'>
          <label className='block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
            Redirect URL<span className='text-red-500'>*</span>
          </label>
          <input
            type='url'
            name="redirectUri"
            value={formik.values.redirectUri}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder='https://yourapp.com/callback'
            className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
          />
          {formik.touched.redirectUri && formik.errors.redirectUri && (
            <p className="text-sm text-red-500 mt-1">
              {formik.errors.redirectUri}
            </p>
          )}
        </div>

                           <div className='space-y-4 pt-4'>
             <p className='text-sm text-gray-500 dark:text-gray-400 '>
               ➡️ All fields marked with
               <span className='text-red-500'> *</span> are mandatory.
             </p>
             </div>

        {/* Submit Button */}
        <div className='flex justify-center'>
          <button
            type='submit'
            disabled={loading || !formik.isValid}
            className='flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-lg hover:bg-[#003b73] cursor-pointer transition'>
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

      </form>
      <SocialAuthForm />
      <div>
        <Post />

      </div>
      
    </div>
  );
}
