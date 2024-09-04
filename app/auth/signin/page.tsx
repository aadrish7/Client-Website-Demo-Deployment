"use client";

import { useState, FormEvent } from "react";
import { Amplify } from "aws-amplify";
import { signIn, confirmSignUp } from 'aws-amplify/auth';
import { useRouter } from "next/navigation";
import outputs from "../../../amplify_outputs.json";
import useUserStore from "@/store/userStore";
import { fetchUserAttributes } from 'aws-amplify/auth';

Amplify.configure(outputs);

interface SignInFormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
}

interface SignInForm extends HTMLFormElement {
  readonly elements: SignInFormElements;
}

export default function SignInPage() {
  const router = useRouter();
  const { isLoggedIn, userRole, userEmail, setLoginState, setLogoutState } = useUserStore()
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSigning, setIsSigning] = useState<boolean>(false);

  //function to handle the signin form submission
  async function handleSubmit(event: FormEvent<SignInForm>) {
    event.preventDefault();
    const form = event.currentTarget;

    try {
      //sign in the user with the email and password
      const result = await signIn({
        username: form.elements.email.value,
        password: form.elements.password.value,
      });

      //if the user hasn't code the code confirmaation part for mail, redirect to the code confirmation page
      if (result.nextStep.signInStep === "CONFIRM_SIGN_UP"){
        router.push("/auth/codeconfirmation")
      }
      // if the user is signed in, fetch the user attributes about the user and set the login state
      else if (result.isSignedIn){
        const userattributes = await fetchUserAttributes();
        //set the login state with the user attributes
        setLoginState(form.elements.email.value, userattributes["custom:role"] ?? "");
        router.push("/");
      }
      else{
        setErrorMessage("Error signing in");
      }
    } catch (error: any) {
      if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  }
const onSubmit = async (e: FormEvent<SignInForm>) => {
    e.preventDefault();
    setIsSigning(true);
    await handleSubmit(e);
    setIsSigning(false);
  }
  return (
    <>
   <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <form onSubmit={onSubmit} className="bg-white shadow-md rounded-lg p-8 mb-4 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sign In</h2>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex items-center justify-center mb-6">
        <button
            type="submit"
            disabled={isSigning}
            className={`w-full bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ${
              isSigning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {isSigning ? 'Signing In...' : 'Sign In'}
          </button>
        </div>
        <p className="text-center text-gray-600 text-sm">
          Don't have an account? <span className="text-blue-500 hover:text-blue-600 cursor-pointer" onClick={() => router.push("/auth/signup")}>Sign up!</span>
        </p>
      </form>
      {errorMessage && (
        <p className="text-red-500 text-sm mt-2">
          {errorMessage}
        </p>
      )}
    </div>
    </>
  );
}
