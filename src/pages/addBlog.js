// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import { ArrowLeft, PlusCircle } from "lucide-react";
// import api, { API_URL } from "@/utills/api";
// import { toast } from "react-toastify";
// import { useFormik } from "formik";
// import * as Yup from "yup";

// export default function AddBlogPage() {
//   const router = useRouter();
//   const editId = router.query.id || null;
//   const [metaImage, setMetaImage] = useState(null);
//   const [metaImagePreview, setMetaImagePreview] = useState(null);
//   const [slugTitle, setSlugTitle] = useState("");
//   const [metaTitle, setMetaTitle] = useState("");
//   const [metaDescription, setMetaDescription] = useState("");
//   const [blogTitle, setBlogTitle] = useState("");
//   const [sectionErrors, setSectionErrors] = useState([]);

//   const [contentSections, setContentSections] = useState([
//     {
//       image: null,
//       imagePreview: null,
//       content: [{ title: "", description: "" }],
//       showPoints: false,
//       points: [{ title: "", description: "" }],
//     },
//   ]);

//   // Fetch data for editing
//   useEffect(() => {
//     if (!router.isReady || !editId) return;

//     api
//       .get(`/nodesetup/meta_blog/${editId}`)
//       .then((res) => {
//         const blog = res.data?.data;
//         if (!blog) return;

//         setSlugTitle(blog.slug_title || "");
//         setMetaTitle(blog.meta_title || "");
//         setMetaDescription(blog.meta_description || "");
//         setBlogTitle(blog.blog_title || "");

//         if (blog.title_image) {
//           setMetaImagePreview(`${API_URL}/meta_blogs/${blog.title_image}`);
//         }

//         const parsedSections = blog.trnData.map((section) => ({
//           image: null,
//           imagePreview: section.content_img
//             ? `${API_URL}/meta_blogs/${section.content_img}`
//             : null,
//           content: (section.content_description || []).map((c) => ({
//             title: c.sub_title || "",
//             description: c.description || "", // ✅ Ensure description is mapped
//           })),
//           showPoints: section.content_points?.length > 0,
//           points: (section.content_points || []).map((p) => ({
//             title: p.sub_title?.title || "",
//             description: p.sub_title?.description || "",
//           })),
//         }));

//         setContentSections(parsedSections);
//       })
//       .catch(() => toast.error("Failed to fetch blog"));
//   }, [editId, router.isReady]);

//   const handleMetaImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setMetaImage(file);
//       setMetaImagePreview(URL.createObjectURL(file));
//     }
//   };

//   const handleSubmit = async () => {
//     const formData = new FormData();
//     formData.append("slug_title", slugTitle);
//     formData.append("meta_title", metaTitle);
//     formData.append("meta_description", metaDescription);
//     formData.append("blog_title", blogTitle);
//     formData.append("status", "1");

//     if (metaImage) {
//       formData.append("title_image", metaImage);
//     }

//     const trnData = contentSections.map((section, index) => {
//       if (section.image) {
//         formData.append(`content_img[${index}]`, section.image);
//       }

//       const content_description = section.content.map((item) => ({
//         sub_title: item.title || "",
//         description: item.description || "",
//       }));

//       const content_points = section.points.map((pt) => ({
//         sub_title: {
//           title: pt.title || "",
//           description: pt.description || "",
//         },
//       }));

//       return {
//         content_img: section.image?.name || "",
//         content_description,
//         content_points,
//       };
//     });

//     formData.append("trnData", JSON.stringify(trnData));

//     try {
//       const res = editId
//         ? await api.put(`/nodesetup/meta_blog/${editId}`, formData, {
//             headers: { "Content-Type": "multipart/form-data" },
//           })
//         : await api.post(`/nodesetup/meta_blog`, formData, {
//             headers: { "Content-Type": "multipart/form-data" },
//           });

//       if (res.data.status === 200) {
//         toast.success(editId ? "Blog updated" : "Blog created");
//         router.push("/blogsss");
//       } else {
//         toast.warning(res.data.message || "Something went wrong");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Submission failed");
//     }
//   };

// const addContentSection = () => {
//   setContentSections((prev) => [
//     ...prev,
//     {
//       image: null,
//       imagePreview: null,
//       content: [{ title: "", description: "" }],
//       showPoints: false,
//       points: [{ title: "", description: "" }],
//     },
//   ]);
// };

//   const removeSection = (i) => {
//     if (contentSections.length === 1) return;
//     const updated = [...contentSections];
//     updated.splice(i, 1);
//     setContentSections(updated);
//   };

//   const addPoint = (i) => {
//     const updated = [...contentSections];
//     updated[i].points.push({ title: "", description: "" });
//     setContentSections(updated);
//   };

//   const removePoint = (i, j) => {
//     const updated = [...contentSections];
//     updated[i].points.splice(j, 1);
//     setContentSections(updated);
//   };

//   const showPointSection = (i) => {
//     const updated = [...contentSections];
//     updated[i].showPoints = true;
//     updated[i].points = [{ title: "", description: "" }];
//     setContentSections(updated);
//   };

//   // Add this above your component
//   const validationSchema = Yup.object().shape({
//     slug_title: Yup.string().required("Slug Title is required"),
//     meta_title: Yup.string().required("Meta Title is required"),
//     blog_title: Yup.string().required("Blog Title is required"),
//     meta_description: Yup.string().required("Meta Description is required"),
//   });

//   const formik = useFormik({
//     enableReinitialize: true,
//     initialValues: {
//       slug_title: slugTitle,
//       meta_title: metaTitle,
//       blog_title: blogTitle,
//       meta_description: metaDescription,
//     },
//     validationSchema: Yup.object({
//       slug_title: Yup.string().required("Slug Title is required"),
//       meta_title: Yup.string().required("Meta Title is required"),
//       blog_title: Yup.string().required("Blog Title is required"),
//       meta_description: Yup.string().required("Meta Description is required"),
//     }),

//     onSubmit: async (values) => {
//       // Ensure at least 1 section exists
//       if (contentSections.length === 0) {
//         toast.error("At least one section is required");
//         return;
//       }

//       // Validate only the first section strictly
//       const firstSection = contentSections[0];
//       const firstHasTitle = firstSection.content.some((c) => c.title.trim());
//       const firstHasDescription = firstSection.content.some((c) =>
//         c.description.trim()
//       );

//       if (!firstHasTitle || !firstHasDescription) {
//         toast.error(
//           "First section must have at least one title and one description"
//         );
//         return;
//       }

//       // Section-level errors for all sections (image check only)
//       const sectionErrors = [];
//       for (let i = 0; i < contentSections.length; i++) {
//         const section = contentSections[i];
//         const error = { image: false };

//         if (!section.image && !section.imagePreview) {
//           error.image = true;
//         }

//         sectionErrors.push(error);
//       }
//       setSectionErrors(sectionErrors);

//       const hasImageErrors = sectionErrors.some((e) => e.image);
//       if (hasImageErrors) {
//         toast.error("Please fill all required section images");
//         return;
//       }

//       if (!metaImage && !metaImagePreview && !editId) {
//         toast.error("Meta Image is required");
//         return;
//       }

//       // Proceed with formData construction and API call
//       const formData = new FormData();
//       formData.append("slug_title", values.slug_title);
//       formData.append("meta_title", values.meta_title);
//       formData.append("meta_description", values.meta_description);
//       formData.append("blog_title", values.blog_title);
//       formData.append("status", "1");

//       if (metaImage) {
//         formData.append("title_image", metaImage);
//       }

//       const trnData = contentSections.map((section, index) => {
//         if (section.image) {
//           formData.append(`content_img[${index}]`, section.image);
//         }

//         const content_description = section.content.map((item) => ({
//           sub_title: item.title || "",
//           description: item.description || "",
//         }));

//         const content_points = section.points.map((pt) => ({
//           sub_title: {
//             title: pt.title || "",
//             description: pt.description || "",
//           },
//         }));

//         return {
//           content_img: section.image?.name || "",
//           content_description,
//           content_points,
//         };
//       });

//       formData.append("trnData", JSON.stringify(trnData));

//       try {
//         const res = editId
//           ? await api.put(`/nodesetup/meta_blog/${editId}`, formData, {
//               headers: { "Content-Type": "multipart/form-data" },
//             })
//           : await api.post(`/nodesetup/meta_blog`, formData, {
//               headers: { "Content-Type": "multipart/form-data" },
//             });

//         if (res.data.status === 200) {
//           toast.success(editId ? "Blog updated" : "Blog created");
//           router.push("/blogsss");
//         } else {
//           toast.warning(res.data.message || "Something went wrong");
//         }
//       } catch (err) {
//         console.error(err);
//         toast.error("Submission failed");
//       }
//     },
//   });

//   return (
//     <div className='min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-12 px-4 sm:px-6 md:px-8'>
//       <div className='max-w-6xl mx-auto py-10'>
//         <div className='flex justify-between items-center mb-6'>
//           <h2 className='text-3xl font-bold text-blue-900'>
//             {editId ? "Edit Blog" : "Add Blog"}
//           </h2>
//           <button
//             onClick={() => router.back()}
//             className='bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center gap-2'>
//             <ArrowLeft size={16} />
//             Back
//           </button>
//         </div>

//         {/* Meta Fields */}
//         <div className='space-y-6'>
//           {/* First Row: 3 equal input fields */}
//           <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
//             <div className='mb-4'>
//               <input
//                 name='slug_title'
//                 value={formik.values.slug_title}
//                 onChange={(e) => {
//                   formik.handleChange(e);
//                   setSlugTitle(e.target.value);
//                 }}
//                 className='w-full p-3 rounded-lg border-2 border-gray-300'
//                 placeholder='Slug Title'
//               />
//               {formik.touched.slug_title && formik.errors.slug_title && (
//                 <p className='text-red-500 text-sm mt-1'>
//                   {formik.errors.slug_title}
//                 </p>
//               )}
//             </div>

//             <div className='mb-4'>
//               <input
//                 name='meta_title'
//                 value={formik.values.meta_title}
//                 onChange={(e) => {
//                   formik.handleChange(e);
//                   setSlugTitle(e.target.value);
//                 }}
//                 className='w-full p-3 rounded-lg border-2 border-gray-300'
//                 placeholder='Meta Title'
//               />
//               {formik.touched.meta_title && formik.errors.meta_title && (
//                 <p className='text-red-500 text-sm mt-1'>
//                   {formik.errors.meta_title}
//                 </p>
//               )}
//             </div>

//             <div className='mb-4'>
//               <input
//                 name='blog_title'
//                 value={formik.values.blog_title}
//                 onChange={(e) => {
//                   formik.handleChange(e);
//                   setSlugTitle(e.target.value);
//                 }}
//                 className='w-full p-3 rounded-lg border-2 border-gray-300'
//                 placeholder='Blog Title'
//               />
//               {formik.touched.blog_title && formik.errors.blog_title && (
//                 <p className='text-red-500 text-sm mt-1'>
//                   {formik.errors.blog_title}
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Second Row: Meta Description and Image Upload */}
//           <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
//             {/* Meta Description */}
//             <div className='flex flex-col'>
//               <textarea
//                 placeholder='Meta Description'
//                 value={formik.values.meta_description}
//                 onChange={(e) => {
//                   formik.handleChange(e);
//                   setMetaDescription(e.target.value);
//                 }}
//                 rows={3}
//                 name='meta_description'
//                 className='w-full p-3 rounded-lg border-2 border-gray-300'
//               />
//               {formik.touched.meta_description &&
//                 formik.errors.meta_description && (
//                   <p className='text-red-500 text-sm mt-1'>
//                     {formik.errors.meta_description}
//                   </p>
//                 )}
//             </div>

//             {/* Meta Image Upload */}
//             <div className='flex flex-col'>
//               <input
//                 type='file'
//                 name='meta_image'
//                 onChange={handleMetaImageChange}
//                 className='p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer'
//               />
//               {submitAttempted && !metaImage && !metaImagePreview && !editId && (
//   <p className="text-red-500 text-sm mt-1">Meta Image is required</p>
// )}

//               {metaImagePreview && (
//                 <img
//                   src={metaImagePreview}
//                   alt='Meta Preview'
//                   className='w-full max-w-[160px] h-[160px] object-cover rounded-lg border mt-2 self-start'
//                 />
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Sections */}
//         {contentSections.map((section, i) => (
//           <div
//             key={i}
//             className='bg-white p-6 rounded-xl shadow-md mb-6 relative mt-8'>
//             <h3 className='font-bold text-lg text-gray-700 mb-4'>
//               Section {i + 1}
//             </h3>

//             {contentSections.length > 1 && (
//               <button
//                 onClick={() => removeSection(i)}
//                 className='absolute top-4 right-4 text-red-500 hover:underline text-sm'>
//                 Remove Section
//               </button>
//             )}

//             <div className='grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4'>
//               <input
//                 type='file'
//                 onChange={(e) => {
//                   const file = e.target.files[0];
//                   const updated = [...contentSections];
//                   updated[i].image = file;
//                   updated[i].imagePreview = file
//                     ? URL.createObjectURL(file)
//                     : null;
//                   setContentSections(updated);
//                 }}
//                 className='w-full p-3 rounded-lg border-2 border-gray-300'
//               />

//               {section.imagePreview && (
//                 <img
//                   src={section.imagePreview}
//                   alt='Preview'
//                   className='w-32 h-32 rounded-lg border'
//                 />
//               )}
// {
//   sectionErrors[i]?.image && (
//     <p className='text-red-500 text-sm mt-1'>
//       Image is required for section {i + 1}
//     </p>
//   );
// }
//             </div>

//             {/* Content */}
//             {section.content.map((item, j) => (
//               <div
//                 key={j}
//                 className='grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 my-3'>
//                 <input
//                   placeholder={`Title ${j + 1}`}
//                   value={item.title}
//                   onChange={(e) => {
//                     const updated = [...contentSections];
//                     updated[i].content[j].title = e.target.value;
//                     setContentSections(updated);
//                   }}
//                   className='p-3 border-2 rounded-lg'
//                 />
//                 <textarea
//                   placeholder={`Description ${j + 1}`}
//                   value={item.description}
//                   onChange={(e) => {
//                     const updated = [...contentSections];
//                     updated[i].content[j].description = e.target.value;
//                     setContentSections(updated);
//                   }}
//                   className='p-3 border-2 rounded-lg'
//                 />
// {sectionErrors[i]?.content && (
//   <p className="text-red-500 text-sm mt-1">At least one title and one description required</p>
// )}
//                 <button
//                   onClick={() => {
//                     const updated = [...contentSections];
//                     updated[i].content.splice(j, 1);
//                     setContentSections(updated);
//                   }}
//                   className='text-red-500 text-sm hover:underline'>
//                   Remove
//                 </button>
//
//               </div>
//             ))}
//             <button
//               onClick={() => {
//                 const updated = [...contentSections];
//                 updated[i].content.push({ title: "", description: "" });
//                 setContentSections(updated);
//               }}
//               className='text-blue-600 hover:underline flex items-center gap-1'>
//               <PlusCircle size={18} />
//               Title/Description
//             </button>
//             {sectionErrors[i]?.content && (
//               <p className='text-red-500 text-sm mt-1'>
//                 At least one title or description is required
//               </p>
//             )}

//             {!section.showPoints && (
//               <button
//                 onClick={() => showPointSection(i)}
//                 className='text-blue-600 hover:underline flex items-center gap-1 mt-4'>
//                 <PlusCircle size={18} />
//                 Add Points
//               </button>
//             )}

//             {section.showPoints && (
//               <>
//                 <h4 className='text-md font-semibold mt-4 mb-2'>Points</h4>
//                 {section.points.map((item, j) => (
//                   <div
//                     key={j}
//                     className='grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 mb-2'>
//                     <input
//                       placeholder={`Point Title ${j + 1}`}
//                       value={item.title}
//                       onChange={(e) => {
//                         const updated = [...contentSections];
//                         updated[i].points[j].title = e.target.value;
//                         setContentSections(updated);
//                       }}
//                       className='p-3 border-2 rounded-lg'
//                     />
//                     <textarea
//                       placeholder={`Point Description ${j + 1}`}
//                       value={item.description}
//                       onChange={(e) => {
//                         const updated = [...contentSections];
//                         updated[i].points[j].description = e.target.value;
//                         setContentSections(updated);
//                       }}
//                       className='p-3 border-2 rounded-lg'
//                     />
//                     <button
//                       onClick={() => removePoint(i, j)}
//                       className='text-red-500 text-sm hover:underline'>
//                       Remove
//                     </button>
//                   </div>
//                 ))}
//                 <button
//                   onClick={() => addPoint(i)}
//                   className='text-blue-600 hover:underline flex items-center gap-1 mt-2'>
//                   <PlusCircle size={18} />
//                   Add Point
//                 </button>
//               </>
//             )}
//           </div>
//         ))}

//         <button
//           onClick={addContentSection}
//           className='text-blue-800 hover:underline flex items-center gap-2 mb-4'>
//           <PlusCircle size={18} />
//           Add Section
//         </button>

//         <button
//           onClick={formik.handleSubmit}
//           className='w-full bg-blue-800 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-900 transition-all duration-200'>
//           {editId ? "Update Blog" : "Submit Blog"}
//         </button>
//       </div>
//     </div>
//   );
// }

// // ✅ Full merged AddBlogPage with validation and JSX
// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import { ArrowLeft, PlusCircle } from "lucide-react";
// import api, { API_URL } from "@/utills/api";
// import { toast } from "react-toastify";
// import { useFormik } from "formik";
// import * as Yup from "yup";

// export default function AddBlogPage() {
//   const router = useRouter();
//   const editId = router.query.id || null;

//   const [metaImage, setMetaImage] = useState(null);
//   const [metaImagePreview, setMetaImagePreview] = useState(null);
//   const [slugTitle, setSlugTitle] = useState("");
//   const [metaTitle, setMetaTitle] = useState("");
//   const [metaDescription, setMetaDescription] = useState("");
//   const [blogTitle, setBlogTitle] = useState("");

//   const [submitAttempted, setSubmitAttempted] = useState(false);
//   const [sectionErrors, setSectionErrors] = useState([]);

//   const [contentSections, setContentSections] = useState([
//     {
//       image: null,
//       imagePreview: null,
//       content: [{ title: "", description: "" }],
//       showPoints: false,
//       points: [{ title: "", description: "" }],
//     },
//   ]);

//   useEffect(() => {
//     if (!router.isReady || !editId) return;

//     api.get(`/nodesetup/meta_blog/${editId}`).then((res) => {
//       const blog = res.data?.data;
//       if (!blog) return;

//       setSlugTitle(blog.slug_title || "");
//       setMetaTitle(blog.meta_title || "");
//       setMetaDescription(blog.meta_description || "");
//       setBlogTitle(blog.blog_title || "");

//       if (blog.title_image) {
//         setMetaImagePreview(`${API_URL}/meta_blogs/${blog.title_image}`);
//       }

//       const parsedSections = blog.trnData.map((section) => ({
//         image: null,
//         imagePreview: section.content_img
//           ? `${API_URL}/meta_blogs/${section.content_img}`
//           : null,
//         content: (section.content_description || []).map((c) => ({
//           title: c.sub_title || "",
//           description: c.description || "",
//         })),
//         showPoints: section.content_points?.length > 0,
//         points: (section.content_points || []).map((p) => ({
//           title: p.sub_title?.title || "",
//           description: p.sub_title?.description || "",
//         })),
//       }));

//       setContentSections(parsedSections);
//     });
//   }, [editId, router.isReady]);

//   const handleMetaImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setMetaImage(file);
//       setMetaImagePreview(URL.createObjectURL(file));
//     }
//   };
//   const addContentSection = () => {
//     setContentSections((prev) => [
//       ...prev,
//       {
//         image: null,
//         imagePreview: null,
//         content: [{ title: "", description: "" }],
//         showPoints: false,
//         points: [{ title: "", description: "" }],
//       },
//     ]);
//   };

//   const removeSection = (i) => {
//     if (contentSections.length === 1) return;
//     const updated = [...contentSections];
//     updated.splice(i, 1);
//     setContentSections(updated);
//   };

//   const addPoint = (i) => {
//     const updated = [...contentSections];
//     updated[i].points.push({ title: "", description: "" });
//     setContentSections(updated);
//   };

//   const removePoint = (i, j) => {
//     const updated = [...contentSections];
//     updated[i].points.splice(j, 1);
//     setContentSections(updated);
//   };

//   const showPointSection = (i) => {
//     const updated = [...contentSections];
//     updated[i].showPoints = true;
//     updated[i].points = [{ title: "", description: "" }];
//     setContentSections(updated);
//   };

//   const validationSchema = Yup.object({
//     slug_title: Yup.string().trim().required("Slug Title is required"),
//     meta_title: Yup.string().trim().required("Meta Title is required"),
//     blog_title: Yup.string().trim().required("Blog Title is required"),
//     meta_description: Yup.string()
//       .trim()
//       .required("Meta Description is required"),
//   });

//   const formik = useFormik({
//     enableReinitialize: true,
//     initialValues: {
//       slug_title: slugTitle,
//       meta_title: metaTitle,
//       blog_title: blogTitle,
//       meta_description: metaDescription,
//     },
//     validationSchema,

//     onSubmit: async (values) => {
//       setSubmitAttempted(true);
//       if (!metaImage && !metaImagePreview && !editId) {
//         toast.error("Meta Image is required");
//         return;
//       }

//       if (contentSections.length === 0) {
//         toast.error("At least one section is required");
//         return;
//       }

//       const newErrors = [];
//       let hasErrors = false;

//       for (let i = 0; i < contentSections.length; i++) {
//         const section = contentSections[i];
//         const error = { image: false, content: false };

//         if (!section.image && !section.imagePreview) {
//           error.image = true;
//           hasErrors = true;
//         }

//         const hasTitle = section.content.some((c) => c.title.trim());
//         const hasDesc = section.content.some((c) => c.description.trim());

//         if (!hasTitle || !hasDesc) {
//           error.content = true;
//           hasErrors = true;
//         }

//         newErrors.push(error);
//       }

//       setSectionErrors(newErrors);

//       if (!metaImage && !metaImagePreview && !editId) {
//         toast.error("Meta Image is required");
//         return;
//       }

//       if (hasErrors) {
//         toast.error("Please fix section errors before submitting.");
//         return;
//       }

//       const validateSections = () => {
//         const newErrors = contentSections.map((section) => ({
//           image: !section.image && !section.imagePreview,
//           content: section.content.map((item) => ({
//             title: !item.title.trim(),
//             description: !item.description.trim(),
//           })),
//         }));
//         setSectionErrors(newErrors);
//         return newErrors.every(
//           (err) =>
//             !err.image && err.content.every((c) => !c.title && !c.description)
//         );
//       };

//       useEffect(() => {
//         validateSections(); // Revalidate when contentSections change
//       }, []);


//       const onSubmit = async (values) => {
//         setSubmitAttempted(true);

//         if (contentSections.length === 0) {
//           toast.error("At least one section is required");
//           return;
//         }
//         if (!validateSections()) {
//           toast.error("Please fix section errors before submitting.");
//           return;
//         }

//         const formData = new FormData();
//         formData.append("slug_title", values.slug_title);
//         formData.append("meta_title", values.meta_title);
//         formData.append("meta_description", values.meta_description);
//         formData.append("blog_title", values.blog_title);
//         formData.append("meta_image", values.title_image);

//         formData.append("status", "1");

//         if (metaImage) {
//           formData.append("title_image", metaImage);
//         }

//         const trnData = contentSections.map((section, index) => {
//           if (section.image) {
//             formData.append(`content_img[${index}]`, section.image);
//           }

//           const content_description = section.content.map((item) => ({
//             sub_title: item.title || "",
//             description: item.description || "",
//           }));

//           const content_points = section.points.map((pt) => ({
//             sub_title: {
//               title: pt.title || "",
//               description: pt.description || "",
//             },
//           }));

//           return {
//             content_img: section.image?.name || "",
//             content_description,
//             content_points,
//           };
//         });
//       };
//       formData.append("trnData", JSON.stringify(trnData));
      

//       try {
//         const res = editId
//           ? await api.put(`/nodesetup/meta_blog/${editId}`, formData, {
//               headers: { "Content-Type": "multipart/form-data" },
//             })
//           : await api.post(`/nodesetup/meta_blog`, formData, {
//               headers: { "Content-Type": "multipart/form-data" },
//             });

//         if (res.data.status === 200) {
//           toast.success(editId ? "Blog updated" : "Blog created");
//           router.push("/blogsss");
//         } else {
//           toast.warning(res.data.message || "Something went wrong");
//         }
//       } catch (err) {
//         console.error(err);
//         toast.error("Submission failed");
//       }
//     },
//   });

//   const onSubmit = async (values) => {
//     setSubmitAttempted(true);

//     if (contentSections.length === 0) {
//       toast.error("At least one section is required");
//       return;
//     }

//     if (!metaImage && !metaImagePreview && !editId) {
//       toast.error("Meta Image is required");
//       return;
//     }

//     if (!validateSections()) {
//       toast.error("Please fix section errors before submitting.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("slug_title", values.slug_title);
//     formData.append("meta_title", values.meta_title);
//     formData.append("meta_description", values.meta_description);
//     formData.append("blog_title", values.blog_title);
//     formData.append("status", "1");

//     if (metaImage) {
//       formData.append("title_image", metaImage);
//     }

//     const trnData = contentSections.map((section, index) => {
//       if (section.image) {
//         formData.append(`content_img[${index}]`, section.image);
//       }
//       return {
//         content_img: section.image?.name || section.imagePreview || "",
//         content_description: section.content.map((item) => ({
//           sub_title: item.title || "",
//           description: item.description || "",
//         })),
//         content_points: section.showPoints
//           ? section.points.map((pt) => ({
//               sub_title: {
//                 title: pt.title || "",
//                 description: pt.description || "",
//               },
//             }))
//           : [],
//       };
//     });

//     formData.append("trnData", JSON.stringify(trnData));

//     try {
//       const res = editId
//         ? await api.put(`/nodesetup/meta_blog/${editId}`, formData, {
//             headers: { "Content-Type": "multipart/form-data" },
//           })
//         : await api.post(`/nodesetup/meta_blog`, formData, {
//             headers: { "Content-Type": "multipart/form-data" },
//           });

//       if (res.data.status === 200) {
//         toast.success(editId ? "Blog updated" : "Blog created");
//         router.push("/blogsss");
//       } else {
//         toast.warning(res.data.message || "Something went wrong");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Submission failed");
//     }
//   };

//   const isFormValid = () =>
//     formik.isValid &&
//     (metaImage || metaImagePreview || editId) &&
//     validateSections();

//   <button
//     onClick={formik.handleSubmit}
//     disabled={!isFormValid()}
//     className={`w-full py-3 rounded-xl text-lg font-semibold transition-all duration-200 ${
//       isFormValid()
//         ? "bg-blue-800 text-white hover:bg-blue-900"
//         : "bg-gray-400 text-gray-700 cursor-not-allowed"
//     }`}>
//     {editId ? "Update Blog" : "Submit Blog"}
//   </button>;

//   return (
//     <div className='min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-12 px-4 sm:px-6 md:px-8'>
//       <div className='max-w-6xl mx-auto py-10'>
//         <div className='flex justify-between items-center mb-6'>
//           <h2 className='text-3xl font-bold text-blue-900'>
//             {editId ? "Edit Blog" : "Add Blog"}
//           </h2>
//           <button
//             onClick={() => router.back()}
//             className='bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center gap-2'>
//             <ArrowLeft size={16} /> Back
//           </button>
//         </div>
//         {/* Meta Fields */}
//         <div className='space-y-6'>
//           {/* First Row: 3 equal input fields */}
//           <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
//             <div className='mb-4'>
//               <input
//                 name='slug_title'
//                 value={formik.values.slug_title}
//                 onChange={(e) => {
//                   formik.handleChange(e);
//                   setSlugTitle(e.target.value);
//                 }}
//                 className='w-full p-3 rounded-lg border-2 border-gray-300'
//                 placeholder='Slug Title'
//               />
//               {formik.touched.slug_title && formik.errors.slug_title && (
//                 <p className='text-red-500 text-sm mt-1'>
//                   {formik.errors.slug_title}
//                 </p>
//               )}
//             </div>

//             <div className='mb-4'>
//               <input
//                 name='meta_title'
//                 value={formik.values.meta_title}
//                 onChange={(e) => {
//                   formik.handleChange(e);
//                   setMetaTitle(e.target.value);
//                 }}
//                 className='w-full p-3 rounded-lg border-2 border-gray-300'
//                 placeholder='Meta Title'
//               />
//               {formik.touched.meta_title && formik.errors.meta_title && (
//                 <p className='text-red-500 text-sm mt-1'>
//                   {formik.errors.meta_title}
//                 </p>
//               )}
//             </div>

//             <div className='mb-4'>
//               <input
//                 name='blog_title'
//                 value={formik.values.blog_title}
//                 onChange={(e) => {
//                   formik.handleChange(e);
//                   setBlogTitle(e.target.value);
//                 }}
//                 className='w-full p-3 rounded-lg border-2 border-gray-300'
//                 placeholder='Blog Title'
//               />
//               {formik.touched.blog_title && formik.errors.blog_title && (
//                 <p className='text-red-500 text-sm mt-1'>
//                   {formik.errors.blog_title}
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Second Row: Meta Description and Image Upload */}
//           <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
//             {/* Meta Description */}
//             <div className='flex flex-col'>
//               <textarea
//                 placeholder='Meta Description'
//                 value={formik.values.meta_description}
//                 onChange={(e) => {
//                   formik.handleChange(e);
//                   setMetaDescription(e.target.value);
//                 }}
//                 rows={3}
//                 name='meta_description'
//                 className='w-full p-3 rounded-lg border-2 border-gray-300'
//               />
//               {formik.touched.meta_description &&
//                 formik.errors.meta_description && (
//                   <p className='text-red-500 text-sm mt-1'>
//                     {formik.errors.meta_description}
//                   </p>
//                 )}
//             </div>

//             {/* Meta Image Upload */}
//             <div className='flex flex-col'>
//               {/* Update input to use correct name */}
//               <input
//                 type='file'
//                 name='title_image'
//                 onChange={handleMetaImageChange}
//                 className='p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer'
//               />
//               {submitAttempted &&
//                 !metaImage &&
//                 !metaImagePreview &&
//                 !editId && (
//                   <p className='text-red-500 text-sm mt-1'>
//                     Meta Image is required
//                   </p>
//                 )}

//               {metaImagePreview && (
//                 <img
//                   src={metaImagePreview}
//                   alt='Meta Preview'
//                   className='w-full max-w-[160px] h-[160px] object-cover rounded-lg border mt-2 self-start'
//                 />
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Sections */}
//         {contentSections.map((section, i) => (
//           <div
//             key={i}
//             className='bg-white p-6 rounded-xl shadow-md mb-6 relative mt-8'>
//             <h3 className='font-bold text-lg text-gray-700 mb-4'>
//               Section {i + 1}
//             </h3>
//             {contentSections.length > 1 && (
//               <button
//                 onClick={() => removeSection(i)}
//                 className='absolute top-4 right-4 text-red-500 hover:underline text-sm'>
//                 Remove Section
//               </button>
//             )}
//             {/* Section Image Upload + Preview */}
//             <div className='flex flex-col md:flex-row md:items-start gap-4'>
//               <div className='flex-1'>
//                 <input
//                   type='file'
//                   onChange={(e) => {
//                     const file = e.target.files[0];
//                     const updated = [...contentSections];
//                     updated[i].image = file;
//                     updated[i].imagePreview = file
//                       ? URL.createObjectURL(file)
//                       : null;
//                     setContentSections(updated);
//                   }}
//                   className='w-full p-3 rounded-lg border-2 border-gray-300'
//                 />
//                 {sectionErrors[i]?.image && (
//                   <p className='text-red-500 text-sm mt-1'>
//                     Image is required for section {i + 1}
//                   </p>
//                 )}
//               </div>
//               {section.imagePreview && (
//                 <img
//                   src={section.imagePreview}
//                   alt='Preview'
//                   className='w-32 h-32 rounded-lg border'
//                 />
//               )}
//             </div>
//             {/* Content: Title + Description + Remove */}
//             {section.content.map((item, j) => (
//               <div
//                 key={j}
//                 className='grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 my-4 items-start'>
//                 <div>
//                   <input
//                     placeholder={`Title ${j + 1}`}
//                     value={item.title}
//                     onChange={(e) => {
//                       const updated = [...contentSections];
//                       updated[i].content[j].title = e.target.value;
//                       setContentSections(updated);
//                     }}
//                     className='p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
//                   />
//                   {sectionErrors[i]?.content[j]?.title && (
//                     <p className='text-red-500 text-sm mt-1'>
//                       Title is required
//                     </p>
//                   )}
//                 </div>
//                 <div>
//                   <textarea
//                     placeholder={`Description ${j + 1}`}
//                     value={item.description}
//                     onChange={(e) => {
//                       const updated = [...contentSections];
//                       updated[i].content[j].description = e.target.value;
//                       setContentSections(updated);
//                     }}
//                     className='p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500'
//                   />
//                   {sectionErrors[i]?.content[j]?.description && (
//                     <p className='text-red-500 text-sm mt-1'>
//                       Description is required
//                     </p>
//                   )}
//                 </div>
//                 <button
//                   onClick={() => {
//                     const updated = [...contentSections];
//                     updated[i].content.splice(j, 1);
//                     setContentSections(updated);
//                   }}
//                   className='text-red-600 text-sm mt-1 hover:underline'>
//                   Remove
//                 </button>
//               </div>
//             ))}
//             {sectionErrors[i]?.content && (
//               <p className='text-red-500 text-sm mt-1'>
//                 At least one title and one description required
//               </p>
//             )}
//             <button
//               onClick={() => {
//                 const updated = [...contentSections];
//                 updated[i].content.push({ title: "", description: "" });
//                 setContentSections(updated);
//               }}
//               className='text-blue-600 hover:underline flex items-center gap-1'>
//               <PlusCircle size={18} />
//               Title/Description
//             </button>
//             {!section.showPoints && (
//               <button
//                 onClick={() => showPointSection(i)}
//                 className='text-blue-600 hover:underline flex items-center gap-1 mt-4'>
//                 <PlusCircle size={18} />
//                 Add Points
//               </button>
//             )}
//             {section.showPoints && (
//               <>
//                 <h4 className='text-md font-semibold mt-4 mb-2'>Points</h4>
//                 {section.points.map((item, j) => (
//                   <div
//                     key={j}
//                     className='grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 mb-2'>
//                     <input
//                       placeholder={`Point Title ${j + 1}`}
//                       value={item.title}
//                       onChange={(e) => {
//                         const updated = [...contentSections];
//                         updated[i].points[j].title = e.target.value;
//                         setContentSections(updated);
//                       }}
//                       className='p-3 border-2 rounded-lg'
//                     />
//                     <textarea
//                       placeholder={`Point Description ${j + 1}`}
//                       value={item.description}
//                       onChange={(e) => {
//                         const updated = [...contentSections];
//                         updated[i].points[j].description = e.target.value;
//                         setContentSections(updated);
//                       }}
//                       className='p-3 border-2 rounded-lg'
//                     />
//                     <button
//                       onClick={() => removePoint(i, j)}
//                       className='text-red-500 text-sm hover:underline'>
//                       Remove
//                     </button>
//                   </div>
//                 ))}
//                 <button
//                   onClick={() => addPoint(i)}
//                   className='text-blue-600 hover:underline flex items-center gap-1 mt-2'>
//                   <PlusCircle size={18} />
//                   Add Point
//                 </button>
//               </>
//             )}
//           </div>
//         ))}

//         <button
//           onClick={addContentSection}
//           className='text-blue-800 hover:underline flex items-center gap-2 mb-4'>
//           <PlusCircle size={18} />
//           Add Section
//         </button>

//         <button
//           onClick={formik.onSubmit}
//           className='w-full bg-blue-800 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-900 transition-all duration-200'>
//           {editId ? "Update Blog" : "Submit Blog"}
//         </button>
//       </div>
//     </div>
//   );
// }




import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, PlusCircle } from "lucide-react";
import api, { API_URL } from "@/utills/api";
import { toast } from "react-toastify";
import { useFormik } from "formik";
import * as Yup from "yup";

export default function AddBlogPage() {
  const router = useRouter();
  const editId = router.query.id || null;

  const [metaImage, setMetaImage] = useState(null);
  const [metaImagePreview, setMetaImagePreview] = useState(null);
  const [slugTitle, setSlugTitle] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [blogTitle, setBlogTitle] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [sectionErrors, setSectionErrors] = useState([]);

  const [contentSections, setContentSections] = useState([
    {
      image: null,
      imagePreview: null,
      content: [{ title: "", description: "" }],
      showPoints: false,
      points: [{ title: "", description: "" }],
    },
  ]);

  useEffect(() => {
    if (!router.isReady || !editId) return;

    api.get(`/nodesetup/meta_blog/${editId}`).then((res) => {
      const blog = res.data?.data;
      if (!blog) return;

      setSlugTitle(blog.slug_title || "");
      setMetaTitle(blog.meta_title || "");
      setMetaDescription(blog.meta_description || "");
      setBlogTitle(blog.blog_title || "");

      if (blog.title_image) {
        setMetaImagePreview(`${API_URL}/meta_blogs/${blog.title_image}`);
      }

      const parsedSections = blog.trnData.map((section) => ({
        image: null,
        imagePreview: section.content_img
          ? `${API_URL}/meta_blogs/${section.content_img}`
          : null,
        content: (section.content_description || []).map((c) => ({
          title: c.sub_title || "",
          description: c.description || "",
        })),
        showPoints: section.content_points?.length > 0,
        points: (section.content_points || []).map((p) => ({
          title: p.sub_title?.title || "",
          description: p.sub_title?.description || "",
        })),
      }));

      setContentSections(parsedSections);
    });
  }, [editId, router.isReady]);

  const handleMetaImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMetaImage(file);
      setMetaImagePreview(URL.createObjectURL(file));
    }
  };

  const addContentSection = () => {
    setContentSections((prev) => [
      ...prev,
      {
        image: null,
        imagePreview: null,
        content: [{ title: "", description: "" }],
        showPoints: false,
        points: [{ title: "", description: "" }],
      },
    ]);
  };

  const removeSection = (i) => {
    if (contentSections.length === 1) return;
    const updated = [...contentSections];
    updated.splice(i, 1);
    setContentSections(updated);
  };

  const addPoint = (i) => {
    const updated = [...contentSections];
    updated[i].points.push({ title: "", description: "" });
    setContentSections(updated);
  };

  const removePoint = (i, j) => {
    const updated = [...contentSections];
    updated[i].points.splice(j, 1);
    setContentSections(updated);
  };

  const showPointSection = (i) => {
    const updated = [...contentSections];
    updated[i].showPoints = true;
    updated[i].points = [{ title: "", description: "" }];
    setContentSections(updated);
  };

  const validationSchema = Yup.object({
    slug_title: Yup.string().trim().required("Slug Title is required"),
    meta_title: Yup.string().trim().required("Meta Title is required"),
    blog_title: Yup.string().trim().required("Blog Title is required"),
    meta_description: Yup.string()
      .trim()
      .required("Meta Description is required"),
  });

  const validateSections = () => {
    const newErrors = contentSections.map((section) => ({
      image: !section.image && !section.imagePreview,
      content: section.content.map((item) => ({
        title: !item.title.trim(),
        description: !item.description.trim(),
      })),
    }));
    setSectionErrors(newErrors);
    return newErrors.every((err) =>
      !err.image && err.content.every((c) => !c.title && !c.description)
    );
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      slug_title: slugTitle,
      meta_title: metaTitle,
      blog_title: blogTitle,
      meta_description: metaDescription,
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitAttempted(true);

      if (contentSections.length === 0) {
        toast.error("At least one section is required");
        return;
      }

      if (!metaImage && !metaImagePreview && !editId) {
        toast.error("Meta Image is required");
        return;
      }

      const newErrors = [];
      let hasErrors = false;

      for (let i = 0; i < contentSections.length; i++) {
        const section = contentSections[i];
        const error = { image: false, content: [] };

        if (!section.image && !section.imagePreview) {
          error.image = true;
          hasErrors = true;
        }

        const contentErrors = section.content.map((item) => ({
          title: !item.title.trim(),
          description: !item.description.trim(),
        }));

        if (contentErrors.some((c) => c.title || c.description)) {
          error.content = contentErrors;
          hasErrors = true;
        }

        newErrors.push(error);
      }

      setSectionErrors(newErrors);

      if (hasErrors) {
        toast.error("Please fix section errors before submitting.");
        return;
      }

      const formData = new FormData();
      formData.append("slug_title", values.slug_title);
      formData.append("meta_title", values.meta_title);
      formData.append("meta_description", values.meta_description);
      formData.append("blog_title", values.blog_title);
      formData.append("status", "1");

      if (metaImage) {
        formData.append("title_image", metaImage);
      }

      const trnData = contentSections.map((section, index) => {
        if (section.image) {
          formData.append(`content_img[${index}]`, section.image);
        }
        return {
          content_img: section.image?.name || section.imagePreview || "",
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

      try {
        const res = editId
          ? await api.put(`/nodesetup/meta_blog/${editId}`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            })
          : await api.post(`/nodesetup/meta_blog`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });

        if (res.data.status === 200) {
          toast.success(editId ? "Blog updated" : "Blog created");
          router.push("/blogsss");
        } else {
          toast.warning(res.data.message || "Something went wrong");
        }
      } catch (err) {
        console.error(err);
        toast.error("Submission failed");
      }
    },
  });

  const isFormValid = () =>
    formik.isValid &&
    (metaImage || metaImagePreview || editId) &&
    contentSections.length > 0 &&
    contentSections.every(
      (section) =>
        (section.image || section.imagePreview) &&
        section.content.some(
          (item) => item.title.trim() && item.description.trim()
        )
    );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-900">
            {editId ? "Edit Blog" : "Add Blog"}
          </h2>
          <button
            onClick={() => router.back()}
            className="bg-blue-900 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </button>
        </div>
        {/* Meta Fields */}
        <div className="space-y-6">
          {/* First Row: 3 equal input fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="mb-4">
              <input
                name="slug_title"
                value={formik.values.slug_title}
                onChange={(e) => {
                  formik.handleChange(e);
                  setSlugTitle(e.target.value);
                }}
                className="w-full p-3 rounded-lg border-2 border-gray-300"
                placeholder="Slug Title"
              />
              {formik.touched.slug_title && formik.errors.slug_title && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.slug_title}
                </p>
              )}
            </div>

            <div className="mb-4">
              <input
                name="meta_title"
                value={formik.values.meta_title}
                onChange={(e) => {
                  formik.handleChange(e);
                  setMetaTitle(e.target.value);
                }}
                className="w-full p-3 rounded-lg border-2 border-gray-300"
                placeholder="Meta Title"
              />
              {formik.touched.meta_title && formik.errors.meta_title && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.meta_title}
                </p>
              )}
            </div>

            <div className="mb-4">
              <input
                name="blog_title"
                value={formik.values.blog_title}
                onChange={(e) => {
                  formik.handleChange(e);
                  setBlogTitle(e.target.value);
                }}
                className="w-full p-3 rounded-lg border-2 border-gray-300"
                placeholder="Blog Title"
              />
              {formik.touched.blog_title && formik.errors.blog_title && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.blog_title}
                </p>
              )}
            </div>
          </div>

          {/* Second Row: Meta Description and Image Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Meta Description */}
            <div className="flex flex-col">
              <textarea
                placeholder="Meta Description"
                value={formik.values.meta_description}
                onChange={(e) => {
                  formik.handleChange(e);
                  setMetaDescription(e.target.value);
                }}
                rows={3}
                name="meta_description"
                className="w-full p-3 rounded-lg border-2 border-gray-300"
              />
              {formik.touched.meta_description &&
                formik.errors.meta_description && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.meta_description}
                  </p>
                )}
            </div>

            {/* Meta Image Upload */}
            <div className="flex flex-col">
              <input
                type="file"
                name="title_image"
                onChange={handleMetaImageChange}
                className="p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              {submitAttempted &&
                !metaImage &&
                !metaImagePreview &&
                !editId && (
                  <p className="text-red-500 text-sm mt-1">
                    Meta Image is required
                  </p>
                )}

              {metaImagePreview && (
                <img
                  src={metaImagePreview}
                  alt="Meta Preview"
                  className="w-full max-w-[160px] h-[160px] object-cover rounded-lg border mt-2 self-start"
                />
              )}
            </div>
          </div>
        </div>

        {/* Sections */}
        {contentSections.map((section, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl shadow-md mb-6 relative mt-8"
          >
            <h3 className="font-bold text-lg text-gray-700 mb-4">
              Section {i + 1}
            </h3>
            {contentSections.length > 1 && (
              <button
                onClick={() => removeSection(i)}
                className="absolute top-4 right-4 text-red-500 hover:underline text-sm"
              >
                Remove Section
              </button>
            )}
            {/* Section Image Upload + Preview */}
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex-1">
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    const updated = [...contentSections];
                    updated[i].image = file;
                    updated[i].imagePreview = file
                      ? URL.createObjectURL(file)
                      : null;
                    setContentSections(updated);
                  }}
                  className="w-full p-3 rounded-lg border-2 border-gray-300"
                />
                {sectionErrors[i]?.image && submitAttempted && (
                  <p className="text-red-500 text-sm mt-1">
                    Image is required for section {i + 1}
                  </p>
                )}
              </div>
              {section.imagePreview && (
                <img
                  src={section.imagePreview}
                  alt="Preview"
                  className="w-32 h-32 rounded-lg border"
                />
              )}
            </div>
            {/* Content: Title + Description + Remove */}
            {section.content.map((item, j) => (
              <div
                key={j}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 my-4 items-start"
              >
                <div>
                  <input
                    placeholder={`Title ${j + 1}`}
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...contentSections];
                      updated[i].content[j].title = e.target.value;
                      setContentSections(updated);
                    }}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {sectionErrors[i]?.content[j]?.title && submitAttempted && (
                    <p className="text-red-500 text-sm mt-1">
                      Title is required
                    </p>
                  )}
                </div>
                <div>
                  <textarea
                    placeholder={`Description ${j + 1}`}
                    value={item.description}
                    onChange={(e) => {
                      const updated = [...contentSections];
                      updated[i].content[j].description = e.target.value;
                      setContentSections(updated);
                    }}
                    className="p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {sectionErrors[i]?.content[j]?.description &&
                    submitAttempted && (
                      <p className="text-red-500 text-sm mt-1">
                        Description is required
                      </p>
                    )}
                </div>
                <button
                  onClick={() => {
                    const updated = [...contentSections];
                    updated[i].content.splice(j, 1);
                    setContentSections(updated);
                  }}
                  className="text-red-600 text-sm mt-1 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            {sectionErrors[i]?.content &&
              submitAttempted &&
              section.content.every(
                (item) => !item.title.trim() || !item.description.trim()
              ) && (
                <p className="text-red-500 text-sm mt-1">
                  At least one title and one description required
                </p>
              )}
            <button
              onClick={() => {
                const updated = [...contentSections];
                updated[i].content.push({ title: "", description: "" });
                setContentSections(updated);
              }}
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <PlusCircle size={18} />
              Title/Description
            </button>
            {!section.showPoints && (
              <button
                onClick={() => showPointSection(i)}
                className="text-blue-600 hover:underline flex items-center gap-1 mt-4"
              >
                <PlusCircle size={18} />
                Add Points
              </button>
            )}
            {section.showPoints && (
              <>
                <h4 className="text-md font-semibold mt-4 mb-2">Points</h4>
                {section.points.map((item, j) => (
                  <div
                    key={j}
                    className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 mb-2"
                  >
                    <input
                      placeholder={`Point Title ${j + 1}`}
                      value={item.title}
                      onChange={(e) => {
                        const updated = [...contentSections];
                        updated[i].points[j].title = e.target.value;
                        setContentSections(updated);
                      }}
                      className="p-3 border-2 rounded-lg"
                    />
                    <textarea
                      placeholder={`Point Description ${j + 1}`}
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...contentSections];
                        updated[i].points[j].description = e.target.value;
                        setContentSections(updated);
                      }}
                      className="p-3 border-2 rounded-lg"
                    />
                    <button
                      onClick={() => removePoint(i, j)}
                      className="text-red-500 text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addPoint(i)}
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
          onClick={addContentSection}
          className="text-blue-800 hover:underline flex items-center gap-2 mb-4"
        >
          <PlusCircle size={18} />
          Add Section
        </button>

        <button
          onClick={formik.handleSubmit}
          disabled={!isFormValid()}
          className={`w-full py-3 rounded-xl text-lg font-semibold transition-all duration-200 ${
            isFormValid()
              ? "bg-blue-800 text-white hover:bg-blue-900"
              : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
        >
          {editId ? "Update Blog" : "Submit Blog"}
        </button>
      </div>
    </div>
  );
}