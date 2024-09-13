"use client";
import { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { getCurrentUser } from "aws-amplify/auth";
import SignOutButton from "@/components/signoutButton";
import { useRouter } from "next/navigation";
import { fetchUserAttributes } from "aws-amplify/auth";
import "../app/globals.css";
import useUserStore from "@/store/userStore";
import Employee from "./employee/page";

Amplify.configure(outputs);

//function to handle the landing page
export default function App() {
  //get the user details from the user store
  const isLoggedIn = useUserStore((state) => state.isLoggedIn);
  const userRole = useUserStore((state) => state.userRole);

  const [userAttributes, setUserAttributes] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const userDetails = await getCurrentUser();
        setUserDetails(userDetails);
      } catch (error) {}

      try {
        const userAttribute = await fetchUserAttributes();
        setUserAttributes(userAttribute);
      } catch (error) {}
    }

    fetchUserDetails();
  }, []);
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">
        Welcome to the Landing Page
      </h1>
      {isLoggedIn && userDetails && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-8 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            You are Logged In, Successfully!
          </h2>
          <p className="text-gray-600 mb-2">
            <span className="font-medium">Username:</span>{" "}
            {userDetails.username}
          </p>
          <p className="text-gray-600 mb-2">
            <span className="font-medium">User ID:</span> {userDetails.userId}
          </p>
          <p className="text-gray-600 mb-2">
            <span className="font-medium">Sign-in details:</span>{" "}
            <span className="break-all">
              {JSON.stringify(userDetails.signInDetails)}
            </span>
          </p>
          {userAttributes && (
            <p className="text-gray-600">
              <span className="font-medium">User attributes:</span>{" "}
              <span className="break-all">
                {JSON.stringify(userAttributes)}
              </span>
            </p>
          )}
        </div>
      )}
      <button
        onClick={() => router.push("/superadmin")}
        className="m-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
      >
        SuperAdmin's Page
      </button>
      <button
        onClick={() => router.push("/admin")}
        className="m-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
      >
        Admin's Page
      </button>

      <button
        onClick={() => router.push("/employee")}
        className="m-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
      >
        Employee's Page
      </button>
      {isLoggedIn ? (
        <SignOutButton />
      ) : (
        <button
          onClick={() => router.push("/auth/signin")}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Sign In
        </button>
      )}
    </main>
  );
}
