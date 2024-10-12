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

const fetchAllUsers = async (client: any, email: string): Promise<any[]> => {
  let allUsers: any[] = [];
  let nextToken: string | null = null;
  let hasMorePages: boolean = true;
  while (hasMorePages) {
    const { data: users, nextToken: newNextToken }: { data: any[]; nextToken: any } = await client.models.User.list({
      filter: {
        email: {
          eq: email,
        },
      },
      nextToken,
      limit: 1000,
    });
    allUsers = [...allUsers, ...users];
    nextToken = newNextToken;
    if (!nextToken || users.length < 1000) {
      hasMorePages = false;
    }
  }
  return allUsers;
};

interface SignUpFormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement;
  password: HTMLInputElement;
  retypePassword: HTMLInputElement;
  role: HTMLSelectElement;
}

interface SignUpForm extends HTMLFormElement {
  readonly elements: SignUpFormElements;
}

export default function SignUpPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [retypePassword, setRetypePassword] = useState<string>("");

  // Function to handle the signup form submission
  async function handleSubmit(event: FormEvent<SignUpForm>) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = form.elements.email.value;
    const password = form.elements.password.value;

    // if (password !== retypePassword) {
    //   setErrorMessage("Passwords do not match. Please try again.");
    //   return;
    // }

    // const relevantUser = await fetchAllUsers(client, email);

    // if (relevantUser.length === 0) {
    //   setErrorMessage(
    //     "User does not exist in the database. Please contact the admin to add you to the database."
    //   );
    //   return;
    // }

    // const finalUser = relevantUser[0];
    // const roleInDB = finalUser.role;

    try {
      // Sign up the user with the email and password
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            "custom:role": "employee",
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
                htmlFor="retypePassword"
              >
                Retype your password
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline"
                id="retypePassword"
                name="retypePassword"
                type="password"
                placeholder="********"
                value={retypePassword}
                onChange={(e) => setRetypePassword(e.target.value)}
                required
              />
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