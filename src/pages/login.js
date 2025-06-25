import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import api from "@/utills/api";
import { setAuthTokens, startRefreshTimer } from "@/utills/auth";
import { toast } from "react-toastify";
export default function Login() {
  const router = useRouter();
  console.log(router)
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    role: "1",
    mobile: "",
    password: "",
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const validateField = (name, value) => {
    let error = "";
    if (name === "mobile") {
      if (!value) error = "Mobile number is required";
      else if (!/^\d{10}$/.test(value))
        error = "Enter valid 10-digit mobile number";
    } else if (name === "password") {
      if (!value) error = "Password is required";
      else if (value.length < 8)
        error = "Password must be at least 8 characters";
    }
    return error;
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: fieldError }));
    }
  };
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formValues).forEach((key) => {
      if (key !== "role") {
        const fieldError = validateField(key, formValues[key]);
        if (fieldError) newErrors[key] = fieldError;
      }
    });
    setErrors(newErrors);
    setTouched({ mobile: true, password: true });
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/nodesetup/auth/login", {
        mobile: formValues.mobile,
        password: formValues.password,
      });
      const data = res.data;
      console.log("Login response:", data); // Debug
      if (data.status === 200) {
        const accessToken = data.data.token; // Fix: Use data.token
        const refreshToken = data.data.refresh_token; // Correct
        if (!accessToken || !refreshToken) {
          throw new Error("Missing tokens in response");
        }
//  Use setAuthTokens to store tokens consistently
       setAuthTokens(accessToken, refreshToken);
        // Store Auth object
        localStorage.setItem(
          "Auth",
          JSON.stringify({
            token: accessToken,
            user_type: data.data.user_type,
            role_id: data.data.role_id,
            id: data.data.user_id
          })
        );
        console.log(
          "Saved access_token:",
          localStorage.getItem("access_token")
        ); // Debug
        console.log(
          "Saved refresh_token:",
          localStorage.getItem("refresh_token")
        ); // Debug
        console.log("Saved Auth:", localStorage.getItem("Auth")); // Debug
      toast.success("Login successful! Redirecting to Dashboard..")

        router.push("/dashboard");
        
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMessage =
        err?.response?.data?.result?.errors?.length > 0
          ? err.response.data.result.errors[0].msg
          : "An error occurred during login";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
 



 return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300'>
      <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl flex backdrop-blur-sm bg-opacity-95 dark:bg-opacity-70'>
        <div className='w-full lg:w-1/2 p-8'>
          <div className='flex justify-between items-center mb-8'>
            <h1 className='text-2xl font-semibold text-[#004B8F] dark:text-white'>
              Sign In
            </h1>
            <Image
              src='/images/azzip-blue.png'
              alt='Azzip Logo'
              width={130}
              height={60}
            />
          </div>
          <div className='space-y-4'>
            <div>
              <label className='block text-[#004B8F] dark:text-white mb-2'>
                Mobile
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-4 text-gray-400 dark:text-gray-300 w-4 h-4' />
                <input
                  type='text'
                  name='mobile'
                  value={formValues.mobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder='Enter your mobile number'
                  className='w-full pl-10 p-3 border border-[#004B8F]/20 dark:border-white/20 dark:bg-gray-700 dark:text-white rounded-lg'
                />
              </div>
              {touched.mobile && errors.mobile && (
                <p className='text-red-500 text-sm mt-1'>{errors.mobile}</p>
              )}
            </div>
            <div>
              <label className='block text-[#004B8F] dark:text-white mb-2'>
                Password
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-4 text-gray-400 dark:text-gray-300 w-4 h-4' />
                <input
                  type='password'
                  name='password'
                  value={formValues.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder='Enter your password'
                  className='w-full pl-10 p-3 border border-[#004B8F]/20 dark:border-white/20 dark:bg-gray-700 dark:text-white rounded-lg'
                />
              </div>
              {touched.password && errors.password && (
                <p className='text-red-500 text-sm mt-1'>{errors.password}</p>
              )}
            </div>
            {error && <p className='text-red-500 text-center'>{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className='w-full bg-[#004B8F] dark:bg-blue-700 text-white py-3 px-4 rounded-lg disabled:opacity-50 shadow-lg font-medium'>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </div>
        <div className='hidden lg:block lg:w-1/2 relative overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-br from-[#004B8F] via-purple-600 to-[#004B8F] opacity-90'></div>
          <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent'></div>
          <div className='relative h-full flex flex-col items-center justify-center text-white p-8'>
            <div className='text-center space-y-6'>
              <div className='w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm'>
                <div className='w-16 h-16 bg-white/30 rounded-full flex items-center justify-center'>
                  <div className='w-8 h-8 bg-white rounded-full'></div>
                </div>
              </div>
              <p className='text-blue-100 text-lg max-w-xs'>
                Sign in to access your dashboard and manage your account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




// import React, { useState } from "react";
// import { Mail, Lock } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/router";
// import api from "@/utills/api";
// import { setAuthTokens, startRefreshTimer } from "@/utills/auth";
// import { toast } from "react-toastify";
// export default function Login() {
//   const router = useRouter();
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [formValues, setFormValues] = useState({
//     role: "1",
//     mobile: "",
//     password: "",
//   });
//   const [touched, setTouched] = useState({});
//   const [errors, setErrors] = useState({});
//   const validateField = (name, value) => {
//     let error = "";
//     if (name === "mobile") {
//       if (!value) error = "Mobile number is required";
//       else if (!/^\d{10}$/.test(value))
//         error = "Enter valid 10-digit mobile number";
//     } else if (name === "password") {
//       if (!value) error = "Password is required";
//       else if (value.length < 8)
//         error = "Password must be at least 8 characters";
//     }
//     return error;
//   };
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormValues((prev) => ({ ...prev, [name]: value }));
//     if (touched[name]) {
//       const fieldError = validateField(name, value);
//       setErrors((prev) => ({ ...prev, [name]: fieldError }));
//     }
//   };
//   const handleBlur = (e) => {
//     const { name, value } = e.target;
//     setTouched((prev) => ({ ...prev, [name]: true }));
//     const fieldError = validateField(name, value);
//     setErrors((prev) => ({ ...prev, [name]: fieldError }));
//   };
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const newErrors = {};
//     Object.keys(formValues).forEach((key) => {
//       if (key !== "role") {
//         const fieldError = validateField(key, formValues[key]);
//         if (fieldError) newErrors[key] = fieldError;
//       }
//     });
//     setErrors(newErrors);
//     setTouched({ mobile: true, password: true });
//     if (Object.keys(newErrors).length > 0) return;
//     setLoading(true);
//     setError("");
//     try {
//       const res = await api.post("/nodesetup/auth/login", {
//         mobile: formValues.mobile,
//         password: formValues.password,
//       });
//       const data = res.data;
//       console.log("Login response:", data);
//       if (res.status === 200) {
//         const accessToken = data.data.token;
//         const refreshToken = data.data.refresh_token;
//         if (!accessToken || !refreshToken) {
//           throw new Error("Missing tokens in response");
//         }
//         // Use setAuthTokens to store tokens consistently
//         setAuthTokens(accessToken, refreshToken);
//         // Store Auth object
//         localStorage.setItem(
//           "Auth",
//           JSON.stringify({
//             token: accessToken,
//             user_type: data.data.user_type,
//             role_id: data.data.role_id,
//           })
//         );
//         console.log(
//           "Saved access_token:",
//           localStorage.getItem("access_token")
//         );
//         console.log(
//           "Saved refresh_token:",
//           localStorage.getItem("refresh_token")
//         );
//         console.log("Saved Auth:", localStorage.getItem("Auth"));
//         // Show success toast
//         toast.success("Login successful! Redirecting to dashboard...");
//         // Delay navigation to ensure localStorage is updated
//         router.push("/dashboard"); // Use lowercase /dashboard and replace
//         // setTimeout(() => {
//         //   window.location.reload();
//         // }, 200);
//       } else {
//         setError(data.message || "Login failed");
//         toast.error(data.message || "Login failed");
//       }
//     } catch (err) {
//       console.error("Login error:", err);
//       const errorMessage =
//         err?.response?.data?.result?.errors?.length > 0
//           ? err.response.data.result.errors[0].msg
//           : "An error occurred during login";
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <div className='min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300'>
//       <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl flex backdrop-blur-sm bg-opacity-95 dark:bg-opacity-70'>
//         <div className='w-full lg:w-1/2 p-8'>
//           <div className='flex justify-between items-center mb-8'>
//             <h1 className='text-2xl font-semibold text-[#004B8F] dark:text-white'>
//               Sign In
//             </h1>
//             <Image
//               src='/images/azzip-blue.png'
//               alt='Azzip Logo'
//               width={130}
//               height={60}
//             />
//           </div>
//           <div className='space-y-4'>
//             <div>
//               <label className='block text-[#004B8F] dark:text-white mb-2'>
//                 Mobile
//               </label>
//               <div className='relative'>
//                 <Mail className='absolute left-3 top-4 text-gray-400 dark:text-gray-300 w-4 h-4' />
//                 <input
//                   type='text'
//                   name='mobile'
//                   value={formValues.mobile}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   placeholder='Enter your mobile number'
//                   className='w-full pl-10 p-3 border border-[#004B8F]/20 dark:border-white/20 dark:bg-gray-700 dark:text-white rounded-lg'
//                 />
//                 {touched.mobile && errors.mobile && (
//                   <p className='text-red-500 text-sm mt-1'>{errors.mobile}</p>
//                 )}
//               </div>
//               <div>
//                 <label className='block text-[#004B8F] dark:text-white mb-2'>
//                   Password
//                 </label>
//                 <div className='relative'>
//                   <Lock className='absolute left-3 top-4 text-gray-400 dark:text-gray-300 w-4 h-4' />
//                   <input
//                     type='password'
//                     name='password'
//                     value={formValues.password}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     placeholder='Enter your password'
//                     className='w-full pl-10 p-3 border border-[#004B8F]/20 dark:border-white/20 dark:bg-gray-700 dark:text-white rounded-lg'
//                   />
//                   {touched.password && errors.password && (
//                     <p className='text-red-500 text-sm mt-1'>
//                       {errors.password}
//                     </p>
//                   )}
//                 </div>
//               </div>
//               {error && <p className='text-red-500 text-center'>{error}</p>}
//               <button
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 className='w-full bg-[#004B8F] dark:bg-blue-700 text-white py-3 px-4 rounded-lg disabled:opacity-50 shadow-lg font-medium'>
//                 {loading ? "Logging in..." : "Login"}
//               </button>
//             </div>
//           </div>
//           <div className='hidden lg:block lg:w-1/2 relative overflow-hidden'>
//             <div className='absolute inset-0 bg-gradient-to-br from-[#004B8F] via-purple-600 to-[#004B8F] opacity-90'></div>
//             <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent'></div>
//             <div className='relative h-full flex flex-col items-center justify-center text-white p-8'>
//               <div className='text-center space-y-6'>
//                 <div className='w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm'>
//                   <div className='w-16 h-16 bg-white/30 rounded-full flex items-center justify-center'>
//                     <div className='w-8 h-8 bg-white rounded-full'></div>
//                   </div>
//                 </div>
//                 <p className='text-blue-100 text-lg max-w-xs'>
//                   Sign in to access your dashboard and manage your account
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
