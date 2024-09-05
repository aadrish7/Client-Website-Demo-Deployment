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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
    <div className="bg-white shadow-md rounded-lg p-8 mb-4 w-full max-w-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Confirm Your Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            readOnly
            aria-readonly="true"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="code" className="block text-gray-700 text-sm font-bold mb-2">
            Confirmation Code:
          </label>
          <input
            type="text"
            id="code"
            name="code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex items-center justify-center">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
          >
            Confirm
          </button>
        </div>
      </form>
    </div>
    {error && (
      <p className="text-red-500 text-sm mt-2">
        {error}
      </p>
    )}
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
