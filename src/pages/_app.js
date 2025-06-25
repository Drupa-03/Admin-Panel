// pages/_app.js
import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "../pages/component/Header";
import Sidebar from "../pages/component/Sidebar";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';  
import { startRefreshTimer } from "@/utills/auth";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // null = loading

  useEffect(() => {
  const token = localStorage.getItem("access_token");

  if (!token && router.pathname !== "/login") {
    router.push("/login");
    setIsAuthenticated(false);
  } else {
    setIsAuthenticated(true);

    // ✅ Start refresh timer if not on login page
    if (token && router.pathname !== "/login") {
      startRefreshTimer();
    }
  }
}, [router.pathname]);


  if (isAuthenticated === null) return null; // or a loading spinner

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

