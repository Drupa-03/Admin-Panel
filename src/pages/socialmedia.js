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
import api from "@/utills/api";
import { toast } from "react-toastify";

export default function UploadedSocialPosts() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [filterPlatform, setFilterPlatform] = useState("All");
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [postToDelete, setPostToDelete] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get("/nodesetup/social");
        // Ensure we're working with an array and transform the data
        const postsData = Array.isArray(response.data?.data)
          ? response.data.data.map((post) => ({
              id: post.id,
              description: post.content,
              imageUrl: post.image_path ? JSON.parse(post.image_path)[0] : null,
              author: `Admin ${post.admin_id}`,
              date: new Date(post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              platforms:
                post.platform === "all"
                  ? ["Instagram", "LinkedIn", "Facebook"]
                  : [post.platform],
              status: post.status,
              engagement: {
                views: 0,
                likes: 0,
                shares: 0,
              },
            }))
          : [];
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
        toast.error("Failed to load posts");
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleAddPost = () => router.push("/Add-post");

  const handleDelete = async (id) => {
    try {
      await api.delete(`/nodesetup/social/${id}`);
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
    platforms?.map((p) => {
      const iconProps = { size: 16, className: "inline" };
      if (p === "Instagram")
        return (
          <Instagram {...iconProps} key="insta" className="text-pink-600" />
        );
      if (p === "LinkedIn")
        return (
          <Linkedin {...iconProps} key="linkedin" className="text-blue-700" />
        );
      if (p === "Facebook")
        return (
          <Facebook {...iconProps} key="facebook" className="text-blue-600" />
        );
      return null;
    });

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform =
      filterPlatform === "All" || post.platforms?.includes(filterPlatform);
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-72 pt-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex">
            <MessageCircle className="text-[#004b8f] size-8" />
            <h1 className="text-3xl font-bold text-[#004b8f] dark:text-white ml-2">
              Posts
            </h1>
          </div>
          <button
            onClick={handleAddPost}
            className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg hover:shadow-xl group cursor-pointer"
          >
            <span className="font-semibold">Add Post</span>
            <ArrowRight
              size={18}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 border-2 border-[#004b8f]/20 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004b8f]"></div>
          </div>
        )}

        {/* Posts Table */}
        {!loading && (
          <div className="bg-white dark:bg-gray-800 border-2 border-[#004b8f]/20 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#004b8f] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">
                      Post
                    </th>
                    {/* <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">
                      Platforms
                    </th> */}
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPosts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          {post.imageUrl && (
                            <img
                              src={post.imageUrl}
                              alt="Post"
                              className="w-16 h-12 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = "/images/default-post.jpg";
                              }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 dark:text-white line-clamp-2 leading-relaxed">
                              {post.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {getPlatformIcons(post.platforms)}
                        </div>
                      </td> */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(post.date).toLocaleDateString("en-GB")}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            post.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {post.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {postToDelete && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Confirm Deletion
              </h2>
              <p className="mb-4 text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this post?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setPostToDelete(null)}
                  className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDelete(postToDelete);
                    setPostToDelete(null);
                  }}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 cursor-pointer duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No posts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
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
