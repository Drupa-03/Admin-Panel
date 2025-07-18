import React from "react";
import Image from "next/image";

const ErrorPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-38 lg:pl-64 px-4 sm:px-6 md:px-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* AzzipTech Logo Centered */}
        <div className="flex justify-center mb-10">
          <Image
            src="/images/azzip-blue.png"
            alt="AzzipTech Logo"
            width={180}
            height={60}
          />
        </div>

        {/* Lock Icon */}
        <div className="flex justify-center mb-6 animate-pulse">
          <Image
            src="/images/images.png"
            alt="Access Denied"
            width={90}
            height={90}
          />
        </div>

        {/* Message Centered */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#004B8F] dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-700 dark:text-gray-300 max-w-xl mx-auto mb-6 text-lg">
            You do not have permission to access this page. <br />
            Please contact{" "}
            <a
              href="mailto:azziptechnology@gmail.com"
              className="text-blue-600 underline"
            >
              azziptechnology@gmail.com
            </a>{" "}
            or return to the dashboard.
          </p>

          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="px-6 py-3 bg-[#004B8F] hover:bg-[#003366] text-white font-semibold rounded-lg shadow-md transition-all duration-200"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
