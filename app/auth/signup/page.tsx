"use client";
import { useState, FormEvent } from "react";
import { Amplify } from "aws-amplify";
import { signUp } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import outputs from "../../../amplify_outputs.json";

Amplify.configure(outputs);

interface SignUpFormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
  role: HTMLSelectElement;
}

interface SignUpForm extends HTMLFormElement {
  readonly elements: SignUpFormElements;
}

export default function SignUpPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  //function to handle the signup form submission
  async function handleSubmit(event: FormEvent<SignUpForm>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.elements.email.value;

    try {
      //sign up the user with the email and password
      await signUp({
        username: email,
        password: form.elements.password.value,
        options: {
          userAttributes: {
            "custom:role": form.elements.role.value,
          },
        },
      });

      // Pass email as a query parameter to the code confirmation page
      router.push(`/auth/codeconfirmation?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error("Sign-up error:", error);
      if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
    }
  }


  const onSubmit = async (e: FormEvent<SignUpForm>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await handleSubmit(e);
    setIsSubmitting(false);
  };
  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <form onSubmit={onSubmit} className="bg-white shadow-md rounded-lg p-8 mb-4 w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Sign Up</h2>
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
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
            Password:
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="role" className="block text-gray-700 text-sm font-bold mb-2">
            Role:
          </label>
          <select
            id="role"
            name="role"
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="admin">Admin</option>
            <option value="superadmin">Superadmin</option>
            <option value="employee">Employee</option>
          </select>
        </div>
        <div className="flex items-center justify-center mb-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
          >
            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
          </button>
        </div>
        <p className="text-center text-gray-600 text-sm">
          Already have an account? <span className="text-blue-500 hover:text-blue-600 cursor-pointer" onClick={() => router.push("/auth/signin")}>Sign in here</span>
        </p>
      </form>
      {errorMessage && (
        <div className="text-red-500 text-sm mt-2">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
