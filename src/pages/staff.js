//working code 27/06

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, User, ArrowRight, Trash2, Edit3 } from "lucide-react";
import api from "@/utills/api";
import { toast } from "react-toastify";
import usePermission from "./hooks/usePermission";

export default function StaffPage() {
  const { is_view, is_add, is_update, is_delete } =
    usePermission("manage_staff");
  const router = useRouter();
  const [staffList, setStaffList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(new Set());

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await api.get("/nodesetup/staff");
        setStaffList(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch staff:", error);
        toast.error("Failed to load staff list");
      }
    };
    fetchStaff();
  }, []);

const handleDelete = async (id) => {
  try {
    await api.delete(`/nodesetup/staff/${id}`);
    setStaffList((prev) => prev.filter((staff) => staff.staff_id !== id));
    toast.success("Staff deleted successfully");
  } catch (error) {
    console.error("Delete failed:", error);
    toast.error("Failed to delete staff");
  }
};


  const filteredStaff = staffList.filter(
    (staff) =>
      staff.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.mobile?.toString().includes(searchQuery)
  );

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-72 pt-12 px-4 sm:px-6 md:px-8'>
      <div className='max-w-7xl mx-auto py-10'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
          <div className='flex items-center'>
            <User className='text-[#004b8f] size-8' />
            <h1 className='text-3xl font-bold text-[#004b8f] dark:text-white ml-2'>
              Staff Management
            </h1>
          </div>
          {is_add === 1 && (
            <button
              onClick={() => router.push("/Add-staff")}
              className='flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg hover:shadow-xl group cursor-pointer'>
              <span className='font-semibold'>Add Staff</span>
              <ArrowRight
                size={18}
                className='transition-transform duration-300 group-hover:translate-x-1'
              />
            </button>
          )}
        </div>

        <div className='bg-white dark:bg-gray-800 border-2 border-[#004b8f]/20 rounded-2xl shadow-lg p-6 mb-6'>
          <div className='relative'>
            <Search
              className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              size={18}
            />
            <input
              type='text'
              placeholder='Search staff...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]'
            />
          </div>
        </div>

        {filteredStaff.length === 0 ? (
          <p className='text-gray-600 dark:text-gray-300'>No staff found.</p>
        ) : (
          <div className='overflow-x-auto bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700'>
            <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm'>
              <thead className='bg-[#004b8f] text-white'>
                <tr>
                  <th className='px-4 py-3 text-left'>Username</th>
                  <th className='px-4 py-3 text-left'>Email</th>
                  <th className='px-4 py-3 text-left'>Mobile</th>
                  <th className='px-4 py-3 text-center'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 dark:divide-gray-700 text-gray-800 dark:text-gray-100'>
                {filteredStaff.map((staff, idx) => (
                  <tr
                    key={staff.staff_id}
                    className={
                      idx % 2 === 0
                        ? "bg-white text-black dark:bg-gray-900 dark:text-white"
                        : "bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
                    }>
                    <td className='px-4 py-3'>{staff.username}</td>
                    <td className='px-4 py-3'>{staff.email}</td>
                    <td className='px-4 py-3'>{staff.mobile}</td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2 justify-center'>
                        {is_update === 1 && (
                          <button
                            onClick={() =>
                              router.push(`/Add-staff?id=${staff.staff_id}`)
                            }
                            className='p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer'
                            title='Edit Staff'>
                            <Edit3 size={16} />
                          </button>
                        )}
                        {is_delete === 1 && (
                          <button
                            onClick={() => setStaffToDelete(staff.staff_id)}
                            className='p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer'
                            title='Delete Staff'>
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {staffToDelete && (
          <div className='fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50'>
            <div className='bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-sm'>
              <h2 className='text-lg font-semibold mb-4 text-gray-900 dark:text-white'>
                Confirm Deletion
              </h2>
              <p className='mb-4 text-gray-700 dark:text-gray-300'>
                Are you sure you want to delete this staff?
              </p>
              <div className='flex justify-end gap-3'>
                <button
                  onClick={() => setStaffToDelete(null)}
                  className='px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'>
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDelete(staffToDelete);
                    setStaffToDelete(null);
                  }}
                  className='px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer duration-300'>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
