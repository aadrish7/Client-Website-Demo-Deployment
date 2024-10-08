"use client";
import { useEffect } from "react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { useRouter } from "next/navigation";
import useUserStore from "@/store/userStore";

Amplify.configure(outputs);

export default function App() {
  // get the user details from the user store
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const userRole = useUserStore((state) => state.userRole);
  const router = useRouter();

  useEffect(() => {
    // If the user is not logged in, redirect to the sign-in page
    if (!isLoggedIn) {
      router.push("/auth/signin");
    } else {
      // Redirect based on the user role
      switch (userRole) {
        case "employee":
          router.push("/assessment");
          break;
        case "admin":
          router.push("/admin");
          break;
        case "superadmin":
          router.push("/superadmin");
          break;
        default:
          router.push("/auth/signin"); 
      }
    }
  }, [isLoggedIn, userRole, router]);

  // No content displayed, just redirects
  return null;
}
