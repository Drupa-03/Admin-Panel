import { useEffect } from "react";
import { useRouter } from "next/router";
import { isTokenValid } from "@/utills/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isTokenValid()) {
      router.replace("/dashboard"); // prevents back button to index
    } else {
      router.replace("/login");
    }
  }, []);

  return null; // Optional: add a loader/spinner here
}
