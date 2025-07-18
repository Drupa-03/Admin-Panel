// import { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import api from "@/utills/api";
// import { toast } from "react-toastify";
// import usePermission from "./hooks/usePermission";
// import { ArrowLeft, Save } from "lucide-react";

// export default function AddStaff() {
//   const router = useRouter();
//   const params = useSearchParams();
//   const staffId = params.get("id");
//   const isEditMode = !!staffId;

//   const { is_add, is_update } = usePermission("manage_staff");

//   const [staff, setStaff] = useState({
//     username: "",
//     email: "",
//     mobile: "",
//     password: "",
//     role_id: "",
//   });

//   useEffect(() => {
//     if (isEditMode) {
//       api.get(`/nodesetup/staff/${staffId}`).then((res) => {
//         const { username, email, mobile, role_id } = res.data.data;
//         setStaff({ username, email, mobile, password: "********", role_id });
//       });
//     }
//   }, [staffId]);

//   const handleChange = (field, value) => {
//     setStaff((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleSubmit = async () => {
//     const { username, email, mobile, password, role_id } = staff;
//     if (!username || !email || !mobile || (!isEditMode && !password) || !role_id) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     try {
//       if (isEditMode) {
//         const payload = { username, email, mobile, role_id };
//         if (password !== "********") payload.password = password;
//         await api.put(`/nodesetup/staff/${staffId}`, payload);
//         toast.success("Staff updated successfully");
//       } else {
//         await api.post("/nodesetup/staff", staff);
//         toast.success("Staff added successfully");
//       }
//       router.push("/staff");
//     } catch (err) {
//       toast.error("Something went wrong");
//     }
//   };

//   if (!is_add && !isEditMode) return <p>You do not have permission to add staff.</p>;
//   if (isEditMode && !is_update) return <p>You do not have permission to edit staff.</p>;

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-12 px-4 sm:px-6 md:px-8">
//       <div className="max-w-6xl mx-auto py-10">
//         <div className="flex items-center justify-between mb-6">
//           <h1 className="text-3xl font-bold text-[#004b8f] dark:text-white">
//             {isEditMode ? "Edit Staff" : "Add Staff"}
//           </h1>
//           <button onClick={() => router.back()} className="bg-[#004b8f] text-white px-4 py-3 rounded-xl flex items-center gap-2">
//             <ArrowLeft size={16} /> Back
//           </button>
//         </div>

//         <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-[#004b8f]/20 shadow space-y-6">
//           <div className="grid sm:grid-cols-2 gap-6">
//             <div>
//               <label className="block font-semibold mb-1">Username</label>
//               <input type="text" value={staff.username} onChange={(e) => handleChange("username", e.target.value)} className="w-full px-4 py-2 rounded border bg-gray-100" placeholder="Enter username" />
//             </div>

//             <div>
//               <label className="block font-semibold mb-1">Email</label>
//               <input type="email" value={staff.email} onChange={(e) => handleChange("email", e.target.value)} className="w-full px-4 py-2 rounded border bg-gray-100" placeholder="Enter email" />
//             </div>

//             <div>
//               <label className="block font-semibold mb-1">Mobile Number</label>
//               <input type="text" value={staff.mobile} onChange={(e) => handleChange("mobile", e.target.value)} className="w-full px-4 py-2 rounded border bg-gray-100" placeholder="Enter mobile number" />
//             </div>

//             <div>
//               <label className="block font-semibold mb-1">Password {isEditMode && <span className="text-sm text-gray-500">(leave unchanged if not updating)</span>}</label>
//               <input type="password" value={staff.password} onChange={(e) => handleChange("password", e.target.value)} className="w-full px-4 py-2 rounded border bg-gray-100" placeholder="Enter password" />
//             </div>

//             <div>
//               <label className="block font-semibold mb-1">Role ID</label>
//               <input type="number" value={staff.role_id} onChange={(e) => handleChange("role_id", e.target.value)} className="w-full px-4 py-2 rounded border bg-gray-100" placeholder="Enter role ID" />
//             </div>
//           </div>

//           <div className="flex justify-center">
//             <button onClick={handleSubmit} className="bg-[#004b8f] hover:bg-[#003a75] text-white px-6 py-3 rounded-xl flex items-center gap-2">
//               {isEditMode ? "Update" : "Save"}
//               <Save size={18} />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/utills/api";
import { toast } from "react-toastify";
import usePermission from "./hooks/usePermission";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ArrowLeft, Save } from "lucide-react";

export default function AddStaff() {
  const router = useRouter();
  const params = useSearchParams();
  const staffId = params.get("id");
  const isEditMode = !!staffId;
  const [loading, setLoading] = useState(false);
  const { is_add, is_update } = usePermission("manage_staff");

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      mobile: "",
      password: "",
      role_id: "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      username: Yup.string().required("Username is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      mobile: Yup.string()
        .matches(/^\d{10}$/, "Enter a valid 10-digit mobile")
        .required("Mobile is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        if (isEditMode) {
          const payload = {
            username: values.username,
            email: values.email,
            mobile: values.mobile,
            role_id: parseInt(values.role_id, 10)
          };
          if (values.password !== "********") {
            payload.password = values.password;
          }
          await api.put(`/nodesetup/staff/${staffId}`, payload);
          toast.success("Staff updated successfully");
        } else {
          await api.post("/nodesetup/staff", values);
          toast.success("Staff added successfully");
        }
        router.push("/staff");
      } catch (err) {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      api
        .get(`/nodesetup/staff/${staffId}`)
        .then((res) => {
          const data = res.data.data;
          formik.setValues({
            username: data.username || "",
            email: data.email || "",
            mobile: data.mobile || "",
            password: "********",
            role_id: data.role_id || 2
          });
        })
        .finally(() => setLoading(false));
    }
  }, [staffId]);

  if (!is_add && !isEditMode)
    return <p>You do not have permission to add staff.</p>;
  if (isEditMode && !is_update)
    return <p>You do not have permission to edit staff.</p>;

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-16 px-4 sm:px-6 md:px-8'>
        <div className='max-w-6xl mx-auto py-10 flex justify-center items-center'>
          <div className='text-xl text-gray-600 dark:text-gray-300'>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 lg:pl-64 pt-12 px-4 sm:px-6 md:px-8'>
      <div className='max-w-6xl mx-auto py-10'>
        <div className='flex items-center justify-between mb-8'>
          <h1 className='text-3xl font-bold text-[#004b8f] dark:text-white'>
            {isEditMode ? "Edit Staff" : "Add Staff"}
          </h1>
          <button
            onClick={() => router.back()}
            className='group flex items-center gap-2 px-6 py-3 bg-[#004b8f] text-white rounded-xl hover:bg-[#003d73] cursor-pointer duration-300'>
            <ArrowLeft
              size={18}
              className='group-hover:-translate-x-1 transition-transform duration-300'
            />
            <span>Back</span>
          </button>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className='bg-white dark:bg-gray-800 border-2 border-[#004b8f]/20 rounded-2xl shadow-lg p-8 space-y-6'>
          <div className='grid sm:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                Username <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='username'
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder='Enter username'
                className='w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
              />
              {formik.touched.username && formik.errors.username && (
                <div className='text-red-500 text-sm mt-1'>
                  {formik.errors.username}
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                Email <span className='text-red-500'>*</span>
              </label>
              <input
                type='email'
                name='email'
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder='Enter email'
                className='w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
              />
              {formik.touched.email && formik.errors.email && (
                <div className='text-red-500 text-sm mt-1'>
                  {formik.errors.email}
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                Mobile Number <span className='text-red-500'>*</span>
              </label>
              <input
                type='tel'
                name='mobile'
                value={formik.values.mobile}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder='Enter mobile number'
                className='w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
              />
              {formik.touched.mobile && formik.errors.mobile && (
                <div className='text-red-500 text-sm mt-1'>
                  {formik.errors.mobile}
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2'>
                Password <span className='text-red-500'>*</span>{" "}
                {isEditMode && (
                  <span className='text-sm text-gray-500'>
                    (leave unchanged if not updating)
                  </span>
                )}
              </label>
              <input
                type='password'
                name='password'
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder='Enter password'
                className='w-full px-4 py-3 rounded-xl border bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'
              />
              {formik.touched.password && formik.errors.password && (
                <div className='text-red-500 text-sm mt-1'>
                  {formik.errors.password}
                </div>
              )}
            </div>
          </div>

          <div className='space-y-4'>
            <p className='text-sm text-gray-500 dark:text-gray-400 '>
              ➡️ All fields marked with  
              <span className='text-red-500'> *</span> are mandatory.
            </p>
            <div className='flex justify-center'>
              <button
                type='submit'
                className='bg-[#004b8f] hover:bg-[#003a75] text-white px-6 py-3 rounded-xl flex justify-center items-center gap-2'>
                <Save size={18} />{" "}
                {isEditMode ? "Update Details" : "Save Details"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
