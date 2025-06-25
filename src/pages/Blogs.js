//21/6/ 4:42 working code

import React, { useState, useEffect } from "react";
import api from "@/utills/api";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  FileText,
  Search,
  ArrowRight,
  Edit3,
  Trash2,
  Newspaper,
} from "lucide-react";
import { getAccessToken, getUserRole } from "@/utills/auth";
import usePermission from "./hooks/usePermission";

export default function UploadedBlogs() {
  const { is_view, is_add, is_update, is_delete } =
    usePermission("manage_follow_ups");
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [selectedBlogs, setSelectedBlogs] = useState(new Set());
  const [blogToDelete, setBlogToDelete] = useState(null);


  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const blogsRes = await api.get("/nodesetup/blogs", {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        });
        const blogsData = blogsRes?.data?.data || [];
        setBlogs(blogsData);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleAdd_blog = () => router.push("/Add-blog");
  const handleEdit = (id) => router.push(`/Add-blog?id=${id}`);

  const handleDelete = async (id) => {
      try {
        await api.delete(`/nodesetup/blogs/${id}`);
        setBlogs((prev) => prev.filter((blog) => blog.id !== id));
        setSelectedBlogs((prev) => prev.filter((blogId) => blogId !== id));
        toast.success("Blog deleted successfully!");
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    };

  const handleBulkDelete = async () => {
    if (
      confirm(`Are you sure you want to delete ${selectedBlogs.size} blog(s)?`)
    ) {
      try {
        const deletePromises = Array.from(selectedBlogs).map((id) =>
          api.delete(`/nodesetup/blogs/${id}`, {
            headers: {
              Authorization: `Bearer ${getAccessToken()}`,
            },
          })
        );
        await Promise.all(deletePromises);
        setBlogs((prevBlogs) =>
          prevBlogs.filter((blog) => !selectedBlogs.has(blog.id))
        );
        setSelectedBlogs(new Set());
        toast.success("Selected blogs deleted successfully!");
      } catch (error) {
        console.error("Bulk delete failed:", error);
        toast.error("Failed to delete selected blogs.");
      }
    }
  };

  const handleSelectBlog = (id) => {
    setSelectedBlogs((prev) => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedBlogs(
      selectedBlogs.size === blogs.length
        ? new Set()
        : new Set(blogs.map((b) => b.id))
    );
  };

  const filteredBlogs = blogs.filter((blog) => {
    const titleMatch = blog.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const categoryMatch =
      filterCategory === "All" || blog.category === filterCategory;
    return titleMatch && categoryMatch;
  });

  const extractFirstImage = (blog) => {
    if (!blog.first_image) return "/no-image.png";
    const cleanedPath = blog.first_image.replace(/\\/g, "/");
    return `http://192.168.0.105:3007/${
      cleanedPath.startsWith("/") ? cleanedPath.slice(1) : cleanedPath
    }`;
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 pt-12 lg:pl-64 px-4 sm:px-6 md:px-8'>
      <div className='w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
        {/* Header */}
        <div className='flex flex-wrap justify-between items-center mb-6'>
          <div className='flex items-center'>
            <Newspaper className='text-[#004b8f] size-9' />
            <h1 className='text-4xl font-bold text-[#004b8f] dark:text-white ml-2'>
              Blogs
            </h1>
          </div>

          {is_add === 1 && (
            <button
              onClick={handleAdd_blog}
              className='flex items-center gap-2 px-4 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg hover:shadow-xl group text-sm sm:text-base cursor-pointer'>
              <span className='font-semibold'>Add Blog</span>
              <ArrowRight
                size={18}
                className='group-hover:translate-x-1 transition-transform'
              />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className='bg-white dark:bg-gray-800 border border-[#004b8f]/20 rounded-2xl shadow p-4 mb-6'>
          <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
            <div className='relative w-full sm:w-auto'>
              <Search
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                size={18}
              />
              <input
                type='text'
                placeholder='Search blogs...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#004b8f]'
              />
            </div>
            {is_delete === 1 && (
              <button
                onClick={handleBulkDelete}
                disabled={selectedBlogs.size === 0}
                className={`px-4 py-2 rounded-lg text-white text-sm transition cursor-pointer ${
                  selectedBlogs.size > 0
                    ? "bg-red-500 hover:bg-red-600 cursor-pointer"
                    : "bg-red-300 cursor-pointer"
                }`}>
                Delete Selected ({selectedBlogs.size})
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className='bg-white dark:bg-gray-800 border border-[#004b8f]/30 rounded-2xl shadow overflow-hidden'>
          <div className='overflow-x-auto sm:overflow-hidden'>
            <table className='w-full text-sm'>
              <thead className='bg-[#004b8f] text-white'>
                <tr>
                  <th className='px-4 py-6 text-left'>
                    <input
                      type='checkbox'
                      checked={
                        selectedBlogs.size === blogs.length && blogs.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className='px-4 py-6 text-left'>Blog</th>
                  <th className='px-4 py-6 text-left'>Date</th>
                  <th className='px-4 py-6 text-left'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlogs.map((blog, idx) => (
                  <tr
                    key={blog.id}
                    className={
                      idx % 2 === 0
                        ? "bg-white text-black dark:bg-gray-900 dark:text-white"
                        : "bg-gray-100 text-black dark:bg-gray-800 dark:text-white"
                    }>
                    <td className='px-4 py-6'>
                      <input
                        type='checkbox'
                        checked={selectedBlogs.has(blog.id)}
                        onChange={() => handleSelectBlog(blog.id)}
                      />
                    </td>
                    {/* <td className='px-4 py-4'>
                      <div className='flex items-center gap-4'>
                        <img
                          src={extractFirstImage(blog)}
                          alt='Blog'
                          className='w-28 h-20 object-cover rounded-xl shadow-md border hover:scale-105 transition-transform duration-200'
                        />
                        <p
                          className='font-semibold text-gray-900 dark:text-white hover:underline cursor-pointer'
                          onClick={() =>
                            router.push(`/previewblogs/${blog.id}`)
                          }>
                          {blog.title}
                        </p>
                      </div>
                    </td> */}
                    <td className='px-4 py-5'>
                      <div className='flex items-center gap-4'>
                        <img
                          src={extractFirstImage(blog)}
                          alt='Blog'
                          className='w-28 h-20 object-cover rounded-xl shadow-md border hover:scale-105 transition-transform duration-200'
                        />

                        {/* Blog title with preview tooltip */}
                        <div className='relative group'>
                          <p
                            className='font-semibold text-gray-900 dark:text-white hover:underline cursor-pointer'
                            onClick={() =>
                              router.push(`/previewblogs/${blog.id}`)
                            }>
                            {blog.title}
                          </p>

                          {/* Tooltip Preview */}
                          <div className='absolute left-0 mt-2 w-fit bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 z-10'>
                            <h4 className='text-sm font-medium '>
                              Preview Blog
                            </h4>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className='px-4 py-4 text-gray-700 dark:text-gray-300'>
                      {new Date(blog.created_at).toLocaleDateString("en-GB")}
                    </td>
                    <td className='px-4 py-4'>
                      <div className='flex gap-2'>
                        {is_update === 1 && (
                          <button
                            onClick={() => handleEdit(blog.id)}
                            className='text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/20 p-2 rounded-lg cursor-pointer'>
                            <Edit3 size={16} />
                          </button>
                        )}

                        {is_delete === 1 && (
                          <button
                            onClick={() => setBlogToDelete(blog.id)}
                            className='text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20 p-2 rounded-lg cursor-pointer'>
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
        </div>

        {blogToDelete && (
          <div className='fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50'>
            <div className='bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-sm'>
              <h2 className='text-lg font-semibold mb-4 text-gray-900 dark:text-white'>
                Confirm Deletion
              </h2>
              <p className='mb-4 text-gray-700 dark:text-gray-300'>
                Are you sure you want to delete this blog?
              </p>
              <div className='flex justify-end gap-3'>
                <button
                  onClick={() => setBlogToDelete(null)}
                  className='px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'>
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDelete(blogToDelete);
                    setBlogToDelete(null);
                  }}
                  className='px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer duration-300'>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBlogs.length === 0 && (
          <div className='text-center py-12'>
            <FileText size={48} className='mx-auto text-gray-400 mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
              No blogs found
            </h3>
            <p className='text-gray-600 dark:text-gray-400'>
              {searchTerm || filterCategory !== "All"
                ? "Try adjusting your search or filters"
                : "Start by adding your first blog"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
