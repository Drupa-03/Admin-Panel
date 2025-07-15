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

//========================================================================================================================================

import React, { useEffect, useState, useCallback } from "react";
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

  // Image validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const VALID_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
  ];


// Validation schema
const validationSchema = Yup.object({
  slug_title: Yup.string()
    .matches(/^[^\d]*$/, "Numbers are not allowed in Slug Title")
    .trim()
    .required("Slug Title is required"),
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
    .max(134, "Meta Description must be less than 134 characters"),
  meta_image: Yup.mixed().when("meta_image_preview", {
    is: (preview) => !preview && !editId,
    then: (schema) =>
      schema
        .required("Image is required")
        .test("fileSize", "File size must be less than 5MB", (value) =>
          value ? value.size <= 5 * 1024 * 1024 : true
        )
        .test("fileType", "Only JPG, PNG, PNG, WEBP, or AVIF files are allowed", (value) =>
          value ? ["image/jpeg", "image/png", "image/png", "image/webp", "image/avif"].includes(value.type) && !value.name.toLowerCase().endsWith(".jfif") : true
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
                value ? value.size <= 5 * 1024 * 1024 : true
              )
              .test("fileType", "Only JPG, PNG, PNG, WEBP, or AVIF files are allowed", (value) =>
                value ? ["image/jpeg", "image/png", "image/png", "image/webp", "image/avif"].includes(value.type) && !value.name.toLowerCase().endsWith(".jfif") : true
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
                  then: (schema) => schema.required("Title is required"),
                  otherwise: (schema) => schema.notRequired(),
                }),
              description: Yup.string()
                .trim()
                .when("isFirstItem", {
                  is: true,
                  then: (schema) => schema.required("Description is required"),
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
  // Formik initialization
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      slug_title: "",
      meta_title: "",
      blog_title: "",
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
    onSubmit: async (values) => {
      await handleSubmit(values);
    },
  });

  // Load data if in edit mode
  useEffect(() => {
    if (!router.isReady || !editId) return;

    const loadBlogData = async () => {
      try {
        const res = await api.get(`/nodesetup/meta_blog/${editId}`);
        const blog = res.data?.data;
        if (!blog) return;

        const parsedSections = blog.trnData.map((section, index) => ({
          image: null,
          imagePreview: section.content_img
            ? `${API_URL}/meta_blogs/${section.content_img}`
            : null,
          content: (section.content_description || []).map((c, idx) => ({
            title: c.sub_title || "",
            description: c.description || "",
            isFirstItem: index === 0 && idx === 0,
          })),
          showPoints: section.content_points?.length > 0,
          points: (section.content_points || []).map((p) => ({
            title: p.sub_title?.title || "",
            description: p.sub_title?.description || "",
          })),
        }));

        formik.setValues({
          slug_title: blog.slug_title || "",
          meta_title: blog.meta_title || "",
          blog_title: blog.blog_title || "",
          meta_description: blog.meta_description || "",
          meta_image: null,
          meta_image_preview: blog.title_image
            ? `${API_URL}/meta_blogs/${blog.title_image}`
            : null,
          contentSections: parsedSections,
        });

        if (blog.title_image) {
          setMetaImagePreview(`${API_URL}/meta_blogs/${blog.title_image}`);
        }
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
      if (
        !VALID_IMAGE_TYPES.includes(file.type) ||
        file.name.toLowerCase().endsWith(".jfif")
      ) {
        toast.error(
          "Only JPG, PNG, WEBP, AVIF, JPEG files are allowed. JFIF is not supported."
        );
        return;
      }

      formik.setFieldValue("meta_image", file);
      const previewUrl = URL.createObjectURL(file);
      formik.setFieldValue("meta_image_preview", previewUrl);
      setMetaImagePreview(previewUrl);
    },
    [formik]
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
        if (values.meta_image)
          formData.append("title_image", values.meta_image);

        const trnData = values.contentSections.map((section, index) => {
          if (section.image)
            formData.append(`content_img[${index}]`, section.image);

          return {
            content_img: section.image?.name || section.imagePreview || "",
            content_description: section.content.map((item) => ({
              sub_title: item.title,
              description: item.description,
            })),
            content_points: section.showPoints
              ? section.points.map((pt) => ({
                  sub_title: {
                    title: pt.title,
                    description: pt.description,
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
          router.push("/Blogs");
        } else {
          toast.warning(res.data.message || "Something went wrong");
        }
      } catch (err) {
        console.error("Submission error:", err);
        toast.error("Submission failed");
      }
    },
    [editId, router]
  );

  // Section management functions
  // const addContentSection = useCallback(() => {
  //   formik.setFieldValue("contentSections", [
  //     ...formik.values.contentSections,
  //     {
  //       image: null,
  //       imagePreview: null,
  //       content: [{ title: "", description: "", isFirstItem: false }],
  //       showPoints: false,
  //       points: [],
  //     },
  //   ]);
  // }, [formik]);

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
}, [formik]);


  const removeSection = useCallback(
    (sectionIndex) => {
      if (formik.values.contentSections.length === 1) {
        toast.error("At least one section is required");
        return;
      }
      formik.setFieldValue(
        "contentSections",
        formik.values.contentSections.filter(
          (_, index) => index !== sectionIndex
        )
      );
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
      newSections[sectionIndex].content = newSections[
        sectionIndex
      ].content.filter((_, index) => index !== contentIndex);
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
      newSections[sectionIndex].points = newSections[
        sectionIndex
      ].points.filter((_, index) => index !== pointIndex);
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
      if (
        !VALID_IMAGE_TYPES.includes(file.type) ||
        file.name.toLowerCase().endsWith(".jfif")
      ) {
        toast.error(
          "Only JPG, PNG, WEBP, AVIF, JPEG files are allowed. JFIF is not supported."
        );
        return;
      }

      const newSections = [...formik.values.contentSections];
      newSections[sectionIndex].image = file;
      newSections[sectionIndex].imagePreview = URL.createObjectURL(file);
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
      <div className="max-w-6xl mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-blue-900">
            {editId ? "Edit Blog" : "Add Blog"}
          </h2>
          <button
            onClick={() => router.push("/Blogs")}
            className="flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] transition-all duration-300 shadow-lg group cursor-pointer"
          >
            <ArrowLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform duration-300"
            />
            <span className="font-semibold">Back</span>
          </button>
        </div>

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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Meta Title <span className="text-red-500">*</span>
              </label>
              <input
                name="meta_title"
                value={formik.values.meta_title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Blog Title <span className="text-red-500">*</span>
              </label>
              <input
                name="blog_title"
                value={formik.values.blog_title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
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
                rows={6}
                className="w-full p-3 rounded-lg border-2 border-gray-300 text-sm"
              />
              {formik.touched.meta_description &&
                formik.errors.meta_description && (
                  <p className="text-red-500 text-sm mt-1">
                    {formik.errors.meta_description}
                  </p>
                )}
            </div>

            <div className="flex flex-col mt-8">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Image <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="meta_image"
                onChange={handleMetaImageChange}
                className="p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
              {formik.touched.meta_image && formik.errors.meta_image && (
                <p className="text-red-500 text-sm mt-1">
                  {formik.errors.meta_image}
                </p>
              )}
              {metaImagePreview && (
                <ReactModalImage
                  small={metaImagePreview}
                  large={metaImagePreview}
                  alt="Meta Preview"
                  className="w-30 h-30 object-cover rounded-lg border mt-2 self-start"
                />
              )}
            </div>
          </div>

          {formik.values.contentSections.map((section, sectionIndex) => (
            <div
              key={sectionIndex}
              className="bg-white p-6 rounded-xl shadow-md mb-6 relative mt-8"
            >
              <h3 className="font-bold text-lg text-gray-700 mb-4">
                Section {sectionIndex + 1}
              </h3>

              {sectionIndex > 0 && (
                <button
                  type="button"
                  onClick={() => removeSection(sectionIndex)}
                  className="absolute top-4 right-4 px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer duration-300m"
                >
                  Remove
                </button>
              )}

              <div className="flex flex-col md:items-start gap-4">
                <div className="w-full">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Image <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleSectionImageChange(e, sectionIndex)}
                    className="w-full p-3 rounded-lg border-2 border-gray-300"
                  />
                  {formik.touched.contentSections?.[sectionIndex]?.image &&
                    formik.errors.contentSections?.[sectionIndex]?.image && (
                      <p className="text-red-500 text-sm mt-1">
                        {formik.errors.contentSections[sectionIndex].image}
                      </p>
                    )}
                </div>
                {section.imagePreview && (
                  <ReactModalImage
                    small={section.imagePreview}
                    large={section.imagePreview}
                    alt="Preview"
                    className="w-32 h-32 rounded-lg border"
                  />
                )}
              </div>

              {section.content.map((item, contentIndex) => (
                <div
                  key={contentIndex}
                  className="relative p-4 border border-gray-200 rounded-lg my-4 bg-gray-50"
                >
                  {contentIndex > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeContentItem(sectionIndex, contentIndex)
                      }
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
                        onChange={(e) =>
                          handleContentChange(
                            e,
                            sectionIndex,
                            contentIndex,
                            "title"
                          )
                        }
                        onBlur={() =>
                          formik.setFieldTouched(
                            `contentSections[${sectionIndex}].content[${contentIndex}].title`,
                            true
                          )
                        }
                        className="w-full p-2.5 border border-gray-300 rounded-md focus:border-transparent"
                      />
                      {formik.touched.contentSections?.[sectionIndex]
                        ?.content?.[contentIndex]?.title &&
                        formik.errors.contentSections?.[sectionIndex]
                          ?.content?.[contentIndex]?.title && (
                          <p className="text-red-500 text-sm mt-1">
                            {
                              formik.errors.contentSections[sectionIndex]
                                .content[contentIndex].title
                            }
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
                        onChange={(e) =>
                          handleContentChange(
                            e,
                            sectionIndex,
                            contentIndex,
                            "description"
                          )
                        }
                        onBlur={() =>
                          formik.setFieldTouched(
                            `contentSections[${sectionIndex}].content[${contentIndex}].description`,
                            true
                          )
                        }
                        rows={3}
                        className="w-full p-2.5 border border-gray-300 rounded-md resize-y focus:border-transparent"
                      />
                      {formik.touched.contentSections?.[sectionIndex]
                        ?.content?.[contentIndex]?.description &&
                        formik.errors.contentSections?.[sectionIndex]
                          ?.content?.[contentIndex]?.description && (
                          <p className="text-red-500 text-sm mt-1">
                            {
                              formik.errors.contentSections[sectionIndex]
                                .content[contentIndex].description
                            }
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
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                            onChange={(e) =>
                              handlePointChange(
                                e,
                                sectionIndex,
                                pointIndex,
                                "title"
                              )
                            }
                            onBlur={() =>
                              formik.setFieldTouched(
                                `contentSections[${sectionIndex}].points[${pointIndex}].title`,
                                true
                              )
                            }
                            className="w-full p-2 border-2 border-gray-300 h-12 rounded-md"
                          />
                          {formik.touched.contentSections?.[sectionIndex]
                            ?.points?.[pointIndex]?.title &&
                            formik.errors.contentSections?.[sectionIndex]
                              ?.points?.[pointIndex]?.title && (
                              <p className="text-red-500 text-sm mt-1">
                                {
                                  formik.errors.contentSections[sectionIndex]
                                    .points[pointIndex].title
                                }
                              </p>
                            )}
                        </div>
                        <textarea
                          placeholder={`Point Description ${pointIndex + 1}`}
                          value={item.description}
                          onChange={(e) =>
                            handlePointChange(
                              e,
                              sectionIndex,
                              pointIndex,
                              "description"
                            )
                          }
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

          {formik.errors.contentSections &&
            typeof formik.errors.contentSections === "string" && (
              <p className="text-red-500 text-sm mt-1">
                {formik.errors.contentSections}
              </p>
            )}

          <button
            type="button"
            onClick={addContentSection}
            className="text-blue-800 hover:underline flex items-center gap-2 mb-4"
          >
            <PlusCircle size={18} />
            Add Section
          </button>

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
  );
}
