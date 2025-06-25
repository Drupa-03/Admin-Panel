import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Edit3,
  Facebook,
  Filter,
  Instagram,
  Linkedin,
  MessageCircle,
  Search,
  Trash2,
  FileText,
} from "lucide-react";
import api from "@/utills/api"; // Ensure this exists
import { toast } from "react-toastify";

const demoPosts = [
  {
    id: 1,
    description: "Join our innovative team and help us build cutting-edge web applications. Apply now!",
    imageUrl: "/images/chatbot-azziptech.jpeg",
    author: "Azziptech BDE",
    date: "May 30, 2025",
    platforms: ["Instagram", "LinkedIn", "Facebook"],
    tags: ["Hiring", "React", "Team"],
    status: "Published",
    engagement: { views: 2340, likes: 145, shares: 23 },
  },
  {
    id: 2,
    description: "Excited to launch our AI chatbot that automates customer service 24/7. Try it today!",
    imageUrl: "/images/chatbot-azziptech.jpeg",
    author: "Azziptech BDE",
    date: "May 25, 2025",
    platforms: ["LinkedIn", "Facebook"],
    tags: ["AI", "Product Launch", "Automation"],
    status: "Published",
    engagement: { views: 1890, likes: 98, shares: 34 },
  },
];

export default function UploadedSocialPosts() {
  const router = useRouter();
  const [posts, setPosts] = useState(demoPosts);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState("All");
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    // Simulate loading state for demo
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAddPost = () => router.push("/Add-post");

  const handleDelete = async (id) => {
    try {
      await api.delete(`/nodesetup/post/${id}`);
      setPosts((prev) => prev.filter((post) => post.id !== id));
      setSelectedPosts((prev) => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
      toast.success("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("Failed to delete post.");
    }
  };

  const handleSelectPost = (postId) => {
    setSelectedPosts((prev) => {
      const updated = new Set(prev);
      updated.has(postId) ? updated.delete(postId) : updated.add(postId);
      return updated;
    });
  };

  const handleSelectAll = () => {
    setSelectedPosts((prev) =>
      prev.size === posts.length ? new Set() : new Set(posts.map((p) => p.id))
    );
  };

  const getPlatformIcons = (platforms) =>
    platforms.map((p) => {
      const iconProps = { size: 16, className: "inline" };
      if (p === "Instagram")
        return <Instagram {...iconProps} key='insta' className='text-pink-600' />;
      if (p === "LinkedIn")
        return <Linkedin {...iconProps} key='linkedin' className='text-blue-700' />;
      if (p === "Facebook")
        return <Facebook {...iconProps} key='facebook' className='text-blue-600' />;
      return null;
    });

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform =
      filterPlatform === "All" || post.platforms.includes(filterPlatform);
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-72 pt-12 px-4 sm:px-6 md:px-8'>
      <div className='max-w-7xl mx-auto py-8'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
          <div className='flex'>
            <MessageCircle className='text-[#004b8f] size-8' />
            <h1 className='text-3xl font-bold text-[#004b8f] dark:text-white ml-2'>
              Posts
            </h1>
          </div>
          <button
            onClick={handleAddPost}
            className='flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg hover:shadow-xl group cursor-pointer'>
            <span className='font-semibold'>Add Post</span>
            <ArrowRight size={18} className='transition-transform duration-300 group-hover:translate-x-1' />
          </button>
        </div>

        {/* Filters and Search */}
        <div className='bg-white dark:bg-gray-800 border-2 border-[#004b8f]/20 rounded-2xl shadow-lg p-6 mb-6'>
          <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
            <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={18} />
                <input
                  type='text'
                  placeholder='Search posts...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]'
                />
              </div>

              {/* Platform Filter */}
              <div className='flex items-center gap-2'>
                <Filter size={18} className='text-gray-500' />
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]'>
                  {["All", "Instagram", "LinkedIn", "Facebook"].map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bulk Delete */}
            {selectedPosts.size > 0 && (
              <div className='flex items-center gap-2'>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  {selectedPosts.size} selected
                </span>
                <button
                  className='px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm cursor-pointer'
                  onClick={() => {
                    selectedPosts.forEach((id) => handleDelete(id));
                  }}>
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Posts Table */}
        <div className='bg-white dark:bg-gray-800 border-2 border-[#004b8f]/20 rounded-2xl shadow-lg overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-[#004b8f] text-white'>
                <tr>
                  <th className='px-6 py-4 text-left'>
                    <input
                      type='checkbox'
                      checked={selectedPosts.size === posts.length && posts.length > 0}
                      onChange={handleSelectAll}
                      className='w-4 h-4 text-[#004b8f] bg-gray-100 border-gray-300 rounded focus:ring-[#004b8f]'
                    />
                  </th>
                  <th className='px-6 py-4 text-left text-xs uppercase tracking-wider'>Post</th>
                  <th className='px-6 py-4 text-left text-xs uppercase tracking-wider'>Platforms</th>
                  <th className='px-6 py-4 text-left text-xs uppercase tracking-wider'>Date</th>
                  <th className='px-6 py-4 text-left text-xs uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
                {filteredPosts.map((post) => (
                  <tr key={post.id} className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'>
                    <td className='px-6 py-4'>
                      <input
                        type='checkbox'
                        checked={selectedPosts.has(post.id)}
                        onChange={() => handleSelectPost(post.id)}
                        className='w-4 h-4 text-[#004b8f] bg-gray-100 border-gray-300 rounded focus:ring-[#004b8f]'
                      />
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-4'>
                        <img src={post.imageUrl} alt='Post' className='w-16 h-12 object-cover rounded-lg' />
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm text-gray-900 dark:text-white line-clamp-2 leading-relaxed'>
                            {post.description}
                          </p>
                          <div className='flex gap-1 mt-2'>
                            {post.tags.slice(0, 2).map((tag, index) => (
                              <span key={index} className='px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md'>
                                #{tag}
                              </span>
                            ))}
                            {post.tags.length > 2 && (
                              <span className='px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md'>
                                +{post.tags.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex gap-2'>{getPlatformIcons(post.platforms)}</div>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-sm text-gray-600 dark:text-gray-400'>{post.date}</span>
                    </td>
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => router.push(`/Add-post/${post.id}`)}
                          className='p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors cursor-pointer'
                          title='Edit Post'>
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => setPostToDelete(post.id)}
                          className='p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer'
                          title='Delete Post'>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {postToDelete && (
          <div className='fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50'>
            <div className='bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-sm'>
              <h2 className='text-lg font-semibold mb-4 text-gray-900 dark:text-white'>Confirm Deletion</h2>
              <p className='mb-4 text-gray-700 dark:text-gray-300'>Are you sure you want to delete this post?</p>
              <div className='flex justify-end gap-3'>
                <button
                  onClick={() => setPostToDelete(null)}
                  className='px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'>
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDelete(postToDelete);
                    setPostToDelete(null);
                  }}
                  className='px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer duration-300'>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <div className='text-center py-12'>
            <FileText size={48} className='mx-auto text-gray-400 mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>No posts found</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              {searchTerm || filterPlatform !== "All"
                ? "Try adjusting your search or filter criteria"
                : "Get started by creating your first social media post"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
