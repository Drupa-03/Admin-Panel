import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { IoLogOutOutline, IoChevronDown } from "react-icons/io5";
import api from "@/utills/api";
import { getUserRole } from "@/utills/auth";

export default function Header() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [userInitial, setUserInitial] = useState("U");

  // ✅ Fetch user initial
  useEffect(() => {
    const fetchUserInitial = async () => {
      const { id, token, user_type } = getUserRole();
      if (!id || !token) return;

      const endpoint = user_type === "admin" ? "admins" : "staff";

      try {
        const res = await api.get(`/nodesetup/${endpoint}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const name = res.data?.data?.username || "User";
        setUserInitial(name.charAt(0).toUpperCase());
      } catch (error) {
        console.error("Failed to fetch user initial:", error);
        setUserInitial("U");
      }
    };

    fetchUserInitial();
  }, []);

  // ✅ Logout logic (inline)
  const handleLogout = async () => {
    try {
      const access_token = localStorage.getItem("access_token");
      if (access_token) {
        await api.post(
          "/nodesetup/auth/logout",
          null,
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout API failed:", error);
    }

    localStorage.clear();
    router.push("/login");
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
    <header className='lg:ml-64 bg-[#0d0d0d] text-white shadow-md py-3 fixed top-0 left-0 right-0 z-20'>
      <div className='container-fluid flex justify-end px-6'>
        <div className='relative flex' ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className='flex items-center gap-2 bg-[#004b8f] hover:bg-[#003a6b] px-3 py-2 rounded-full mr-2 transition-colors'
            title='Profile'>
            <span className='text-white font-semibold text-lg w-7 h-7 rounded-full bg-[#003a6b] flex items-center justify-center'>
              {userInitial}
            </span>
            <IoChevronDown
              className={`text-white text-xl transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {dropdownOpen && (
            <div className='absolute right-0 mt-14 w-44 bg-white text-black rounded-lg dark:bg-[#0d0d0d] dark:text-white shadow-lg z-30'>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  router.push("/profile");
                }}
                className='block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800'>
                User Profile
              </button>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className='block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800'>
                <div className='flex items-center gap-2'>
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
