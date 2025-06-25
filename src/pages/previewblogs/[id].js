//working 12/06

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import api from "@/utills/api";
import { ArrowLeft } from "lucide-react";
const getAccessToken = () => localStorage.getItem("access_Token");
export default function PreviewBlogs() {
  const router = useRouter();
  const { id } = router.query;
  const [blog, setBlog] = useState(null);
  useEffect(() => {
    if (!id) return;
    const fetchBlog = async () => {
      try {
        const res = await api.get(`/nodesetup/blogs/${id}`, {
          headers: {
            Authorization: `Bearer ${getAccessToken()}`,
          },
        });
        setBlog(res.data.data);
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };
    fetchBlog();
  }, [id]);
  const extractImagePath = (imagePath) => {
    if (!imagePath) return "/no-image.png";
    const cleanedPath = imagePath.replace(/\\/g, "/");
    return `http://192.168.0.105:3007/${
      cleanedPath.startsWith("/") ? cleanedPath.slice(1) : cleanedPath
    }`;
  };
  // Function to sanitize and render HTML content
  const renderHTMLContent = (htmlContent) => {
    // Basic HTML sanitization - you might want to use a library like DOMPurify for production
    const allowedTags = [
      "p",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "ul",
      "ol",
      "li",
      "br",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
    ];
    return {
      __html: htmlContent,
    };
  };
  if (!blog) return <div className="p-4">Loading blog...</div>;
  return (
    <div className="  bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 pt-25 sm:pt-25 sm:p-6 md:p-10 rounded-xl lg:pt-25 md:pt-25  shadow-lg lg:pl-72">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        Posted on: {new Date(blog.created_at).toLocaleDateString()}
      </p>

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
        {blog.title}
      </h1>

      {/* Blog Featured Image */}
      {blog.first_image && (
        <img
          src={extractImagePath(blog.first_image)}
          className="w-full max-w-full h-auto object-cover items-start rounded-lg mb-6"
          alt="Featured"
        />
      )}

      <div className="space-y-6 text-justify prose prose-sm sm:prose-base md:prose-lg max-w-none dark:prose-invert">
        {blog.contents.map((block, index) => {
          if (block.type === "text") {
            return (
              <div
                key={index}
                className="text-base leading-relaxed blog-content"
                dangerouslySetInnerHTML={renderHTMLContent(block.content)}
              />
            );
          }
          if (block.type === "secondary_title") {
            return (
              <div
                key={index}
                className="text-xl sm:text-2xl font-semibold mt-6 border-l-4 border-blue-500 pl-3"
                dangerouslySetInnerHTML={renderHTMLContent(block.content)}
              />
            );
          }
          if (block.type === "image") {
            return (
              <div key={index} className="">
                <img
                  src={extractImagePath(block.content)}
                  className="w-full max-w-md h-full max-h-100 object-cover rounded-xl shadow-md border  border-gray-200 my-4"
                  alt="Blog content"
                />
              </div>
            );
          }
          return null;
        })}

        <div className="flex justify-center mb-6">
          <button
            onClick={() => router.push("/Blogs")}
            className="flex items-center px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            <span className="font-semibold">Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}