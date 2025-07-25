//Working code 27/06

import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  LogOut,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { performLogout } from "@/utills/logout";
import { getUserRole } from "@/utills/auth";
import api from "@/utills/api";
import { toast } from "react-toastify";
import usePermission from "./hooks/usePermission";
import { useRouter } from "next/navigation";

export default function Profile() {
  const { is_view, is_add, is_update, is_delete } =
    usePermission("manage_staff");
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userProfile, setUserProfile] = useState({
    username: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [editedProfile, setEditedProfile] = useState({ ...userProfile });

  const { token, user_type, id } = getUserRole();
  // const canEdit = user_type === "admin"; // Only admin can edit

  useEffect(() => {
    const fetchProfile = async () => {
      const { id, token } = getUserRole();
      if (!id || !token) return toast.error("Missing authentication details");

      const endpoint = user_type === "admin" ? "admins" : "staff";

      try {
        const res = await api.get(`/nodesetup/${endpoint}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 200 && res.data?.data) {
          const { username, email, mobile } = res.data.data;
          setUserProfile({
            username,
            email,
            mobile,
            password: "********", // Keep masked
          });
        } else {
          toast.error("Failed to load profile");
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        toast.error("Error loading profile");
      }
    };

    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditedProfile({ ...userProfile }); // sync form with current data
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile({ ...userProfile });
    setIsEditing(false);
  };

  const handleSave = async () => {
    const { id, token } = getUserRole();
    if (!id || !token) return toast.error("Missing authentication details");

    const endpoint = user_type === "admin" ? "admins" : "staff";
    try {
      const payload = {
        username: editedProfile.username,
        email: editedProfile.email,
        mobile: editedProfile.mobile,
        password: editedProfile.password,
      };

      if (editedProfile.password !== "********") {
        payload.password = editedProfile.password;
      }

      const res = await api.put(`/nodesetup/${endpoint}/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        setUserProfile({ ...editedProfile });
        setIsEditing(false);
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error("Profile update failed");
    }
  };

  const handleInputChange = (field, value) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogout = () => {
    performLogout(router);
  };

  const profileFields = [
    {
      id: "username",
      label: "Username",
      icon: <User size={24} className='text-[#004b8f]' />,
      value: isEditing ? editedProfile.username : userProfile.username,
      type: "text",
    },
    {
      id: "email",
      label: "Email",
      icon: <Mail size={24} className='text-[#004b8f]' />,
      value: isEditing ? editedProfile.email : userProfile.email,
      type: "email",
    },
    {
      id: "mobile",
      label: "Mobile Number",
      icon: <Phone size={24} className='text-[#004b8f]' />,
      value: isEditing ? editedProfile.mobile : userProfile.mobile,
      type: "tel",
    },
    {
      id: "password",
      label: "Password",
      icon: <Lock size={24} className='text-[#004b8f]' />,
      value: isEditing ? editedProfile.password : userProfile.password,
      type: "password",
    },
  ];

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-12 px-4 sm:px-6 md:px-8'>
      <div className='max-w-6xl mx-auto py-8'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
          <h1 className='text-3xl font-bold text-[#004b8f] dark:text-white'>
            User Profile
          </h1>
          {is_update && (
            <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
              {!isEditing ? (
                <div className="flex gap-4">
                  <button
                    onClick={handleEdit}
                    className='flex items-center justify-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 transform hover:scale-116 shadow-lg hover:shadow-xl w-full sm:w-auto'>
                    <Edit size={20} />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className='group flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] cursor-pointer duration-300'>
                    <ArrowLeft
                      size={18}
                      className='group-hover:-translate-x-1 transition-transform duration-300'
                    />
                    <span>Back</span>
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className='flex items-center justify-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 transform hover:scale-116 shadow-lg hover:shadow-xl w-full sm:w-auto'>
                    <Save size={20} />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className='flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 transform hover:scale-116 shadow-lg hover:shadow-xl w-full sm:w-auto'>
                    <X size={20} />
                    Cancel
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className='relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-[#004b8f]/20 hover:border-[#004b8f] overflow-hidden mb-8'>
          <div className='absolute inset-0 bg-gradient-to-br from-[#004b8f]/10 via-blue-50 to-indigo-50 dark:from-[#004b8f]/20 dark:via-gray-700 dark:to-gray-800'></div>
          <div className='relative z-10 p-6 sm:p-8'>
            <div className='flex flex-col sm:flex-row items-center gap-6'>
              <div className='w-24 h-24 bg-gradient-to-br from-[#004b8f] via-purple-600 to-[#004b8f] rounded-full flex items-center justify-center shadow-lg'>
                <User size={40} className='text-white' />
              </div>
              <div className='text-center sm:text-left'>
                <h2 className='text-2xl font-bold text-[#004b8f] dark:text-white mb-2'>
                  {userProfile.username}
                </h2>
                <p className='text-gray-600 dark:text-gray-300'>
                  {userProfile.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Fields */}
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8'>
          {profileFields.map((field) => (
            <div
              key={field.id}
              className='relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-[#004b8f]/20 hover:border-[#004b8f] transition-all duration-500 group'>
              <div className='absolute inset-0 bg-gradient-to-br from-[#004b8f]/5 via-blue-50/50 to-indigo-50/50 dark:from-[#004b8f]/10 dark:via-gray-700/50 dark:to-gray-800/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
              <div className='relative z-10 p-6'>
                <div className='mb-4 relative'>
                  <div className='absolute inset-0 bg-[#004b8f]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                  <div className='relative w-fit'>{field.icon}</div>
                </div>
                <label className='block text-sm font-semibold text-[#004b8f] dark:text-gray-300 mb-3 tracking-wide'>
                  {field.label}
                </label>
                {isEditing ? (
                  <div className='relative'>
                    <input
                      type={
                        field.type === "password" && showPassword
                          ? "text"
                          : field.type
                      }
                      value={field.value}
                      onChange={(e) =>
                        handleInputChange(field.id, e.target.value)
                      }
                      className='w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-[#004b8f] focus:outline-none text-gray-800 dark:text-white'
                    />
                    {field.type === "password" && (
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#004b8f]'>
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className='px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl'>
                    <span className='text-gray-800 dark:text-white font-medium'>
                      {field.type === "password" ? "••••••••" : field.value}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        {/* Logout (only show when not editing) */}
        {!isEditing && (
          <div className='flex justify-center sm:justify-end'>
            <button
              onClick={handleLogout}
              className='gap-2 px-6 py-3 bg-[#004B8F] text-white rounded-xl hover:bg-[#003D73] transition-all duration-300 transform hover:scale-116 shadow-lg hover:shadow-xl font-semibold w-full sm:w-auto'>
              <LogOut size={20} className='inline-block mr-2' />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
