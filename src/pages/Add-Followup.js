//Working code 27/06
import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, X, Save } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import ReactModalImage from "react-modal-image";
import api, {API_URL} from "@/utills/api";
import { toast } from "react-toastify";

export default function AddFollowUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const followUpId = searchParams.get("id");
  const [previewFile, setPreviewFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [existingAttachment, setExistingAttachment] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateError, setDuplicateError] = useState("");

  // Function to check for duplicate follow-up numbers
  const checkDuplicateFollowUp = useCallback(async (followUpNumber) => {
    if (!followUpNumber || followUpNumber.toString().trim() === "") {
      setDuplicateError("");
      return;
    }

    try {
      setIsCheckingDuplicate(true);
      setDuplicateError("");

      const response = await api.get("/nodesetup/followups", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_Token")}`,
        },
        params: {
          follow_up_number: followUpNumber
        }
      });

      const existingFollowUps = response.data?.data || response.data || [];
      
      const duplicate = existingFollowUps.find(
        (item) => 
          item.follow_up_number == followUpNumber && 
          (!followUpId || item.id != followUpId)
      );

      if (duplicate) {
        setDuplicateError(`Follow-up number ${followUpNumber} is already added. Please use a different number.`);
      } else {
        setDuplicateError("");
      }
    } catch (error) {
      console.error("Error checking duplicate:", error);
    } finally {
      setIsCheckingDuplicate(false);
    }
  }, [followUpId]);

  const formik = useFormik({
    initialValues: {
      followUpNumber: "",
      message: "",
      file: null,
    },
    validationSchema: Yup.object({
      followUpNumber: Yup.number()
        .typeError("Follow-up number must be a number")
        .positive("Follow-up number must be a positive integer")
        .required("Follow-up number is required"),
      message: Yup.string()
        .min(5, "Message must be at least 5 characters")
        .max(1000, "Message cannot exceed 1000 characters")
        .required("Message is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (duplicateError) {
        toast.error("Please fix the duplicate follow-up number error before submitting.");
        return;
      }

      try {
        setIsSubmitting(true);
        setSubmitError("");

        const formData = new FormData();
        formData.append("follow_up_number", values.followUpNumber);
        formData.append("message", values.message);

        if (values.file instanceof File) {
          formData.append("files", values.file);
        }

        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("access_Token")}`,
          },
        };

        if (followUpId) {
          await api.put(`/nodesetup/followups/${followUpId}`, formData, config);
          toast.success("Follow-up updated successfully! 💚");
        } else {
          await api.post("/nodesetup/followups", formData, config);
          toast.success("Follow-up added successfully! 😊");
        }

        resetForm();
        setPreviewFile(null);
        setDuplicateError("");
        router.push("/followup");
      } catch (error) {
        console.error("Submit error:", error);
        let errorMsg = "Failed to submit. Please try again.";

        if (error.response?.data?.message) {
          errorMsg = error.response.data.message;
          
          if (errorMsg.toLowerCase().includes("duplicate") || 
              errorMsg.toLowerCase().includes("already exists")) {
            setDuplicateError(errorMsg);
          }
        } else if (error.message) {
          errorMsg = error.message;
        }

        setSubmitError(errorMsg);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Debounced duplicate check
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formik.values.followUpNumber) {
        checkDuplicateFollowUp(formik.values.followUpNumber);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formik.values.followUpNumber, followUpId, checkDuplicateFollowUp]);

  useEffect(() => {
    if (followUpId) {
      const loadFollowUpData = async () => {
        try {
          setIsLoading(true);
          const response = await api.get(`/nodesetup/followups/${followUpId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_Token")}`,
            },
          });

          const data = response.data?.data || response.data;

          formik.setValues({
            followUpNumber: data.follow_up_number || "",
            message: data.message || "",
            file: null,
          });

          if (data.attachment) {
            setExistingAttachment(data.attachment);
          }
        } catch (err) {
          console.error("Error loading follow-up:", err);
          setSubmitError("Failed to load follow-up data");
        } finally {
          setIsLoading(false);
        }
      };

      loadFollowUpData();
    }
  }, [followUpId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileError("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
      "video/mp4",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setFileError(
        "Invalid file type. Only PDF, DOCX, XLS, XLSX, MP4, JPG, JPEG, PNG are allowed."
      );
      e.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      setFileError("File size exceeds 5MB limit");
      e.target.value = "";
      return;
    }

    let previewUrl = null;
    if (file.type.startsWith("image/")) {
      previewUrl = URL.createObjectURL(file);
    }

    setPreviewFile({
      file,
      url: previewUrl,
      id: Date.now() + Math.random(),
      type: file.type,
    });

    formik.setFieldValue("file", file);
    e.target.value = "";
  };

  const handleDeleteFile = () => {
    if (!previewFile) return;

    if (previewFile.url) {
      URL.revokeObjectURL(previewFile.url);
    }

    setPreviewFile(null);
    formik.setFieldValue("file", null);
  };

  useEffect(() => {
    return () => {
      if (previewFile?.url) {
        URL.revokeObjectURL(previewFile.url);
      }
    };
  }, [previewFile]);

  const getFileIcon = (fileType) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word")) return "📝";
    if (fileType.includes("excel")) return "📊";
    if (fileType.includes("video")) return "🎬";
    return "📁";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-6xl mx-auto py-10 flex justify-center items-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#004b8f]"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading follow-up data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=" min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-16 px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto py-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#004b8f] dark:text-white">
            {followUpId ? "Edit Follow-Up" : "Add Follow-Up"}
          </h1>
          <button
            onClick={() => router.push("/followup")}
            className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg group cursor-pointer"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform duration-300"
            />
            <span className="font-semibold">Back</span>
          </button>
        </div>

        {submitError && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{submitError}</p>
          </div>
        )}

        <form
          onSubmit={formik.handleSubmit}
          className="bg-white dark:bg-gray-800 border-2 border-[#004b8f]/20 rounded-2xl shadow-lg p-8 space-y-6"
        >
          <div>
            <label className="block mb-2 font-semibold text-sm text-gray-700 dark:text-gray-300">
              FollowUp No<span className='text-red-500'> *</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="followUpNumber"
                value={formik.values.followUpNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Enter followup number"
                className={`w-full px-4 py-3 rounded-xl border ${
                  duplicateError || (formik.touched.followUpNumber && formik.errors.followUpNumber)
                    ? ''
                    : 'border-gray-300 dark:border-gray-600 focus:ring-[#004b8f]'
                } bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2`}
                min="1"
              />
              {isCheckingDuplicate && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#004b8f]"></div>
                </div>
              )}
            </div>
            
            {formik.touched.followUpNumber && formik.errors.followUpNumber && (
              <p className="text-sm text-red-500 mt-1">
                {formik.errors.followUpNumber}
              </p>
            )}
            
            {duplicateError && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <span>⚠️</span>
                {duplicateError}
              </p>
            )}
            
            {isCheckingDuplicate && (
              <p className="text-sm text-blue-500 mt-1">
                Checking for duplicate...
              </p>
            )}
            
            {!duplicateError && 
             !isCheckingDuplicate && 
             formik.values.followUpNumber && 
             !formik.errors.followUpNumber && 
             formik.touched.followUpNumber && (
              <p className="text-sm text-green-500 mt-1 flex items-center gap-1">
                <span>✅</span>
                Follow-up number is available
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-semibold text-sm text-gray-700 dark:text-gray-300">
              Message / Notes<span className='text-red-500'> *</span>
            </label>
            <textarea
              name="message"
              rows="4"
              value={formik.values.message}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Write additional details..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#004b8f]"
            />
            {formik.touched.message && formik.errors.message && (
              <p className="text-sm text-red-500 mt-1">
                {formik.errors.message}
              </p>
            )}
          </div>

          {existingAttachment && (
            <div>
              <label className="block mb-2 font-semibold text-sm text-gray-700 dark:text-gray-300">
                Existing Attachment
              </label>
              <div className="relative border border-gray-200 dark:border-gray-600 rounded-lg p-2 w-fit">
                {existingAttachment.match(/\.(jpe?g|png)$/i) ? (
                  <ReactModalImage
                    small={`${
                      process.env.NEXT_PUBLIC_API_URL ||
                      API_URL
                    }/${existingAttachment}`}
                    large={`${
                      process.env.NEXT_PUBLIC_API_URL ||
                      API_URL
                    }/${existingAttachment}`}
                    alt="Existing attachment"
                    className="h-20 w-32 object-cover rounded-md"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-20 w-32">
                    <div className="text-3xl">
                      {getFileIcon(existingAttachment.split(".").pop())}
                    </div>
                    <a
                      href={`${
                        process.env.NEXT_PUBLIC_API_URL ||
                        API_URL
                      }/${existingAttachment}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs mt-1 underline text-blue-600 dark:text-blue-300 truncate max-w-full"
                    >
                      {existingAttachment.split("/").pop()}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block mb-2 font-semibold text-sm text-gray-700 dark:text-gray-300">
              {followUpId ? "Replace File" : "Upload File"} (PDF, DOCX, XLS,
              XLSX, MP4, JPG, PNG - max 5MB)
            </label>
            <input
              type="file"
              name="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.mp4,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-[#004b8f] file:text-white
                hover:file:bg-[#003d73]"
            />
            {fileError && (
              <div className="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded">
                {fileError}
              </div>
            )}
          </div>

          {previewFile && (
            <div className="max-w-full">
              <label className="block mb-2 font-semibold text-sm text-gray-700 dark:text-gray-300">
                File to Upload:
              </label>
              <div className="relative group w-32">
                <button
                  type="button"
                  onClick={handleDeleteFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                  aria-label="Remove file"
                >
                  <X size={14} />
                </button>

                {previewFile.url && previewFile.type.startsWith("image/") ? (
                  <div className="h-20 w-32 border border-gray-200 rounded-md overflow-hidden">
                    <ReactModalImage
                      small={previewFile.url}
                      large={previewFile.url}
                      alt={`Preview ${previewFile.file.name}`}
                      hideDownload={true}
                      hideZoom={true}
                      className="object-cover h-full w-full"
                    />
                  </div>
                ) : (
                  <div
                    onClick={() =>
                      window.open(URL.createObjectURL(previewFile.file), "_blank")
                    }
                    className="flex flex-col items-center justify-center h-20 w-32 border border-gray-200 rounded-md p-2 cursor-pointer hover:shadow-lg transition"
                  >
                    <div className="text-3xl">{getFileIcon(previewFile.type)}</div>
                  </div>
                )}

                <p className="text-xs mt-1 truncate max-w-xs">{previewFile.file.name}</p>
              </div>
            </div>
          )}

           <div className='space-y-4'>
             <p className='text-sm text-gray-500 dark:text-gray-400 '>
               ➡️ All fields marked with
               <span className='text-red-500'> *</span> are mandatory.
             </p>
             </div>

          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={isSubmitting || !formik.isValid || duplicateError || isCheckingDuplicate}
              className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="font-semibold">
                {isSubmitting ? (
                  <span className="inline-flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : followUpId ? (
                  "Update"
                ) : (
                  "Save"
                )}
              </span>
              {!isSubmitting && <Save size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}