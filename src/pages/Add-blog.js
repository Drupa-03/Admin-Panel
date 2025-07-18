// import React, { useEffect, useState, useCallback, useRef } from "react";
// import { useRouter } from "next/router";
// import { ArrowLeft, PlusCircle, Save } from "lucide-react";
// import api, { API_URL } from "@/utills/api";
// import { toast } from "react-toastify";
// import ReactModalImage from "react-modal-image";
// import { useFormik } from "formik";
// import * as Yup from "yup";

// export default function AddBlogPage() {
//   const router = useRouter();
//   const editId = router.query.id || null;

//   // Form state
//   const [metaImagePreview, setMetaImagePreview] = useState(null);
//   const sectionRefs = useRef([]);

//   // Image validation constants
//   const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
//   const VALID_IMAGE_TYPES = [
//     "image/jpeg",
//     "image/png",
//     "image/webp",
//     "image/avif",
//   ];

//   const checkSlugExists = async (slug) => {
//     try {
//       const blogsRes = await api.get("/nodesetup/meta_blog");
//       const existingSlugs =
//         blogsRes.data?.data?.map((blog) => blog.slug_title) || [];
//       return existingSlugs.includes(slug);
//     } catch (error) {
//       console.error("Error checking slug:", error);
//       return false; // Assume it's available if there's an error
//     }
//   };

//   // Validation schema
//   const validationSchema = Yup.object({
// slug_title: Yup.string()
//   .matches(/^[a-z\s-]+$/, "Only lowercase letters, spaces and hyphens are allowed")
//   .trim()
//   .required("Slug Title is required")
//   .test(
//     "unique-slug",
//     "This slug title already exists",
//     async function (value) {
//       if (!value) return true;

//       const normalizedSlug = value.trim().toLowerCase().replace(/\s+/g, "-");

//       // Skip check if we're editing and slug hasn't changed
//       if (editId && normalizedSlug === this.parent.originalSlug) {
//         return true;
//       }

//       try {
//         const blogsRes = await api.get("/nodesetup/meta_blog");
//         const existingSlugs =
//           blogsRes.data?.data
//             ?.filter((blog) => blog.id !== editId)
//             ?.map((blog) => blog.slug_title) || [];

//         return !existingSlugs.includes(normalizedSlug);
//       } catch (error) {
//         console.error("Error checking slug:", error);
//         return true; // Assume valid on error
//       }
//     }
//   ),

//     meta_title: Yup.string()
//       .matches(/^[^\d]*$/, "Numbers are not allowed in Meta Title")
//       .trim()
//       .required("Meta Title is required"),
//     blog_title: Yup.string()
//       .matches(/^[^\d]*$/, "Numbers are not allowed in Blog Title")
//       .trim()
//       .required("Blog Title is required"),
//     meta_description: Yup.string()
//       .trim()
//       .required("Meta Description is required")
//       .min(100, "Meta Description must be at least 100 characters")
//       .max(134, "Meta Description must be 134 characters or less"),
//     meta_image: Yup.mixed().when("meta_image_preview", {
//       is: (preview) => !preview && !editId,
//       then: (schema) =>
//         schema
//           .required("Image is required")
//           .test("fileSize", "File size must be less than 5MB", (value) =>
//             value ? value.size <= MAX_FILE_SIZE : true
//           )
//           .test(
//             "fileType",
//             "Only JPG, PNG, WEBP, or AVIF files are allowed",
//             (value) =>
//               value
//                 ? VALID_IMAGE_TYPES.includes(value.type) &&
//                   !value.name.toLowerCase().endsWith(".jfif")
//                 : true
//           ),
//       otherwise: (schema) => schema.notRequired(),
//     }),
//     contentSections: Yup.array()
//       .min(1, "At least one content section is required")
//       .of(
//         Yup.object().shape({
//           image: Yup.mixed().when("imagePreview", {
//             is: (preview) => !preview && !editId,
//             then: (schema) =>
//               schema
//                 .required("Image is required")
//                 .test("fileSize", "File size must be less than 5MB", (value) =>
//                   value ? value.size <= MAX_FILE_SIZE : true
//                 )
//                 .test(
//                   "fileType",
//                   "Only JPG, PNG, WEBP, or AVIF files are allowed",
//                   (value) =>
//                     value
//                       ? VALID_IMAGE_TYPES.includes(value.type) &&
//                         !value.name.toLowerCase().endsWith(".jfif")
//                       : true
//                 ),
//             otherwise: (schema) => schema.notRequired(),
//           }),
//           content: Yup.array()
//             .min(1, "At least one content item is required")
//             .of(
//               Yup.object().shape({
//                 title: Yup.string()
//                   .trim()
//                   .matches(/^[^\d]*$/, "Numbers are not allowed in Title")
//                   .when("isFirstItem", {
//                     is: true,
//                     then: (schema) =>
//                       schema.required(
//                         "Title is required for the first content item"
//                       ),
//                     otherwise: (schema) => schema.notRequired(),
//                   }),
//                 description: Yup.string()
//                   .trim()
//                   .when("isFirstItem", {
//                     is: true,
//                     then: (schema) =>
//                       schema.required(
//                         "Description is required for the first content item"
//                       ),
//                     otherwise: (schema) => schema.notRequired(),
//                   }),
//                 isFirstItem: Yup.boolean(),
//               })
//             ),
//           points: Yup.array().of(
//             Yup.object().shape({
//               title: Yup.string()
//                 .trim()
//                 .matches(/^[^\d]*$/, "Numbers are not allowed in Point Title")
//                 .notRequired(),
//               description: Yup.string().trim().notRequired(),
//             })
//           ),
//         })
//       ),
//   });

//   const getSectionWordCount = (section) => {
//     let totalText = "";

//     // Add content titles and descriptions
//     section.content.forEach((item) => {
//       totalText += ` ${item.title || ""} ${item.description || ""}`;
//     });

//     // Add points titles and descriptions (if any)
//     if (section.points) {
//       section.points.forEach((point) => {
//         totalText += ` ${point.title || ""} ${point.description || ""}`;
//       });
//     }

//     return totalText.trim().split(/\s+/).filter(Boolean).length;
//   };

//   // Formik initialization
//   const formik = useFormik({
//     enableReinitialize: true,
//     initialValues: {
//       slug_title: "",

//       meta_title: "",
//       blog_title: "",
//       originalSlug: "",
//       meta_description: "",
//       meta_image: null,
//       meta_image_preview: null,
//       contentSections: [
//         {
//           image: null,
//           imagePreview: null,
//           content: [{ title: "", description: "", isFirstItem: true }],
//           showPoints: false,
//           points: [],
//         },
//       ],
//     },
//     validationSchema,
//     validateOnBlur: true,

//     onSubmit: async (values, { setErrors }) => {
//       const totalWords = values.contentSections.reduce((sum, section) => {
//         return sum + getSectionWordCount(section);
//       }, 0);

//       if (totalWords < 350) {
//         toast.error(
//           `Total blog content must be at least 350 words (currently ${totalWords})`
//         );
//         return;
//       }

//       await handleSubmit(values);
//     },
//   });

//   useEffect(() => {
//     console.log("values =>> ", formik?.values);
//     console.log("errors =>> ", formik?.errors);
//   }, [formik]);

//   // Load data if in edit mode
//   useEffect(() => {
//     if (!router.isReady || !editId) return;

//     const loadBlogData = async () => {
//       try {
//         const res = await api.get(`/nodesetup/meta_blog/${editId}`);
//         const blog = res.data?.data;
//         if (!blog) return;

//         const parsedSections = blog.trnData.map((section, index) => ({
//           image: null,
//           // Prefix content_img with API_URL for correct preview
//           imagePreview: section.content_img
//             ? `${API_URL}/meta_blogs/${section.content_img}`
//             : null,
//           content: Array.isArray(section.content_description)
//             ? section.content_description.map((c, idx) => ({
//                 title: c.sub_title || "",
//                 description: c.description || "",
//                 isFirstItem: idx === 0,
//               }))
//             : [{ title: "", description: "", isFirstItem: true }],
//           showPoints: section.content_points?.length > 0,
//           points: Array.isArray(section.content_points)
//             ? section.content_points.map((p) => ({
//                 title: p.sub_title?.title || "",
//                 description: p.sub_title?.description || "",
//               }))
//             : [],
//         }));

//         formik.setValues({
//           slug_title: blog.slug_title || "",
//           originalSlug: blog.slug_title || "",
//           meta_title: blog.meta_title || "",
//           blog_title: blog.blog_title || "",
//           meta_description: blog.meta_description || "",
//           meta_image: null,
//           meta_image_preview: blog.title_image
//             ? `${API_URL}/meta_blogs/${blog.title_image}`
//             : null,
//           contentSections: parsedSections,
//         });

//         if (blog.title_image) {
//           setMetaImagePreview(`${API_URL}/meta_blogs/${blog.title_image}`);
//         }
//       } catch (error) {
//         console.error("Error loading blog data:", error);
//         toast.error("Failed to load blog data");
//       }
//     };

//     loadBlogData();
//   }, [editId, router.isReady]);

//   // Optimized handleMetaImageChange
//   const handleMetaImageChange = useCallback(
//     (e) => {
//       const file = e.target.files[0];
//       if (!file) return;

//       if (file.size > MAX_FILE_SIZE) {
//         toast.error("File size must be less than 5MB");
//         return;
//       }
//       if (
//         !VALID_IMAGE_TYPES.includes(file.type) ||
//         file.name.toLowerCase().endsWith(".jfif")
//       ) {
//         toast.error(
//           "Only JPG, PNG, WEBP, or AVIF files are allowed. JFIF is not supported."
//         );
//         return;
//       }

//       formik.setFieldValue("meta_image", file);
//       const previewUrl = URL.createObjectURL(file);
//       formik.setFieldValue("meta_image_preview", previewUrl);
//       setMetaImagePreview(previewUrl);
//     },
//     [formik]
//   );

//   // Optimized form submission
//   const handleSubmit = useCallback(
//     async (values) => {
//       try {
//         const formData = new FormData();
//         formData.append("slug_title", values.slug_title);
//         formData.append("meta_title", values.meta_title);
//         formData.append("meta_description", values.meta_description);
//         formData.append("blog_title", values.blog_title);
//         formData.append("status", "1");

//         if (values.meta_image) {
//           formData.append("title_image", values.meta_image);
//         }

//         const trnData = values.contentSections.map((section, index) => {
//           if (section.image) {
//             formData.append(`content_img[${index}]`, section.image);
//           }

//           return {
//             content_img: section.image?.name || "", // Only send filename if new image is uploaded
//             content_description: section.content.map((item) => ({
//               sub_title: item.title || "",
//               description: item.description || "",
//             })),
//             content_points: section.showPoints
//               ? section.points.map((pt) => ({
//                   sub_title: {
//                     title: pt.title || "",
//                     description: pt.description || "",
//                   },
//                 }))
//               : [],
//           };
//         });

//         formData.append("trnData", JSON.stringify(trnData));

//         // Log FormData contents for debugging
//         for (let [key, value] of formData.entries()) {
//           console.log(`FormData: ${key} =`, value);
//         }
//         console.log("trnData JSON:", JSON.stringify(trnData, null, 2));

//         const res = await (editId
//           ? api.put(`/nodesetup/meta_blog/${editId}`, formData, {
//               headers: { "Content-Type": "multipart/form-data" },
//             })
//           : api.post(`/nodesetup/meta_blog`, formData, {
//               headers: { "Content-Type": "multipart/form-data" },
//             }));

//         if (res.data.status === 200) {
//           toast.success(editId ? "Blog updated" : "Blog created");
//           router.push("/blogs");
//         } else {
//           toast.warning(res.data.message || "Something went wrong");
//         }
//       } catch (err) {
//         console.error("Submission error:", err);
//         if (err.response) {
//           console.error("Server response:", err.response.data);
//           toast.error(
//             err.response.data.message || "Submission failed: Bad request"
//           );
//         } else {
//           toast.error("Submission failed: Network error");
//         }
//       }
//     },
//     [editId, router]
//   );

//   // Section management functions
//   const addContentSection = useCallback(() => {
//     formik.setFieldValue("contentSections", [
//       ...formik.values.contentSections,
//       {
//         image: null,
//         imagePreview: null,
//         content: [{ title: "", description: "", isFirstItem: true }],
//         showPoints: false,
//         points: [],
//       },
//     ]);
//     setTimeout(() => {
//       const lastSectionIndex = formik.values.contentSections.length;
//       const lastSectionRef = sectionRefs.current[lastSectionIndex];
//       if (lastSectionRef) {
//         lastSectionRef.scrollIntoView({ behavior: "smooth", block: "start" });
//       }
//     }, 0);
//   }, [formik]);

//   const removeSection = useCallback(
//     (sectionIndex) => {
//       if (formik.values.contentSections.length === 1) {
//         toast.error("At least one section is required");
//         return;
//       }
//       formik.setFieldValue(
//         "contentSections",
//         formik.values.contentSections.filter(
//           (_, index) => index !== sectionIndex
//         )
//       );
//     },
//     [formik]
//   );

//   const addContentItem = useCallback(
//     (sectionIndex) => {
//       const newSections = [...formik.values.contentSections];
//       newSections[sectionIndex].content.push({
//         title: "",
//         description: "",
//         isFirstItem: false,
//       });
//       formik.setFieldValue("contentSections", newSections);
//     },
//     [formik]
//   );

//   const removeContentItem = useCallback(
//     (sectionIndex, contentIndex) => {
//       if (
//         sectionIndex === 0 &&
//         contentIndex === 0 &&
//         formik.values.contentSections[0].content.length === 1
//       ) {
//         toast.error("First section must have at least one content item");
//         return;
//       }
//       const newSections = [...formik.values.contentSections];
//       newSections[sectionIndex].content = newSections[
//         sectionIndex
//       ].content.filter((_, index) => index !== contentIndex);
//       formik.setFieldValue("contentSections", newSections);
//     },
//     [formik]
//   );

//   const addPoint = useCallback(
//     (sectionIndex) => {
//       const newSections = [...formik.values.contentSections];
//       newSections[sectionIndex].points.push({ title: "", description: "" });
//       formik.setFieldValue("contentSections", newSections);
//     },
//     [formik]
//   );

//   const removePoint = useCallback(
//     (sectionIndex, pointIndex) => {
//       const newSections = [...formik.values.contentSections];
//       newSections[sectionIndex].points = newSections[
//         sectionIndex
//       ].points.filter((_, index) => index !== pointIndex);
//       formik.setFieldValue("contentSections", newSections);
//     },
//     [formik]
//   );

//   const showPointSection = useCallback(
//     (sectionIndex) => {
//       const newSections = [...formik.values.contentSections];
//       newSections[sectionIndex].showPoints = true;
//       newSections[sectionIndex].points = [{ title: "", description: "" }];
//       formik.setFieldValue("contentSections", newSections);
//     },
//     [formik]
//   );

//   const handleSectionImageChange = useCallback(
//     (e, sectionIndex) => {
//       const file = e.target.files[0];
//       if (!file) return;

//       if (file.size > MAX_FILE_SIZE) {
//         toast.error("File size must be less than 5MB");
//         return;
//       }
//       if (
//         !VALID_IMAGE_TYPES.includes(file.type) ||
//         file.name.toLowerCase().endsWith(".jfif")
//       ) {
//         toast.error(
//           "Only JPG, PNG, WEBP, or AVIF files are allowed. JFIF is not supported."
//         );
//         return;
//       }

//       const newSections = [...formik.values.contentSections];
//       newSections[sectionIndex].image = file;
//       newSections[sectionIndex].imagePreview = URL.createObjectURL(file);
//       formik.setFieldValue("contentSections", newSections);
//     },
//     [formik]
//   );

//   const handleContentChange = useCallback(
//     (e, sectionIndex, contentIndex, field) => {
//       const newSections = [...formik.values.contentSections];
//       newSections[sectionIndex].content[contentIndex][field] = e.target.value;
//       formik.setFieldValue("contentSections", newSections);
//     },
//     [formik]
//   );

//   const handlePointChange = useCallback(
//     (e, sectionIndex, pointIndex, field) => {
//       const newSections = [...formik.values.contentSections];
//       newSections[sectionIndex].points[pointIndex][field] = e.target.value;
//       formik.setFieldValue("contentSections", newSections);
//     },
//     [formik]
//   );

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-12 px-4 sm:px-6 md:px-8">
//       <div className="max-w-6xl pl-4 mx-auto py-10">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-3xl font-bold text-blue-900 dark:text-white">
//             {editId ? "Edit Blog" : "Add Blog"}
//           </h2>
//           <button
//             onClick={() => router.push("/blogs")}
//             className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg group cursor-pointer"
//           >
//             <ArrowLeft
//               size={18}
//               className="group-hover:-translate-x-1 transition-transform duration-300"
//             />
//             <span className="font-semibold">Back</span>
//           </button>
//         </div>
 
//  <div className='bg-white dark:bg-gray-800 border-2 border-[#004b8f]/20 rounded-2xl shadow-lg p-8 space-y-6'>
//         <form onSubmit={formik.handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className="mb-4">
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                 Slug Title <span className="text-red-500">*</span>
//               </label>
//               <input
//                 name="slug_title"
//                 value={formik.values.slug_title}
//                 onChange={formik.handleChange}
//                 onBlur={formik.handleBlur}
//                 className="w-full p-3 rounded-lg dark:bg-gray-700 border-2 border-gray-300"
//                 placeholder="Slug Title"
//               />
//               {formik.touched.slug_title && formik.errors.slug_title && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {formik.errors.slug_title}
//                 </p>
//               )}
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                 Meta Title <span className="text-red-500">*</span>
//               </label>
//               <input
//                 name="meta_title"
//                 value={formik.values.meta_title}
//                 onChange={formik.handleChange}
//                 onBlur={formik.handleBlur}
//                 className="w-full p-3 rounded-lg dark:bg-gray-700 border-2 border-gray-300"
//                 placeholder="Meta Title"
//               />
//               {formik.touched.meta_title && formik.errors.meta_title && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {formik.errors.meta_title}
//                 </p>
//               )}
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                 Blog Title <span className="text-red-500">*</span>
//               </label>
//               <input
//                 name="blog_title"
//                 value={formik.values.blog_title}
//                 onChange={formik.handleChange}
//                 onBlur={formik.handleBlur}
//                 className="w-full p-3 rounded-lg dark:bg-gray-700 border-2 border-gray-300"
//                 placeholder="Blog Title"
//               />
//               {formik.touched.blog_title && formik.errors.blog_title && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {formik.errors.blog_title}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="gap-4">
//             <div className="flex flex-col">
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                 Meta Description <span className="text-red-500">*</span>
//               </label>
//               <textarea
//                 placeholder="Meta Description"
//                 name="meta_description"
//                 value={formik.values.meta_description}
//                 onChange={formik.handleChange}
//                 onBlur={formik.handleBlur}
//                 rows={2}
//                 className="w-full p-3 rounded-lg dark:bg-gray-700 border-2 border-gray-300 text-sm"
//               />
//               {formik.touched.meta_description &&
//                 formik.errors.meta_description && (
//                   <p className="text-red-500 text-sm mt-1">
//                     {formik.errors.meta_description}
//                   </p>
//                 )}
//               <div className="flex justify-between">
//                 <p className="text-sm text-red-500">
//                   Description must be 100 to 134 character long
//                 </p>
//                 <p
//                   className={`text-sm mt-1 italic text-gray-700 dark:text-white ${
//                     formik.values.meta_description.length < 100 ||
//                     formik.values.meta_description.length > 134
//                   }`}
//                 >
//                   Total character count: {formik.values.meta_description.length} /
//                   134 characters
//                 </p>
//               </div>
//             </div>

//             <div className="flex flex-col mt-8">
//               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                 Image <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="file"
//                 name="meta_image"
//                 onChange={handleMetaImageChange}
//                 className="p-3 border rounded-lg border-gray-300 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
//               />
//               <span className="text-red-500">
//                 Image dimensions required: 740 x 500
//               </span>
//               {formik.touched.meta_image && formik.errors.meta_image && (
//                 <p className="text-red-500 text-sm mt-1">
//                   {formik.errors.meta_image}
//                 </p>
//               )}
//               {metaImagePreview && (
//                 <ReactModalImage
//                   small={metaImagePreview}
//                   large={metaImagePreview}
//                   alt="Meta Preview"
//                   className="w-32 h-32 object-cover rounded-lg border mt-2 self-start"
//                 />
//               )}
//             </div>
//           </div>

//           {formik.values.contentSections.map((section, sectionIndex) => (
//             <div
//               key={sectionIndex}
//               ref={(el) => (sectionRefs.current[sectionIndex] = el)}
//               className="bg-white p-6 rounded-xl shadow-md mb-6 relative mt-8 dark:bg-gray-700"
//             >
//               <h3 className="font-bold text-lg text-gray-700 mb-4">
//                 Section {sectionIndex + 1}
//               </h3>

//               {sectionIndex > 0 && (
//                 <button
//                   type="button"
//                   onClick={() => removeSection(sectionIndex)}
//                   className="absolute top-4 right-4 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer duration-300"
//                 >
//                   Remove
//                 </button>
//               )}

//               <div className="flex flex-col md:items-start gap-4 dark:bg-gray-700">
//                 <div className="w-full">
//                   <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                     Image <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="file"
//                     onChange={(e) => handleSectionImageChange(e, sectionIndex)}
//                     className="w-full p-3 rounded-lg border-2 border-gray-300"
//                   />
//                   <span className="text-red-500">
//                     Image dimensions required: 740 x 500
//                   </span>
//                   {formik.touched.contentSections?.[sectionIndex]?.image &&
//                     formik.errors.contentSections?.[sectionIndex]?.image && (
//                       <p className="text-red-500 text-sm mt-1">
//                         {formik.errors.contentSections[sectionIndex].image}
//                       </p>
//                     )}
//                 </div>
//                 {section.imagePreview && (
//                   <ReactModalImage
//                     small={section.imagePreview}
//                     large={section.imagePreview}
//                     alt={`Section ${sectionIndex + 1} Preview`}
//                     className="w-32 h-32 rounded-lg border"
//                   />
//                 )}
//               </div>

//               {section.content.map((item, contentIndex) => (
//                 <div
//                   key={contentIndex}
//                   className="relative p-4 border border-gray-200 rounded-lg my-4 bg-gray-50 dark:bg-gray-700"
//                 >
//                   {contentIndex > 0 && (
//                     <button
//                       type="button"
//                       onClick={() =>
//                         removeContentItem(sectionIndex, contentIndex)
//                       }
//                       className="absolute top-3 right-3 text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
//                       title="Remove this item"
//                     >
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-5 w-5"
//                         viewBox="0 0 20 20"
//                         fill="currentColor"
//                       >
//                         <path
//                           fillRule="evenodd"
//                           d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     </button>
//                   )}

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-1">
//                       <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                         Title{" "}
//                         {item.isFirstItem && (
//                           <span className="text-red-500">*</span>
//                         )}
//                       </label>
//                       <input
//                         placeholder="Enter title"
//                         value={item.title}
//                         onChange={(e) =>
//                           handleContentChange(
//                             e,
//                             sectionIndex,
//                             contentIndex,
//                             "title"
//                           )
//                         }
//                         onBlur={() =>
//                           formik.setFieldTouched(
//                             `contentSections[${sectionIndex}].content[${contentIndex}].title`,
//                             true
//                           )
//                         }
//                         className="w-full p-2.5 border border-gray-300 rounded-md focus:border-transparent"
//                       />
//                       {formik.touched.contentSections?.[sectionIndex]
//                         ?.content?.[contentIndex]?.title &&
//                         formik.errors.contentSections?.[sectionIndex]
//                           ?.content?.[contentIndex]?.title && (
//                           <p className="text-red-500 text-sm mt-1">
//                             {
//                               formik.errors.contentSections[sectionIndex]
//                                 .content[contentIndex].title
//                             }
//                           </p>
//                         )}
//                     </div>

//                     <div className="space-y-1">
//                       <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
//                         Description{" "}
//                         {item.isFirstItem && (
//                           <span className="text-red-500">*</span>
//                         )}
//                       </label>
//                       <textarea
//                         placeholder="Enter description"
//                         value={item.description}
//                         onChange={(e) =>
//                           handleContentChange(
//                             e,
//                             sectionIndex,
//                             contentIndex,
//                             "description"
//                           )
//                         }
//                         onBlur={() =>
//                           formik.setFieldTouched(
//                             `contentSections[${sectionIndex}].content[${contentIndex}].description`,
//                             true
//                           )
//                         }
//                         rows={3}
//                         className="w-full p-2.5 border border-gray-300 rounded-md resize-y focus:border-transparent"
//                       />
//                       {formik.touched.contentSections?.[sectionIndex]
//                         ?.content?.[contentIndex]?.description &&
//                         formik.errors.contentSections?.[sectionIndex]
//                           ?.content?.[contentIndex]?.description && (
//                           <p className="text-red-500 text-sm mt-1">
//                             {
//                               formik.errors.contentSections[sectionIndex]
//                                 .content[contentIndex].description
//                             }
//                           </p>
//                         )}
//                     </div>
//                   </div>
//                 </div>
//               ))}

//               <button
//                 type="button"
//                 onClick={() => addContentItem(sectionIndex)}
//                 className="text-blue-600 hover:underline flex items-center gap-1"
//               >
//                 <PlusCircle size={18} />
//                 Add Title/Description
//               </button>

//               {!section.showPoints ? (
//                 <button
//                   type="button"
//                   onClick={() => showPointSection(sectionIndex)}
//                   className="text-blue-600 hover:underline flex items-center gap-1 mt-4"
//                 >
//                   <PlusCircle size={18} />
//                   Add Points
//                 </button>
//               ) : (
//                 <>
//                   <h4 className="text-md font-semibold mt-4 mb-2">Points</h4>
//                   {section.points.map((item, pointIndex) => (
//                     <div
//                       key={pointIndex}
//                       className="relative p-4 border border-gray-200 rounded-lg my-4 bg-gray-50"
//                     >
//                       <div className="flex items-center justify-between mb-2">
//                         <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
//                           Point Title {pointIndex + 1}
//                         </label>
//                         <button
//                           type="button"
//                           onClick={() => removePoint(sectionIndex, pointIndex)}
//                           className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
//                           title="Remove this point"
//                         >
//                           <svg
//                             xmlns="http://www.w3.org/2000/svg"
//                             className="h-5 w-5"
//                             viewBox="0 0 20 20"
//                             fill="currentColor"
//                           >
//                             <path
//                               fillRule="evenodd"
//                               d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
//                               clipRule="evenodd"
//                             />
//                           </svg>
//                         </button>
//                       </div>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <input
//                             placeholder={`Point Title ${pointIndex + 1}`}
//                             value={item.title}
//                             onChange={(e) =>
//                               handlePointChange(
//                                 e,
//                                 sectionIndex,
//                                 pointIndex,
//                                 "title"
//                               )
//                             }
//                             onBlur={() =>
//                               formik.setFieldTouched(
//                                 `contentSections[${sectionIndex}].points[${pointIndex}].title`,
//                                 true
//                               )
//                             }
//                             className="w-full p-2 border-2 border-gray-300 h-12 rounded-md"
//                           />
//                           {formik.touched.contentSections?.[sectionIndex]
//                             ?.points?.[pointIndex]?.title &&
//                             formik.errors.contentSections?.[sectionIndex]
//                               ?.points?.[pointIndex]?.title && (
//                               <p className="text-red-500 text-sm mt-1">
//                                 {
//                                   formik.errors.contentSections[sectionIndex]
//                                     .points[pointIndex].title
//                                 }
//                               </p>
//                             )}
//                         </div>
//                         <textarea
//                           placeholder={`Point Description ${pointIndex + 1}`}
//                           value={item.description}
//                           onChange={(e) =>
//                             handlePointChange(
//                               e,
//                               sectionIndex,
//                               pointIndex,
//                               "description"
//                             )
//                           }
//                           rows={3}
//                           className="w-full p-3 border-2 border-gray-300 rounded-md"
//                         />
//                       </div>
//                     </div>
//                   ))}
//                   <button
//                     type="button"
//                     onClick={() => addPoint(sectionIndex)}
//                     className="text-blue-600 hover:underline flex items-center gap-1 mt-2"
//                   >
//                     <PlusCircle size={18} />
//                     Add Point
//                   </button>
//                 </>
//               )}
//             </div>
//           ))}

//           <button
//             type="button"
//             onClick={addContentSection}
//             className="text-blue-800 hover:underline flex items-center gap-2 mb-4"
//           >
//             <PlusCircle size={18} />
//             Add Section
//           </button>

//           <div className="text-right text-sm text-gray-700 italic dark:text-white">
//             Total Word Count:{" "}
//             {formik.values.contentSections.reduce(
//               (sum, section) => sum + getSectionWordCount(section),
//               0
//             )}{" "}
//             / 350 minimum
//           </div>

//           <button
//             type="submit"
//             disabled={formik.isSubmitting}
//             className="flex items-center mx-auto gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg hover:shadow-xl group cursor-pointer"
//           >
//             {editId ? "Update" : "Save"}
//             <Save size={18} />
//           </button>
//         </form>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, PlusCircle, Save } from "lucide-react";
import api, { API_URL } from "@/utills/api";
import { toast } from "react-toastify";
import ReactModalImage from "react-modal-image";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function AddBlogPage() {
  const router = useRouter();
  const editId = router.query.id || null;

  // Form state
  const [metaImagePreview, setMetaImagePreview] = useState(null);
  const sectionRefs = useRef([]);
  const previewUrlsRef = useRef([]); // Store object URLs for cleanup

  // Image validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

  // Clean up object URLs on component unmount or when new URLs are set
  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
      previewUrlsRef.current = [];
      setMetaImagePreview(null);
    };
  }, []);

  const checkSlugExists = async (slug) => {
    try {
      const blogsRes = await api.get("/nodesetup/meta_blog");
      const existingSlugs = blogsRes.data?.data?.map((blog) => blog.slug_title) || [];
      return existingSlugs.includes(slug);
    } catch (error) {
      console.error("Error checking slug:", error);
      return false; // Assume it's available if there's an error
    }
  };

  // Validation schema
  const validationSchema = Yup.object({
    slug_title: Yup.string()
      .matches(/^[a-z\s-]+$/, "Only lowercase letters, spaces, and hyphens are allowed")
      .trim()
      .required("Slug Title is required")
      .test("unique-slug", "This slug title already exists", async function (value) {
        if (!value) return true;

        const normalizedSlug = value.trim().toLowerCase().replace(/\s+/g, "-");

        // Skip check if we're editing and slug hasn't changed
        if (editId && normalizedSlug === this.parent.originalSlug) {
          return true;
        }

        try {
          const blogsRes = await api.get("/nodesetup/meta_blog");
          const existingSlugs = blogsRes.data?.data
            ?.filter((blog) => blog.id !== editId)
            ?.map((blog) => blog.slug_title) || [];
          return !existingSlugs.includes(normalizedSlug);
        } catch (error) {
          console.error("Error checking slug:", error);
          return true; // Assume valid on error
        }
      }),
    meta_title: Yup.string()
      .matches(/^[^\d]*$/, "Numbers are not allowed in Meta Title")
      .trim()
      .required("Meta Title is required"),
    blog_title: Yup.string()
      .matches(/^[^\d]*$/, "Numbers are not allowed in Blog Title")
      .trim()
      .required("Blog Title is required"),
    meta_description: Yup.string()
      .trim()
      .required("Meta Description is required")
      .min(100, "Meta Description must be at least 100 characters")
      .max(134, "Meta Description must be 134 characters or less"),
    meta_image: Yup.mixed().when("meta_image_preview", {
      is: (preview) => !preview && !editId,
      then: (schema) =>
        schema
          .required("Image is required")
          .test("fileSize", "File size must be less than 5MB", (value) =>
            value ? value.size <= MAX_FILE_SIZE : true
          )
          .test(
            "fileType",
            "Only JPG, PNG, WEBP, or AVIF files are allowed",
            (value) =>
              value ? VALID_IMAGE_TYPES.includes(value.type) && !value.name.toLowerCase().endsWith(".jfif") : true
          ),
      otherwise: (schema) => schema.notRequired(),
    }),
    contentSections: Yup.array()
      .min(1, "At least one content section is required")
      .of(
        Yup.object().shape({
          image: Yup.mixed().when("imagePreview", {
            is: (preview) => !preview && !editId,
            then: (schema) =>
              schema
                .required("Image is required")
                .test("fileSize", "File size must be less than 5MB", (value) =>
                  value ? value.size <= MAX_FILE_SIZE : true
                )
                .test(
                  "fileType",
                  "Only JPG, PNG, WEBP, or AVIF files are allowed",
                  (value) =>
                    value ? VALID_IMAGE_TYPES.includes(value.type) && !value.name.toLowerCase().endsWith(".jfif") : true
                ),
            otherwise: (schema) => schema.notRequired(),
          }),
          content: Yup.array()
            .min(1, "At least one content item is required")
            .of(
              Yup.object().shape({
                title: Yup.string()
                  .trim()
                  .matches(/^[^\d]*$/, "Numbers are not allowed in Title")
                  .when("isFirstItem", {
                    is: true,
                    then: (schema) => schema.required("Title is required for the first content item"),
                    otherwise: (schema) => schema.notRequired(),
                  }),
                description: Yup.string()
                  .trim()
                  .when("isFirstItem", {
                    is: true,
                    then: (schema) => schema.required("Description is required for the first content item"),
                    otherwise: (schema) => schema.notRequired(),
                  }),
                isFirstItem: Yup.boolean(),
              })
            ),
          points: Yup.array().of(
            Yup.object().shape({
              title: Yup.string()
                .trim()
                .matches(/^[^\d]*$/, "Numbers are not allowed in Point Title")
                .notRequired(),
              description: Yup.string().trim().notRequired(),
            })
          ),
        })
      ),
  });

  const getSectionWordCount = (section) => {
    let totalText = "";
    section.content.forEach((item) => {
      totalText += ` ${item.title || ""} ${item.description || ""}`;
    });
    if (section.points) {
      section.points.forEach((point) => {
        totalText += ` ${point.title || ""} ${point.description || ""}`;
      });
    }
    return totalText.trim().split(/\s+/).filter(Boolean).length;
  };

  // Formik initialization
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      slug_title: "",
      meta_title: "",
      blog_title: "",
      originalSlug: "",
      meta_description: "",
      meta_image: null,
      meta_image_preview: null,
      contentSections: [
        {
          image: null,
          imagePreview: null,
          content: [{ title: "", description: "", isFirstItem: true }],
          showPoints: false,
          points: [],
        },
      ],
    },
    validationSchema,
    validateOnBlur: true,
    onSubmit: async (values, { setErrors }) => {
      const totalWords = values.contentSections.reduce((sum, section) => {
        return sum + getSectionWordCount(section);
      }, 0);

      if (totalWords < 350) {
        toast.error(`Total blog content must be at least 350 words (currently ${totalWords})`);
        return;
      }

      await handleSubmit(values);
    },
  });

  // Load data if in edit mode
  useEffect(() => {
    if (!router.isReady || !editId) return;

    const loadBlogData = async () => {
      try {
        // Clean up previous preview URLs
        previewUrlsRef.current.forEach((url) => {
          if (url) URL.revokeObjectURL(url);
        });
        previewUrlsRef.current = [];
        setMetaImagePreview(null);

        const res = await api.get(`/nodesetup/meta_blog/${editId}`);
        const blog = res.data?.data;
        if (!blog) return;

        const parsedSections = blog.trnData.map((section, index) => {
          const imagePreview = section.content_img ? `${API_URL}/meta_blogs/${section.content_img}` : null;
          if (imagePreview) previewUrlsRef.current.push(imagePreview);

          return {
            image: null,
            imagePreview,
            content: Array.isArray(section.content_description)
              ? section.content_description.map((c, idx) => ({
                  title: c.sub_title || "",
                  description: c.description || "",
                  isFirstItem: idx === 0,
                }))
              : [{ title: "", description: "", isFirstItem: true }],
            showPoints: section.content_points?.length > 0,
            points: Array.isArray(section.content_points)
              ? section.content_points.map((p) => ({
                  title: p.sub_title?.title || "",
                  description: p.sub_title?.description || "",
                }))
              : [],
          };
        });

        const metaImagePreview = blog.title_image ? `${API_URL}/meta_blogs/${blog.title_image}` : null;
        if (metaImagePreview) previewUrlsRef.current.push(metaImagePreview);

        formik.setValues({
          slug_title: blog.slug_title || "",
          originalSlug: blog.slug_title || "",
          meta_title: blog.meta_title || "",
          blog_title: blog.blog_title || "",
          meta_description: blog.meta_description || "",
          meta_image: null,
          meta_image_preview: metaImagePreview,
          contentSections: parsedSections,
        });

        setMetaImagePreview(metaImagePreview);
      } catch (error) {
        console.error("Error loading blog data:", error);
        toast.error("Failed to load blog data");
      }
    };

    loadBlogData();
  }, [editId, router.isReady]);

  // Optimized handleMetaImageChange
  const handleMetaImageChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!VALID_IMAGE_TYPES.includes(file.type) || file.name.toLowerCase().endsWith(".jfif")) {
        toast.error("Only JPG, PNG, WEBP, or AVIF files are allowed. JFIF is not supported.");
        return;
      }

      // Revoke previous meta image preview URL
      if (metaImagePreview && metaImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(metaImagePreview);
        previewUrlsRef.current = previewUrlsRef.current.filter((url) => url !== metaImagePreview);
      }

      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.push(previewUrl);
      formik.setFieldValue("meta_image", file);
      formik.setFieldValue("meta_image_preview", previewUrl);
      setMetaImagePreview(previewUrl);
    },
    [formik, metaImagePreview]
  );

  // Optimized form submission
  const handleSubmit = useCallback(
    async (values) => {
      try {
        const formData = new FormData();
        formData.append("slug_title", values.slug_title);
        formData.append("meta_title", values.meta_title);
        formData.append("meta_description", values.meta_description);
        formData.append("blog_title", values.blog_title);
        formData.append("status", "1");

        if (values.meta_image) {
          formData.append("title_image", values.meta_image);
        }

        const trnData = values.contentSections.map((section, index) => {
          if (section.image) {
            formData.append(`content_img[${index}]`, section.image);
          }

          return {
            content_img: section.image?.name || "",
            content_description: section.content.map((item) => ({
              sub_title: item.title || "",
              description: item.description || "",
            })),
            content_points: section.showPoints
              ? section.points.map((pt) => ({
                  sub_title: {
                    title: pt.title || "",
                    description: pt.description || "",
                  },
                }))
              : [],
          };
        });

        formData.append("trnData", JSON.stringify(trnData));

        const res = await (editId
          ? api.put(`/nodesetup/meta_blog/${editId}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
          : api.post(`/nodesetup/meta_blog`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            }));

        if (res.data.status === 200) {
          toast.success(editId ? "Blog updated" : "Blog created");
          router.push("/blogs");
        } else {
          toast.warning(res.data.message || "Something went wrong");
        }
      } catch (err) {
        console.error("Submission error:", err);
        if (err.response) {
          console.error("Server response:", err.response.data);
          toast.error(err.response.data.message || "Submission failed: Bad request");
        } else {
          toast.error("Submission failed: Network error");
        }
      }
    },
    [editId, router]
  );

  // Section management functions
  const addContentSection = useCallback(() => {
    formik.setFieldValue("contentSections", [
      ...formik.values.contentSections,
      {
        image: null,
        imagePreview: null,
        content: [{ title: "", description: "", isFirstItem: true }],
        showPoints: false,
        points: [],
      },
    ]);
    setTimeout(() => {
      const lastSectionIndex = formik.values.contentSections.length;
      const lastSectionRef = sectionRefs.current[lastSectionIndex];
      if (lastSectionRef) {
        lastSectionRef.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 0);
  }, [formik]);

  const removeSection = useCallback(
    (sectionIndex) => {
      if (formik.values.contentSections.length === 1) {
        toast.error("At least one section is required");
        return;
      }
      const newSections = formik.values.contentSections.filter((_, index) => index !== sectionIndex);
      // Revoke object URLs for the removed section's image preview
      const removedSection = formik.values.contentSections[sectionIndex];
      if (removedSection.imagePreview && removedSection.imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(removedSection.imagePreview);
        previewUrlsRef.current = previewUrlsRef.current.filter((url) => url !== removedSection.imagePreview);
      }
      formik.setFieldValue("contentSections", newSections);
    },
    [formik]
  );

  const addContentItem = useCallback(
    (sectionIndex) => {
      const newSections = [...formik.values.contentSections];
      newSections[sectionIndex].content.push({
        title: "",
        description: "",
        isFirstItem: false,
      });
      formik.setFieldValue("contentSections", newSections);
    },
    [formik]
  );

  const removeContentItem = useCallback(
    (sectionIndex, contentIndex) => {
      if (
        sectionIndex === 0 &&
        contentIndex === 0 &&
        formik.values.contentSections[0].content.length === 1
      ) {
        toast.error("First section must have at least one content item");
        return;
      }
      const newSections = [...formik.values.contentSections];
      newSections[sectionIndex].content = newSections[sectionIndex].content.filter(
        (_, index) => index !== contentIndex
      );
      formik.setFieldValue("contentSections", newSections);
    },
    [formik]
  );

  const addPoint = useCallback(
    (sectionIndex) => {
      const newSections = [...formik.values.contentSections];
      newSections[sectionIndex].points.push({ title: "", description: "" });
      formik.setFieldValue("contentSections", newSections);
    },
    [formik]
  );

  const removePoint = useCallback(
    (sectionIndex, pointIndex) => {
      const newSections = [...formik.values.contentSections];
      newSections[sectionIndex].points = newSections[sectionIndex].points.filter(
        (_, index) => index !== pointIndex
      );
      formik.setFieldValue("contentSections", newSections);
    },
    [formik]
  );

  const showPointSection = useCallback(
    (sectionIndex) => {
      const newSections = [...formik.values.contentSections];
      newSections[sectionIndex].showPoints = true;
      newSections[sectionIndex].points = [{ title: "", description: "" }];
      formik.setFieldValue("contentSections", newSections);
    },
    [formik]
  );

  const handleSectionImageChange = useCallback(
    (e, sectionIndex) => {
      const file = e.target.files[0];
      if (!file) return;

      if (file.size > MAX_FILE_SIZE) {
        toast.error("File size must be less than 5MB");
        return;
      }
      if (!VALID_IMAGE_TYPES.includes(file.type) || file.name.toLowerCase().endsWith(".jfif")) {
        toast.error("Only JPG, PNG, WEBP, or AVIF files are allowed. JFIF is not supported.");
        return;
      }

      const newSections = [...formik.values.contentSections];
      // Revoke previous section image preview URL
      if (
        newSections[sectionIndex].imagePreview &&
        newSections[sectionIndex].imagePreview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(newSections[sectionIndex].imagePreview);
        previewUrlsRef.current = previewUrlsRef.current.filter(
          (url) => url !== newSections[sectionIndex].imagePreview
        );
      }

      const previewUrl = URL.createObjectURL(file);
      previewUrlsRef.current.push(previewUrl);
      newSections[sectionIndex].image = file;
      newSections[sectionIndex].imagePreview = previewUrl;
      formik.setFieldValue("contentSections", newSections);
    },
    [formik]
  );

  const handleContentChange = useCallback(
    (e, sectionIndex, contentIndex, field) => {
      const newSections = [...formik.values.contentSections];
      newSections[sectionIndex].content[contentIndex][field] = e.target.value;
      formik.setFieldValue("contentSections", newSections);
    },
    [formik]
  );

  const handlePointChange = useCallback(
    (e, sectionIndex, pointIndex, field) => {
      const newSections = [...formik.values.contentSections];
      newSections[sectionIndex].points[pointIndex][field] = e.target.value;
      formik.setFieldValue("contentSections", newSections);
    },
    [formik]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl pl-4 mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-900 dark:text-white">
            {editId ? "Edit Blog" : "Add Blog"}
          </h2>
          <button
            onClick={() => router.push("/blogs")}
            className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg group cursor-pointer"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform duration-300"
            />
            <span className="font-semibold">Back</span>
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 border-2 border-[#004b8f]/20 rounded-2xl shadow-lg p-8 space-y-6">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Slug Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="slug_title"
                  value={formik.values.slug_title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full p-3 rounded-lg dark:bg-gray-700 border-2 border-gray-300"
                  placeholder="Slug Title"
                />
                {formik.touched.slug_title && formik.errors.slug_title && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.slug_title}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Meta Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="meta_title"
                  value={formik.values.meta_title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full p-3 rounded-lg dark:bg-gray-700 border-2 border-gray-300"
                  placeholder="Meta Title"
                />
                {formik.touched.meta_title && formik.errors.meta_title && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.meta_title}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Blog Title <span className="text-red-500">*</span>
                </label>
                <input
                  name="blog_title"
                  value={formik.values.blog_title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full p-3 rounded-lg dark:bg-gray-700 border-2 border-gray-300"
                  placeholder="Blog Title"
                />
                {formik.touched.blog_title && formik.errors.blog_title && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.blog_title}</p>
                )}
              </div>
            </div>

            <div className="gap-4">
              <div className="flex flex-col">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Meta Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Meta Description"
                  name="meta_description"
                  value={formik.values.meta_description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  rows={2}
                  className="w-full p-3 rounded-lg dark:bg-gray-700 border-2 border-gray-300 text-sm"
                />
                {formik.touched.meta_description && formik.errors.meta_description && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.meta_description}</p>
                )}
                <div className="flex justify-between">
                  <p className="text-sm text-red-500">Description must be 100 to 134 characters long</p>
                  <p
                    className={`text-sm mt-1 italic text-gray-700 dark:text-white ${
                      formik.values.meta_description.length < 100 || formik.values.meta_description.length > 134
                    }`}
                  >
                    Total character count: {formik.values.meta_description.length} / 134 characters
                  </p>
                </div>
              </div>

              <div className="flex flex-col mt-8">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Image <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  name="meta_image"
                  onChange={handleMetaImageChange}
                  className="p-3 border rounded-lg border-gray-300 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-red-500">Image dimensions required: 740 x 500</span>
                {formik.touched.meta_image && formik.errors.meta_image && (
                  <p className="text-red-500 text-sm mt-1">{formik.errors.meta_image}</p>
                )}
                {metaImagePreview && (
                  <ReactModalImage
                    small={metaImagePreview}
                    large={metaImagePreview}
                    alt="Meta Preview"
                    className="w-32 h-32 object-cover rounded-lg border mt-2 self-start"
                  />
                )}
              </div>
            </div>

            {formik.values.contentSections.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                ref={(el) => (sectionRefs.current[sectionIndex] = el)}
                className="bg-white p-6 rounded-xl shadow-md mb-6 relative mt-8 dark:bg-gray-700"
              >
                <h3 className="font-bold text-lg text-gray-700 mb-4">Section {sectionIndex + 1}</h3>

                {sectionIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => removeSection(sectionIndex)}
                    className="absolute top-4 right-4 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer duration-300"
                  >
                    Remove
                  </button>
                )}

                <div className="flex flex-col md:items-start gap-4 dark:bg-gray-700">
                  <div className="w-full">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Image <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleSectionImageChange(e, sectionIndex)}
                      className="w-full p-3 rounded-lg border-2 border-gray-300"
                    />
                    <span className="text-red-500">Image dimensions required: 740 x 500</span>
                    {formik.touched.contentSections?.[sectionIndex]?.image &&
                      formik.errors.contentSections?.[sectionIndex]?.image && (
                        <p className="text-red-500 text-sm mt-1">{formik.errors.contentSections[sectionIndex].image}</p>
                      )}
                  </div>
                  {section.imagePreview && (
                    <ReactModalImage
                      small={section.imagePreview}
                      large={section.imagePreview}
                      alt={`Section ${sectionIndex + 1} Preview`}
                      className="w-32 h-32 rounded-lg border"
                    />
                  )}
                </div>

                {section.content.map((item, contentIndex) => (
                  <div
                    key={contentIndex}
                    className="relative p-4 border border-gray-200 rounded-lg my-4 bg-gray-50 dark:bg-gray-700"
                  >
                    {contentIndex > 0 && (
                      <button
                        type="button"
                        onClick={() => removeContentItem(sectionIndex, contentIndex)}
                        className="absolute top-3 right-3 text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                        title="Remove this item"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Title {item.isFirstItem && <span className="text-red-500">*</span>}
                        </label>
                        <input
                          placeholder="Enter title"
                          value={item.title}
                          onChange={(e) => handleContentChange(e, sectionIndex, contentIndex, "title")}
                          onBlur={() =>
                            formik.setFieldTouched(`contentSections[${sectionIndex}].content[${contentIndex}].title`, true)
                          }
                          className="w-full p-2.5 border border-gray-300 rounded-md focus:border-transparent"
                        />
                        {formik.touched.contentSections?.[sectionIndex]?.content?.[contentIndex]?.title &&
                          formik.errors.contentSections?.[sectionIndex]?.content?.[contentIndex]?.title && (
                            <p className="text-red-500 text-sm mt-1">
                              {formik.errors.contentSections[sectionIndex].content[contentIndex].title}
                            </p>
                          )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Description {item.isFirstItem && <span className="text-red-500">*</span>}
                        </label>
                        <textarea
                          placeholder="Enter description"
                          value={item.description}
                          onChange={(e) => handleContentChange(e, sectionIndex, contentIndex, "description")}
                          onBlur={() =>
                            formik.setFieldTouched(
                              `contentSections[${sectionIndex}].content[${contentIndex}].description`,
                              true
                            )
                          }
                          rows={3}
                          className="w-full p-2.5 border border-gray-300 rounded-md resize-y focus:border-transparent"
                        />
                        {formik.touched.contentSections?.[sectionIndex]?.content?.[contentIndex]?.description &&
                          formik.errors.contentSections?.[sectionIndex]?.content?.[contentIndex]?.description && (
                            <p className="text-red-500 text-sm mt-1">
                              {formik.errors.contentSections[sectionIndex].content[contentIndex].description}
                            </p>
                          )}
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addContentItem(sectionIndex)}
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <PlusCircle size={18} />
                  Add Title/Description
                </button>

                {!section.showPoints ? (
                  <button
                    type="button"
                    onClick={() => showPointSection(sectionIndex)}
                    className="text-blue-600 hover:underline flex items-center gap-1 mt-4"
                  >
                    <PlusCircle size={18} />
                    Add Points
                  </button>
                ) : (
                  <>
                    <h4 className="text-md font-semibold mt-4 mb-2">Points</h4>
                    {section.points.map((item, pointIndex) => (
                      <div
                        key={pointIndex}
                        className="relative p-4 border border-gray-200 rounded-lg my-4 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Point Title {pointIndex + 1}
                          </label>
                          <button
                            type="button"
                            onClick={() => removePoint(sectionIndex, pointIndex)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Remove this point"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <input
                              placeholder={`Point Title ${pointIndex + 1}`}
                              value={item.title}
                              onChange={(e) => handlePointChange(e, sectionIndex, pointIndex, "title")}
                              onBlur={() =>
                                formik.setFieldTouched(
                                  `contentSections[${sectionIndex}].points[${pointIndex}].title`,
                                  true
                                )
                              }
                              className="w-full p-2 border-2 border-gray-300 h-12 rounded-md"
                            />
                            {formik.touched.contentSections?.[sectionIndex]?.points?.[pointIndex]?.title &&
                              formik.errors.contentSections?.[sectionIndex]?.points?.[pointIndex]?.title && (
                                <p className="text-red-500 text-sm mt-1">
                                  {formik.errors.contentSections[sectionIndex].points[pointIndex].title}
                                </p>
                              )}
                          </div>
                          <textarea
                            placeholder={`Point Description ${pointIndex + 1}`}
                            value={item.description}
                            onChange={(e) => handlePointChange(e, sectionIndex, pointIndex, "description")}
                            rows={3}
                            className="w-full p-3 border-2 border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addPoint(sectionIndex)}
                      className="text-blue-600 hover:underline flex items-center gap-1 mt-2"
                    >
                      <PlusCircle size={18} />
                      Add Point
                    </button>
                  </>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addContentSection}
              className="text-blue-800 hover:underline flex items-center gap-2 mb-4"
            >
              <PlusCircle size={18} />
              Add Section
            </button>

            <div className="text-right text-sm text-gray-700 italic dark:text-white">
              Total Word Count:{" "}
              {formik.values.contentSections.reduce((sum, section) => sum + getSectionWordCount(section), 0)} / 350 minimum
            </div>

            <button
              type="submit"
              disabled={formik.isSubmitting}
              className="flex items-center mx-auto gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg hover:shadow-xl group cursor-pointer"
            >
              {editId ? "Update" : "Save"}
              <Save size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}