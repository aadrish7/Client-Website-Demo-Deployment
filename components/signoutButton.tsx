"use client";

import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { useState } from "react";
import useUserStore from "@/store/userStore";

//component to handle the signout button
export default function SignOutButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setLogoutState } = useUserStore();

  const handleSignOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut();
      setLogoutState();
      router.push("/auth/signin"); 
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button className = "bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"onClick={handleSignOut} disabled={loading}>
        {loading ? 'Signing out...' : 'Sign Out'}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
