//19/06
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Home,
  Newspaper,
  MessageCircle,
  Menu,
  X,
  Users,
  CalendarCheck,
  User,
  Key,
} from "lucide-react";
import Image from "next/image";

export default function Sidebar() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState("/");
  const [isMobile, setIsMobile] = useState(false);
  const [authData, setAuthData] = useState({ user_type: "", role_id: null }); // ✅ holds user_type
  const router = useRouter();

  const [dropdowns, setDropdowns] = useState({
    Blog: false,
    "Social Media": false,
    Leads: false,
    "Follow Up": false,
  });

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 1024);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    const auth = localStorage.getItem("Auth"); // ✅ FIXED: fetch Auth here
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        setAuthData({
          user_type: parsed.user_type || "",
          role_id: parsed.role_id || null,
        });
      } catch (err) {
        console.error("Error parsing Auth from localStorage:", err);
      }
    }
  }, [router.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const toggleDropdown = (id) => {
    setDropdowns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleLinkClick = (href) => {
    setSelectedLink(href);
    if (isMobile) setSidebarOpen(false);
  };

  const handleParentClick = (item) => {
    router.push(item.href);
    setSelectedLink(item.href);
    toggleDropdown(item.id);
    if (isMobile) setSidebarOpen(false);
  };

  const handleDashboard = () => {
    router.push("/dashboard");
  };

  const navItems = [
  {
    id: "Blog",
    label: "Blog",
    icon: Newspaper,
    href: "/blogs",
    isDropdown: true,
    items: [{ href: "blogs", label: "Blogs" }],
  },
  // {
  //   id: "Social Media",
  //   label: "Social Media",
  //   icon: MessageCircle,
  //   href: "/socialmedia",
  //   isDropdown: true,
  //   items: [{ href: "/socialmedia", label: "Socialmedia" }],
  // },
  {
    id: "Leads",
    label: "Leads",
    icon: Users,
    href: "/leads",
    isDropdown: true,
    items: [{ href: "/Leads", label: "Leads" }],
  },
  {
    id: "Follow Up",
    label: "Follow Up",
    icon: CalendarCheck,
    href: "/followup",
    isDropdown: true,
    items: [{ href: "/followup", label: "Followup" }],
  },
  {
    id: "Existing Client",
    label: "Existing Client",
    icon: User,
    href: "/existingclient",
    isDropdown: true,
    items: [{ href: "/existingclient", label: "Existingclient" }],
  },
  // ✅ Only add this if user_type === "admin"
  ...(authData.user_type === "admin"
    ? [
        {
          id: "Permission",
          label: "Permission",
          icon: Key,
          href: "/Permission",
          isDropdown: true,
          items: [{ href: "/Permission", label: "Permission" }],
        },
        {
          id: "Staff",
          label: "Staff",
          icon: Users,
          href: "/staff",
          isDropdown: true,
          items: [{ href: "/staff", label: "Staff" }],
        },
      ]
    : []),
];

  return (
    <>
      <button
        className={`fixed p-2 mt-1 cursor-pointer text-[#004b8f] z-30 transition-all duration-300 ${
          isSidebarOpen ? "ml-64 hidden" : "ml-0"
        } lg:hidden`}
        onClick={toggleSidebar}>
        <Menu className='w-8 h-8' />
      </button>

      <aside
        className={`fixed top-0 left-0 flex flex-col w-64 h-screen px-4 py-4 border-r border-gray-700 transition-all duration-300 ease-in-out z-30 ${
          isMobile
            ? isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        }`}
        style={{ backgroundColor: "#0d0d0d" }}>
        <div className='flex justify-between items-center mb-6'>
          <Image
            src='/images/azzip-blue.png'
            alt='Azzip Logo'
            width={130}
            height={60}
          />
          <button
            className='lg:hidden cursor-pointer text-gray-400 hover:text-white'
            onClick={toggleSidebar}>
            <X className='w-6 h-6' />
          </button>
        </div>

        <div className='pt-0 -mt-4 border-t border-gray-700'></div>

        <nav className='flex-1 overflow-y-auto'>
          <ul className='space-y-2'>
            <li>
              <button
                onClick={() => handleLinkClick("/")}
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors duration-200 ${
                  selectedLink === "/"
                    ? "bg-[#004b8f] text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}>
                <Home className='h-5 w-5 mr-3' />
                <span className='font-medium' onClick={handleDashboard}>
                  Dashboard
                </span>
              </button>
            </li>

            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleParentClick(item)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-200 ${
                    selectedLink === item.href
                      ? "bg-[#004b8f] text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}>
                  <div className='flex items-center'>
                    <item.icon className='h-5 w-5 mr-3' />
                    <span className='font-medium'>{item.label}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
