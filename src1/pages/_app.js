// // import "@/styles/globals.css";
// // import { useEffect, useState } from "react";
// // import { useRouter } from "next/router";
// // import Header from "../pages/component/Header";
// // import Sidebar from "../pages/component/Sidebar";
// // import { ToastContainer } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";
// // import { startRefreshTimer } from "@/utills/auth";

// // export default function App({ Component, pageProps }) {
// //   const router = useRouter();
// //   const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

// //   useEffect(() => {
// //     const token = localStorage.getItem("access_token");
// //     const expiry = localStorage.getItem("token_expiry");

// //     const isExpired =
// //       expiry && new Date(expiry).getTime() < new Date().getTime();

// //     if (!token || isExpired) {
// //       localStorage.clear();
// //       setIsAuthenticated(false);
// //       if (router.pathname !== "/login") router.push("/login");
// //     } else {
// //       setIsAuthenticated(true);
// //       startRefreshTimer(); // ⏰ Start token auto-refresh
// //     }
// //   }, [router.pathname]);

// //   if (isAuthenticated === null) return null; // Optional: show spinner

// //   const isLoginPage = router.pathname === "/login";

// //   return (
// //     <>
// //       {!isLoginPage && (
// //         <>
// //           <Header />
// //           <Sidebar />
// //         </>
// //       )}
// //       <Component {...pageProps} />
// //       <ToastContainer position='top-right' autoClose={3000} hideProgressBar={false} />
// //     </>
// //   );
// // }


// import "@/styles/globals.css";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/router";
// import Header from "../pages/component/Header";
// import Sidebar from "../pages/component/Sidebar";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { startRefreshTimer, isTokenValid } from "@/utills/auth";

// export default function App({ Component, pageProps }) {
//   const router = useRouter();
//   const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

//   useEffect(() => {
//     if (typeof window === "undefined") return;

//     const tokenIsValid = isTokenValid();

//     if (!tokenIsValid) {
//       localStorage.clear();
//       setIsAuthenticated(false);
//       if (router.pathname !== "/login") router.push("/login");
//     } else {
//       setIsAuthenticated(true);
//       startRefreshTimer(); // ⏰ Start token auto-refresh
//     }
//   }, [router.pathname]);

//   if (isAuthenticated === null) return null; // Optional: show spinner

//   const isLoginPage = router.pathname === "/login";

//   return (
//     <>
//       {!isLoginPage && (
//         <>
//           <Header />
//           <Sidebar />
//         </>
//       )}
//       <Component {...pageProps} />
//       <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
//     </>
//   );
// }


import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "../pages/component/Header";
import Sidebar from "../pages/component/Sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      localStorage.clear();
      setIsAuthenticated(false);
      if (router.pathname !== "/login") router.push("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router.pathname]);

  if (isAuthenticated === null) return null; // Optional: show spinner

  const isLoginPage = router.pathname === "/login";

  return (
    <>
      {!isLoginPage && (
        <>
          <Header />
          <Sidebar />
        </>
      )}
      <Component {...pageProps} />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}
