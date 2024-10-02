"use client";
import React from "react";
import BackgroundLogo from "@/public/landingPageLogo.png";

const SignInPage = () => {
  return (
    <div className="bg-black min-h-screen flex justify-center items-center">
      {/* Container for background image and sign-in form */}
      <div className="relative z-10 w-[850px] h-[500px] flex">

        {/* Background Image on the left side */}
        <div className="w-1/2 h-full">
          <img
            src="/landingPageLogo.png"
            alt="Background Logo"
            className="object-cover w-full h-full opacity-70"
          />
        </div>

        {/* Sign-in Form on the right side */}
        <div className="w-1/2 flex items-center justify-end">
          <div className="bg-white shadow-md rounded px-6 pt-6 pb-8 w-full max-w-md h-auto">
            <h2 className="text-2xl font-bold mb-4">Sign in to our platform</h2>

            {/* Email Input */}
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
                type="email"
                placeholder="name@example.com"
              />
            </div>

            {/* Password Input */}
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
                type="password"
                placeholder="********"
              />
            </div>

            {/* Role Selection */}
            <div className="mb-3">
              <label
                className="block text-gray-700 text-sm font-bold mb-1"
                htmlFor="role"
              >
                Select your role
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline"
                id="role"
              >
                <option value="" disabled>
                  Select a role
                </option>
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            {/* Create Account Button */}
            <div className="mb-3">
              <button
                className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline"
                type="button"
              >
                Create Account
              </button>
            </div>

            <p className="text-gray-600 text-sm">
              Please click the link in your email to activate your account. Didn’t
              receive the email?
              <a href="#" className="text-blue-500 hover:text-blue-700 ml-1">
                Resend Email
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
