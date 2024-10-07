"use client";

import { FormEvent, useState, useEffect, Suspense } from 'react';
import { confirmSignUp } from 'aws-amplify/auth'; 
import { useRouter, useSearchParams } from 'next/navigation';  

function ConfirmSignUpContent() {
  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const emailFromQuery = searchParams.get('email');
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const response = await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      if (response) {
        router.push('/auth/signin'); 
      }
    } catch (error) {
      setError('Error confirming sign up. Please try again.');
    }
  }

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
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded-lg px-6 pt-6 pb-8 w-full max-w-md h-auto"
        >
          <h2 className="text-2xl font-bold mb-4">Confirm Your Sign Up</h2>
  
          <div className="mb-3">
            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="email">
              Your email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
              id="email"
              name="email"
              type="email"
              value={email}
              readOnly
              aria-readonly="true"
            />
          </div>
  
          <div className="mb-3">
            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="code">
              Confirmation Code
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 text-sm leading-tight focus:outline-none focus:shadow-outline"
              id="code"
              name="code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>
  
          {error && (
            <p className="text-red-500 text-sm mb-3">{error}</p>
          )}
  
          <div className="mb-3">
            <button
              type="submit"
              className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm focus:outline-none focus:shadow-outline transition duration-300"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  
  );
}

export default function ConfirmSignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmSignUpContent />
    </Suspense>
  );
}
