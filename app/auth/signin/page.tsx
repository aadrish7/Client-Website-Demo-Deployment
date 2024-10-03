'use client'
import { useState, FormEvent } from "react";
import { Amplify } from "aws-amplify";
import { signIn, confirmSignUp } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import outputs from "../../../amplify_outputs.json";
import useUserStore from "@/store/userStore";
import { fetchUserAttributes } from "aws-amplify/auth";

Amplify.configure(outputs);

interface SignInFormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
  role: HTMLSelectElement;
}

interface SignInForm extends HTMLFormElement {
  readonly elements: SignInFormElements;
}

export default function SignInPage() {
  const router = useRouter();
  const { isLoggedIn, userRole, userEmail, setLoginState, setLogoutState } = useUserStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState<boolean>(false);

  async function handleSubmit(event: FormEvent<SignInForm>) {
    event.preventDefault();
    const form = event.currentTarget;

    try {
      const result = await signIn({
        username: form.elements.email.value,
        password: form.elements.password.value,
      });

      if (result.nextStep.signInStep === "CONFIRM_SIGN_UP") {
        router.push("/auth/codeconfirmation");
      }
      else if (result.isSignedIn) {
        const userAttributes = await fetchUserAttributes();
        const role = userAttributes["custom:role"] ?? ""; // Fetch the custom role attribute
        
        setLoginState(userAttributes["email"] ?? "", role);

        // Redirect based on the role
        if (role === "admin") {
          router.push("/admin");
        } else if (role === "superadmin") {
          router.push("/superadmin");
        } else if (role === "employee") {
          router.push("/employee");
        } else {
          router.push("/"); // Fallback in case no role is set
        }
      } else {
        setErrorMessage("Error signing in");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An unexpected error occurred. Please try again.");
    }
  }

  const onSubmit = async (e: FormEvent<SignInForm>) => {
    e.preventDefault();
    setIsSigning(true);
    await handleSubmit(e);
    setIsSigning(false);
  };

  return (
    <div className="bg-black min-h-screen flex justify-center items-center">
      <div className="relative z-10 w-[850px] h-[500px] flex">
        <div className="w-1/2 h-full">
          <img
            src="/landingPageLogo.png"
            alt="Background Logo"
            className="object-cover w-full h-full opacity-70"
          />
        </div>

        <div className="w-1/2 flex items-center justify-end ">
          <form
            onSubmit={onSubmit}
            className="bg-white shadow-md rounded-lg px-6 pt-6 pb-8 w-full max-w-md h-auto"
          >
            <h2 className="text-2xl font-bold mb-4">Sign in to our platform</h2>

            <div className="mb-3">
              <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="email">
                Your email
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline"
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
              />
            </div>

            <div className="mb-3">
              <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="password">
                Your password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                name="password"
                type="password"
                placeholder="********"
                required
              />
            </div>

            {/* <div className="mb-3">
              <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="role">
                Select your role
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline"
                id="role"
                name="role"
                required
              >
                <option value="" disabled>Select a role</option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div> */}

            {errorMessage && (
              <p className="text-red-500 text-sm mb-3">{errorMessage}</p>
            )}

            <div className="mb-3">
              <button
                type="submit"
                disabled={isSigning}
                className={`w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline transition duration-300 ${isSigning ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isSigning ? "Signing In..." : "Sign In"}
              </button>
            </div>

            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <a href="/auth/signup" className="text-blue-500 hover:text-blue-700 ml-1">Sign Up</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
