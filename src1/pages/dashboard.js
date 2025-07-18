import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Newspaper, Users, User } from "lucide-react";
import api from "@/utills/api";
export default function Dashboard() {
  const [blogCount, setBlogCount] = useState(0);
  const [leadCount, setLeadCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  useEffect(() => {
    const fetchBlogCount = async () => {
      try {
        const token = localStorage.getItem("access_token"); // Fix key
        console.log("Blog token:", token); // Debug
        if (!token) throw new Error("No token found");
        const res = await api.get("/nodesetup/blogs/count", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBlogCount(res.data.data.total_blogs);
      } catch (error) {
        console.error("Failed to fetch blog count:", error);
      }
    };
    fetchBlogCount();
  }, []);
  useEffect(() => {
    const fetchLeadCount = async () => {
      try {
        const token = localStorage.getItem("access_token"); // Fix key
        console.log("Lead token:", token); // Debug
        if (!token) throw new Error("No token found");
        const res = await api.get("/nodesetup/leads/count", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setLeadCount(res.data.data.total_leads);
      } catch (error) {
        console.error("Failed to fetch lead count:", error); // Fix typo
      }
    };
    fetchLeadCount();
  }, []);
  useEffect(() => {
    const fetchClientCount = async () => {
      try {
        const token = localStorage.getItem("access_token"); // Fix key
        console.log("Client token:", token); // Debug
        if (!token) throw new Error("No token found");
        const res = await api.get("/nodesetup/customers/count", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setClientCount(res.data.data.total_customers);
      } catch (error) {
        console.error("Failed to fetch client count:", error);
      }
    };
    fetchClientCount();
  }, []);
  const router = useRouter();
  const dashboardData = [
    {
      title: "Blogs",
      icon: <Newspaper size={50} className='text-[#004B8F]' />,
      count: blogCount,
      route: "/Blogs",
    },
    {
      title: "Leads",
      icon: <Users size={50} className='text-[#004B8F]' />,
      count: leadCount,
      route: "/leads",
    },
    {
      title: "Client",
      icon: <User size={50} className='text-[#004B8F]' />,
      count: clientCount,
      route: "/existingclient",
    },
  ];
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-72'>
      <div className='container mx-auto px-2 py-8'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold text-[#004B8F] dark:text-white mt-18'>
            Dashboard
          </h1>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8'>
          {dashboardData.map((item, index) => (
            <div
              key={index}
              onClick={() => router.push(item.route)}
              className='relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-110 cursor-pointer group border-2 border-[#004B8F]/20 hover:border-[#004B8F] overflow-hidden'>
              <div className='relative z-10 p-8 flex flex-col items-center text-center'>
                <div className='mb-6 relative'>
                  <div className='absolute inset-0 bg-[#004B8F]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                  <div className='relative transform group-hover:scale-110 transition-transform duration-300'>
                    {item.icon}
                  </div>
                </div>
                <h3 className='text-lg font-bold text-[#004B8F] dark:text-gray-300 mb-3 transition-colors duration-300 tracking-wide'>
                  {item.title}
                </h3>
                <h3 className='text-xl font-bold text-[#004B8F] dark:text-gray-300 transition-colors duration-300 tracking-wide'>
                  {item.count}
                </h3>
              </div>
              <div className='absolute top-4 right-4 w-3 h-3 bg-[#004B8F]/30 group-hover:bg-white/50 rounded-full transition-colors duration-300'></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
