import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Header from "../pages/component/Header";
import Sidebar from "../pages/component/Sidebar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAccessToken, getUserRole } from "@/utills/auth";
import { isAccessTokenExpired } from "@/utills/api";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = getAccessToken();
      const userRole = getUserRole();

      console.log("checkAuth:", {
        accessToken: accessToken ? accessToken.slice(0, 10) + "..." : null,
        userRole,
        pathname: router.pathname,
        localStorage: {
          access_token: localStorage.getItem("access_token")?.slice(0, 10) + "...",
          refresh_token: localStorage.getItem("refresh_token")?.slice(0, 10) + "...",
          Auth: JSON.parse(localStorage.getItem("Auth")),
        },
      });

      if (!accessToken) {
        console.warn("No access token found, redirecting to /login");
        if (router.pathname !== "/login") {
          router.push("/login");
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(false);
        }
      } else if (isAccessTokenExpired(accessToken)) {
        console.warn("Access token expired, redirecting to /login");
        if (router.pathname !== "/login") {
          router.push("/login");
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        console.log("Authentication successful, userRole:", userRole);
        if (router.pathname === "/login") {
          router.push("/dashboard");
        }
        setIsAuthenticated(true);
      }
    };

    checkAuth();
    router.events.on("routeChangeComplete", checkAuth);

    return () => {
      router.events.off("routeChangeComplete", checkAuth);
    };
  }, [router]);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  const isLoginPage = router.pathname === "/login";

  return (
    <>
      {!isLoginPage && isAuthenticated && (
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