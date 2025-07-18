//Working code 27/06

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@headlessui/react";
import {
  Pencil,
  Trash2,
  MailCheck,
  ArrowRight,
  FileImage,
  FileText,
  File,
  FileType2,
  FileSpreadsheet,
  Search
} from "lucide-react";
import api from "@/utills/api";
import { toast } from "react-toastify";
import usePermission from "./hooks/usePermission";
import ReactModalImage from "react-modal-image";
import ErrorPage from "./_error1";

export default function FollowUpMessages() {
  const { is_view, is_add, is_update, is_delete } =
    usePermission("manage_follow_ups");
  const router = useRouter();
  const [followUps, setFollowUps] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch follow-ups from API
  useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        const response = await api.get("/nodesetup/followups");
        const data = response.data?.data;
        setFollowUps(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching follow-ups:", err);
        setFollowUps([]);
      }
    };
    fetchFollowUps();
  }, []);

  const handleEdit = (id) => {
    router.push(`/Add-Followup?id=${id}`);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/nodesetup/followups/${id}`);
      setFollowUps((prev) => prev.filter((item) => item.id !== id));
      setConfirmDelete(null);
      toast.success("Follow-up deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete follow-up");
    }
  };

  const isImageFile = (filename) => {
    if (!filename) return false;
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "svg"];
    const ext = filename.split(".").pop().toLowerCase();
    return imageExtensions.includes(ext);
  };

  const getFileIcon = (filename) => {
    if (!filename) return <File size={16} />;

    const ext = filename.split(".").pop().toLowerCase();
    switch (ext) {
      case "pdf":
        return <FileText size={16} className="text-red-500" />;
      case "doc":
      case "docx":
        return <FileType2 size={16} className="text-blue-500" />;
      case "xls":
      case "xlsx":
        return <FileSpreadsheet size={16} className="text-green-500" />;
      case "ppt":
      case "pptx":
        return <FileText size={16} className="text-orange-500" />;
      case "txt":
        return <FileText size={16} className="text-gray-500" />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImage size={16} className="text-purple-500" />;
      default:
        return <File size={16} className="text-gray-500" />;
    }
  };

  const handleFileClick = (filePath) => {
    const fullUrl = `${api.defaults.baseURL}/${filePath}`;
    const ext = filePath.split(".").pop().toLowerCase();

    if (isImageFile(filePath)) {
      setPreviewImage(fullUrl);
    } else {
      // For non-image files, open in new tab
      window.open(fullUrl, "_blank");
    }
  };

const filteredFollowUps = followUps.filter(
  (followUp) =>
    followUp.message?.toLowerCase().includes(searchQuery.toLowerCase())
);

if (is_view === 0) {
    return <ErrorPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-72 pt-13 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center">
            <MailCheck className="text-[#004b8f] size-8" />
            <h1 className="text-3xl font-bold text-[#004b8f] dark:text-white ml-2">
              FollowUp
            </h1>
          </div>
          {is_add === 1 && (
            <button
              onClick={() => router.push("/Add-Followup")}
              className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              <span className="font-semibold">Add FollowUp</span>
              <ArrowRight
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 border-2 border-[#004b8f]/20 rounded-2xl shadow-lg p-6 mb-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search Message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f] transition-all duration-200"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto shadow rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-[#004b8f] text-white">
              <tr>
                <th className="px-6 py-5 text-left text-sm font-semibold">
                  No
                </th>
                <th className="px-6 py-5 text-left text-sm font-semibold">
                  Message
                </th>
                <th className="px-6 py-5 text-left text-sm font-semibold">
                  Attachment
                </th>
                <th className="px-6 py-5 text-right text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {filteredFollowUps.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No follow-ups found
                  </td>
                </tr>
              ) : (
                filteredFollowUps.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={
                      idx % 2 === 0
                        ? "bg-white dark:bg-gray-900"
                        : "bg-gray-100 dark:bg-gray-800"
                    }
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">
                      {item.follow_up_number || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-pre-wrap break-words text-sm text-gray-800 dark:text-gray-100 max-w-xs">
                      {item.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.attachment ? (
                        <div
                          className="flex items-center gap-2 cursor-pointer hover:underline"
                          onClick={() => handleFileClick(item.attachment)}
                        >
                          {isImageFile(item.attachment) ? (
                            <img
                              src={`${api.defaults.baseURL}/${item.attachment}`}
                              alt="Attachment preview"
                              className="h-12 w-12 object-cover rounded"
                            />
                          ) : (
                            <>
                              {getFileIcon(item.attachment)}
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {item.attachment.split("/").pop()}
                              </span>
                            </>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">
                          None
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-4">
                      {is_update === 1 && (
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                      )}
                      {is_delete === 1 && (
                        <button
                          onClick={() => setConfirmDelete(item.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div className="max-w-4xl max-h-[90vh]">
              <img
                src={previewImage}
                alt="Full preview"
                className="max-w-full max-h-[90vh] object-contain"
              />
              <button
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg"
                onClick={() => setPreviewImage(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Dialog
          open={confirmDelete !== null}
          onClose={() => setConfirmDelete(null)}
          className="fixed z-50 inset-0 overflow-y-auto"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-lg flex items-center justify-center z-50">
            <Dialog.Panel className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-sm">
              <Dialog.Title className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Confirm Deletion
              </Dialog.Title>
              <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                Are you sure you want to delete this follow-up message?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  className="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
                  onClick={() => handleDelete(confirmDelete)}
                >
                  Delete
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
}
