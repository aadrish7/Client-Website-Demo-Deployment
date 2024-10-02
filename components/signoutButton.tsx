import { useRouter } from "next/navigation";
import { signOut } from "aws-amplify/auth";
import { useState } from "react";
import useUserStore from "@/store/userStore";

//component to handle signout functionality with clickable span
export default function SignOutText() {
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
      setError('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    
      <span
        className="text-blue-600 cursor-pointer hover:underline"
        onClick={handleSignOut}
        style={{ pointerEvents: loading ? 'none' : 'auto' }}
      >
        {loading ? 'Signing out...' : 'Sign out'}
      </span>
    
  );
}
