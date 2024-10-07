"use client";
import { useState, FormEvent } from "react";
import { Amplify } from "aws-amplify";
import { signUp } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import outputs from "../../../amplify_outputs.json";
import { Schema } from "@/amplify/data/resource";
import { generateClient } from "aws-amplify/data";

Amplify.configure(outputs);
const client = generateClient<Schema>();

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
    const role = form.elements.role.value;

    console.log("role", role);
    if (role === "admin") {
      const { data: listOfAdmins, errors } = await client.models.User.list({
        filter: {
          and: [
            { role: { eq: "admin" } },
            { email: { eq: email } }
          ]
        }
      });
    
      if (listOfAdmins.length === 0) {
        setErrorMessage("Admin with this email has not been registered");
        return;
      }
    } else if (role === "employee") {
      const { data: listOfEmployees, errors } = await client.models.User.list({
        filter: {
          and: [
            { role: { eq: "employee" } },
            { email: { eq: email } }
          ]
        }
      });
    
      if (listOfEmployees.length === 0) {
        setErrorMessage("Employee with this email has not been registered");
        return;
      }
    }
    

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
    <div className="bg-black min-h-screen flex justify-center items-center">
      <div className="relative z-10 w-[850px] h-[500px] flex">
        <div className="w-1/2 h-full">
          <img
            src="/landingPageLogo.png"
            alt="Background Logo"
            className="object-cover w-full h-full opacity-70"
          />
        </div>

        <div className="w-1/2 flex items-center justify-end">
          <form
            onSubmit={onSubmit}
            className="bg-white shadow-md rounded-lg px-6 pt-6 pb-8 w-full max-w-md h-auto"
          >
            <h2 className="text-2xl font-bold mb-4">
              Sign up for our platform
            </h2>

            <div className="mb-3">
              <label
                className="block text-gray-700 text-sm font-bold mb-1"
                htmlFor="email"
              >
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
              <label
                className="block text-gray-700 text-sm font-bold mb-1"
                htmlFor="password"
              >
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

            <div className="mb-3">
              <label
                className="block text-gray-700 text-sm font-bold mb-1"
                htmlFor="role"
              >
                Select your role
              </label>
              <select
                id="role"
                name="role"
                required
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            {errorMessage && (
              <p className="text-red-500 text-sm mb-3">{errorMessage}</p>
            )}

            <div className="mb-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline transition duration-300 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Signing Up..." : "Sign Up"}
              </button>
            </div>

            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <span
                className="text-blue-500 hover:text-blue-700 cursor-pointer"
                onClick={() => router.push("/auth/signin")}
              >
                Sign In
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
