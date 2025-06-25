import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { IoLogOutOutline } from "react-icons/io5";
import { User } from "lucide-react";
import { performLogout } from "@/utills/logout"; // ✅ import utility

export default function Header() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    performLogout(router);
  };

  // ✅ Close dropdown on outside click or scroll
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleScroll = () => {
      setDropdownOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="lg:ml-64 bg-[#0d0d0d] text-white shadow-md py-3 fixed top-0 left-0 right-0 z-20">
      <div className="container-fluid flex justify-end px-6">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="rounded-full bg-[#004b8f] hover:bg-[#003a6b] p-2 mr-2 transition-colors"
            title="Profile"
          >
            <User className="w-6 h-6 text-white" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded-lg dark:bg-[#0d0d0d] dark:text-white shadow-lg z-30">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/profile");
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                User Profile
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  <IoLogOutOutline />
                  Logout
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
