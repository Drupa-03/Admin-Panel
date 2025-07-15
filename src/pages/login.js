import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import api from "@/utills/api";
import { setAuthTokens } from "@/utills/auth";
import { toast } from "react-toastify";

export default function Login() {
  const router = useRouter();
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

      if (data.status === 200) {
        const accessToken = data.data.token;
        const refreshToken = data.data.refresh_token;

        if (!accessToken || !refreshToken) {
          const errorMessage = data?.data || "Login failed";
          setError(errorMessage);
          toast.error(errorMessage);
          return;
        }

        setAuthTokens(accessToken, refreshToken);
        localStorage.setItem(
          "Auth",
          JSON.stringify({
            token: accessToken,
            user_type: data.data.user_type,
            role_id: data.data.role_id,
            id: data.data.user_id,
          })
        );

        toast.success("Login successful! Redirecting to Dashboard...");
        router.push("/dashboard");
      } else {
        const errorMessage = data?.data || "Login failed";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      console.error("Login error:", err);
      let errorMessage = "Invalid mobile number or password";

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl flex backdrop-blur-sm bg-opacity-95 dark:bg-opacity-70">
        <div className="w-full lg:w-1/2 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold text-[#004B8F] dark:text-white">
              Sign In
            </h1>
            <Image
              src="/images/azzip-blue.png"
              alt="Azzip Logo"
              width={130}
              height={60}
            />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#004B8F] dark:text-white mb-2">
                Mobile
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-4 text-gray-400 dark:text-gray-300 w-4 h-4" />
                <input
                  type="text"
                  name="mobile"
                  value={formValues.mobile}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your mobile number"
                  className="w-full pl-10 p-3 border border-[#004B8F]/20 dark:border-white/20 dark:bg-gray-700 dark:text-white rounded-lg"
                />
              </div>
              {touched.mobile && errors.mobile && (
                <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
              )}
            </div>
            <div>
              <label className="block text-[#004B8F] dark:text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-4 text-gray-400 dark:text-gray-300 w-4 h-4" />
                <input
                  type="password"
                  name="password"
                  value={formValues.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  className="w-full pl-10 p-3 border border-[#004B8F]/20 dark:border-white/20 dark:bg-gray-700 dark:text-white rounded-lg"
                />
              </div>
              {touched.password && errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            {error && <p className="text-red-500 text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#004B8F] dark:bg-blue-700 text-white py-3 px-4 rounded-lg disabled:opacity-50 shadow-lg font-medium"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#004B8F] via-purple-600 to-[#004B8F] opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          <div className="relative h-full flex flex-col items-center justify-center text-white p-8">
            <div className="text-center space-y-6">
              <div className="w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
              </div>
              <p className="text-blue-100 text-lg max-w-xs">
                Sign in to access your dashboard and manage your account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------sign-In button animation----------------------------------------------------------

// import React, { useState, useEffect } from "react";
// import { Mail, Lock } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/router";
// import api from "@/utills/api";
// import { setAuthTokens } from "@/utills/auth";
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

//   // Animation states
//   const [buttonPosition, setButtonPosition] = useState("no-shift");
//   const [animationMessage, setAnimationMessage] = useState(
    
//   );
//   const [messageColor, setMessageColor] = useState("#fa2929");

//   const positions = ["shift-left", "shift-top", "shift-right", "shift-bottom"];

//   // Define isEmpty here so it can be used throughout the component
//   const isEmpty = formValues.mobile === "" || formValues.password === "";

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

//   const shiftButton = () => {
//     if (isEmpty) {
//       const currentIndex = positions.indexOf(buttonPosition);
//       const nextIndex = (currentIndex + 1) % positions.length;
//       setButtonPosition(positions[nextIndex]);
      
//       setMessageColor("#fa2929");
//     }
//   };

//   useEffect(() => {
//     if (!isEmpty) {
//       setButtonPosition("no-shift");
      
//       setMessageColor("#92ff92");
//     } else {
      
//       setMessageColor("#fa2929");
//     }
//   }, [formValues.mobile, formValues.password, isEmpty]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (isEmpty) {
//       shiftButton();
//       return;
//     }

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

//       if (data.status === 200) {
//         const accessToken = data.data.token;
//         const refreshToken = data.data.refresh_token;

//         if (!accessToken || !refreshToken) {
//           const errorMessage = data?.data || "Login failed";
//           setError(errorMessage);
//           toast.error(errorMessage);
//           return;
//         }

//         setAuthTokens(accessToken, refreshToken);
//         localStorage.setItem(
//           "Auth",
//           JSON.stringify({
//             token: accessToken,
//             user_type: data.data.user_type,
//             role_id: data.data.role_id,
//             id: data.data.user_id,
//           })
//         );

//         toast.success("Login successful! Redirecting to Dashboard...");
//         router.push("/dashboard");
//       } else {
//         const errorMessage = data?.data || "Login failed";
//         setError(errorMessage);
//         toast.error(errorMessage);
//       }
//     } catch (err) {
//       console.error("Login error:", err);
//       let errorMessage = "Invalid mobile number or password";
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getButtonTransform = () => {
//     switch (buttonPosition) {
//       case "shift-left":
//         return "translateX(-120%)";
//       case "shift-right":
//         return "translateX(120%)";
//       case "shift-top":
//         return "translateY(-120%)";
//       case "shift-bottom":
//         return "translateY(120%)";
//       default:
//         return "translate(0%, 0%)";
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
//       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden w-full max-w-4xl flex backdrop-blur-sm bg-opacity-95 dark:bg-opacity-70">
//         <div className="w-full lg:w-1/2 p-8">
//           <div className="flex justify-between items-center mb-8">
//             <h1 className="text-2xl font-semibold text-[#004B8F] dark:text-white">
//               Sign In
//             </h1>
//             <Image
//               src="/images/azzip-blue.png"
//               alt="Azzip Logo"
//               width={130}
//               height={60}
//             />
//           </div>

//           {/* Animation Message */}
//           <div className="mb-4">
//             <p className="text-sm" style={{ color: messageColor }}>
//               {animationMessage}
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-[#004B8F] dark:text-white mb-2">
//                 Mobile
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-4 text-gray-400 dark:text-gray-300 w-4 h-4" />
//                 <input
//                   type="text"
//                   name="mobile"
//                   value={formValues.mobile}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   placeholder="Enter your mobile number"
//                   className="w-full pl-10 p-3 border border-[#004B8F]/20 dark:border-white/20 dark:bg-gray-700 dark:text-white rounded-lg"
//                 />
//               </div>
//               {touched.mobile && errors.mobile && (
//                 <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
//               )}
//             </div>
//             <div>
//               <label className="block text-[#004B8F] dark:text-white mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-4 text-gray-400 dark:text-gray-300 w-4 h-4" />
//                 <input
//                   type="password"
//                   name="password"
//                   value={formValues.password}
//                   onChange={handleChange}
//                   onBlur={handleBlur}
//                   placeholder="Enter your password"
//                   className="w-full pl-10 p-3 border border-[#004B8F]/20 dark:border-white/20 dark:bg-gray-700 dark:text-white rounded-lg"
//                 />
//               </div>
//               {touched.password && errors.password && (
//                 <p className="text-red-500 text-sm mt-1">{errors.password}</p>
//               )}
//             </div>
//             {error && <p className="text-red-500 text-center">{error}</p>}

//             {/* Animated Button Container */}
//             <div
//               className="relative py-4 flex justify-center"
//               onMouseEnter={shiftButton}
//             >
//               <button
//                 type="submit"
//                 disabled={loading || isEmpty}
//                 onMouseEnter={shiftButton}
//                 onTouchStart={shiftButton}
//                 className="bg-[#004B8F] dark:bg-blue-700 text-white py-3 px-4 rounded-lg  shadow-lg font-medium transition-all duration-300"
//                 style={{
//                   transform: getButtonTransform(),
//                   cursor: isEmpty ? "not-allowed" : "pointer",
//                 }}
//               >
//                 {loading ? "Signing in..." : "Sign In"}
//               </button>
//             </div>
//           </form>
//         </div>
//         <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-br from-[#004B8F] via-purple-600 to-[#004B8F] opacity-90"></div>
//           <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
//           <div className="relative h-full flex flex-col items-center justify-center text-white p-8">
//             <div className="text-center space-y-6">
//               <div className="w-32 h-32 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
//                 <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
//                   <div className="w-8 h-8 bg-white rounded-full"></div>
//                 </div>
//               </div>
//               <p className="text-blue-100 text-lg max-w-xs">
//                 Sign in to access your dashboard and manage your account
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

//----------------------------------------------------------animation----------------------------------------------------------------------

// import React, { useState } from "react";
// import { Mail, Lock } from "lucide-react";
// import Image from "next/image";
// import { useRouter } from "next/router";
// import api from "@/utills/api";
// import { setAuthTokens } from "@/utills/auth";
// import { toast } from "react-toastify";
// import Head from "next/head";

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
//   const [isHovered, setIsHovered] = useState(false);

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

//       if (data.status === 200) {
//         const accessToken = data.data.token;
//         const refreshToken = data.data.refresh_token;

//         if (!accessToken || !refreshToken) {
//           const errorMessage = data?.data || "Login failed";
//           setError(errorMessage);
//           toast.error(errorMessage);
//           return;
//         }

//         setAuthTokens(accessToken, refreshToken);
//         localStorage.setItem(
//           "Auth",
//           JSON.stringify({
//             token: accessToken,
//             user_type: data.data.user_type,
//             role_id: data.data.role_id,
//             id: data.data.user_id,
//           })
//         );

//         toast.success("Login successful! Redirecting to Dashboard...");
//         router.push("/dashboard");
//       } else {
//         const errorMessage = data?.data || "Login failed";
//         setError(errorMessage);
//         toast.error(errorMessage);
//       }
//     } catch (err) {
//       console.error("Login error:", err);
//       let errorMessage = "Invalid mobile number or password";

//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <Head>
//         <style>{`
//           @property --a {
//             syntax: "<angle>";
//             inherits: false;
//             initial-value: 0deg;
//           }

//           .animated-box {
//             position: relative;
//             width: 400px;
//             height: 200px;
//             background: repeating-conic-gradient(
//               from var(--a),
//               #ff2770 0%,
//               #ff2770 5%,
//               transparent 5%,
//               transparent 40%,
//               #ff2770 50%
//             );
//             filter: drop-shadow(0 15px 50px rgba(0,0,0,0.2));
//             border-radius: 20px;
//             animation: rotating 4s linear infinite;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             transition: all 0.5s ease;
//           }

//           .dark .animated-box {
//             background: repeating-conic-gradient(
//               from var(--a),
//               #45f3ff 0%,
//               #45f3ff 5%,
//               transparent 5%,
//               transparent 40%,
//               #45f3ff 50%
//             );
//           }

//           @keyframes rotating {
//             0% {
//               --a: 0deg;
//             }
//             100% {
//               --a: 360deg;
//             }
//           }

//           .animated-box::before {
//             content: "";
//             position: absolute;
//             width: 100%;
//             height: 100%;
//             background: repeating-conic-gradient(
//               from var(--a),
//               #45f3ff 0%,
//               #45f3ff 5%,
//               transparent 5%,
//               transparent 40%,
//               #45f3ff 50%
//             );
//             filter: drop-shadow(0 15px 50px rgba(0,0,0,0.2));
//             border-radius: 20px;
//             animation: rotating 4s linear infinite;
//             animation-delay: -1s;
//             opacity: 0;
//             transition: opacity 0.3s ease;
//           }

//           .dark .animated-box::before {
//             opacity: 1;
//             background: repeating-conic-gradient(
//               from var(--a),
//               #ff2770 0%,
//               #ff2770 5%,
//               transparent 5%,
//               transparent 40%,
//               #ff2770 50%
//             );
//           }

//           .animated-box::after {
//             content: "";
//             position: absolute;
//             inset: 4px;
//             background: white;
//             border-radius: 15px;
//             border: 8px solid #f3f4f6;
//             transition: all 0.5s ease;
//           }

//           .dark .animated-box::after {
//             background: #2d2d39;
//             border: 8px solid #1f2937;
//           }

//           .animated-box:hover {
//             width: 450px;
//             height: 500px;
//           }

//           .login-container {
//             position: absolute;
//             inset: 60px;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             flex-direction: column;
//             border-radius: 10px;
//             background: rgba(255, 255, 255, 0.2);
//             color: #111;
//             z-index: 1000;
//             box-shadow: inset 0 10px 20px rgba(0, 0, 0, 0.1);
//             border-bottom: 2px solid rgba(0, 0, 0, 0.1);
//             transition: all 0.5s ease;
//             overflow: hidden;
//           }

//           .dark .login-container {
//             background: rgba(0, 0, 0, 0.2);
//             color: #fff;
//             border-bottom: 2px solid rgba(255, 255, 255, 0.1);
//           }

//           .animated-box:hover .login-container {
//             inset: 40px;
//           }

//           .login-content {
//             position: relative;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             flex-direction: column;
//             gap: 20px;
//             width: 70%;
//             transform: translateY(126px);
//             transition: transform 0.5s ease;
//           }

//           .animated-box:hover .login-content {
//             transform: translateY(0px);
//           }

//           .login-title {
//             text-transform: uppercase;
//             font-weight: 600;
//             letter-spacing: 0.2em;
//             color: #111;
//           }

//           .dark .login-title {
//             color: #fff;
//           }

//           .login-input {
//             width: 100%;
//             padding: 10px 20px;
//             outline: none;
//             border: none;
//             font-size: 1em;
//             color: #111;
//             background: rgba(0, 0, 0, 0.05);
//             border: 2px solid #ddd;
//             border-radius: 30px;
//             transition: all 0.3s ease;
//           }

//           .dark .login-input {
//             color: #fff;
//             background: rgba(0, 0, 0, 0.2);
//             border: 2px solid #555;
//           }

//           .login-input::placeholder {
//             color: #999;
//           }

//           .login-submit {
//             background: #3b82f6;
//             border: none;
//             font-weight: 500;
//             color: white;
//             cursor: pointer;
//             transition: all 0.3s ease;
//           }

//           .login-submit:hover {
//             box-shadow: 0 0 10px #3b82f6, 0 0 20px #3b82f680;
//           }

//           .dark .login-submit {
//             background: #2563eb;
//           }

//           .dark .login-submit:hover {
//             box-shadow: 0 0 10px #3b82f6, 0 0 20px #3b82f680;
//           }
//         `}</style>
//       </Head>

//       <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
//         <div 
//           className="animated-box"
//           onMouseEnter={() => setIsHovered(true)}
//           onMouseLeave={() => setIsHovered(false)}
//         >
//           <div className="login-container">
//             <div className="login-content">
//               <h2 className="login-title flex items-center gap-2">
//                 Sign In <i className="fas fa-user"></i>
//               </h2>
              
//               <div className="w-full">
//                 <div className="relative mb-1">
//                   <Mail className="absolute left-1 top-4 text-gray-500 dark:text-gray-400 w-4 h-4" />
//                   <input
//                     type="text"
//                     name="mobile"
//                     value={formValues.mobile}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     placeholder="Enter your mobile number"
//                     className="login-input w-full pl-10 pr-3 py-2"
//                   />
//                 </div>
//                 {touched.mobile && errors.mobile && (
//                   <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
//                 )}
//               </div>

//               <div className="w-full">
//                 <div className="relative mb-1">
//                   <Lock className="absolute left-1 top-4 text-gray-500 dark:text-gray-400 w-4 h-4" />
//                   <input
//                     type="password"
//                     name="password"
//                     value={formValues.password}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     placeholder="Enter your password"
//                     className="login-input w-full pl-10 pr-3 py-2"
//                   />
//                 </div>
//                 {touched.password && errors.password && (
//                   <p className="text-red-500 text-xs mt-1">{errors.password}</p>
//                 )}
//               </div>

//               {error && <p className="text-red-500 text-sm text-center">{error}</p>}

//               <button
//                 type="submit"
//                 onClick={handleSubmit}
//                 disabled={loading}
//                 className="login-submit w-full py-2 px-4 rounded-full"
//               >
//                 {loading ? (
//                   <span className="flex items-center justify-center gap-2">
//                     <i className="fas fa-spinner fa-spin"></i> Signing in...
//                   </span>
//                 ) : (
//                   "Sign In"
//                 )}
//               </button>

//               <div className="group w-full flex justify-between text-sm">
//                 <a href="#" className="text-gray-600 dark:text-gray-300 hover:underline">
//                   Forgot password?
//                 </a>
//                 <a href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
//                   Create account
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
