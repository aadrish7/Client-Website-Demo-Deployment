'use client';
import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '@/amplify/data/resource';
import { Amplify } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import outputs from '@/amplify_outputs.json';
import Header from '@/components/superadminHeader'; 
import Sidebar from '@/components/superadminSidebar';

Amplify.configure(outputs);
const client = generateClient<Schema>();

const CreateTextSnippet: React.FC = () => {
  const [factor, setFactor] = useState<string>('');
  const [scoreRange, setScoreRange] = useState<string>('');
  const [snippetText, setSnippetText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Validate that all fields are filled
      if (!factor || !scoreRange || !snippetText) {
        setErrorMessage('All fields are required.');
        return;
      }

      // Save the new snippet to the database
      await client.models.TextSnippet.create({
        factor,
        scoreRange,
        snippetText,
      });

      // Reset form fields after successful creation
      setFactor('');
      setScoreRange('');
      setSnippetText('');
      setSuccessMessage('Text Snippet created successfully!');
    } catch (error) {
      console.error('Failed to create text snippet', error);
      setErrorMessage('Failed to create text snippet. Please try again.');
    }
  };

  const navItems = [
    { label: '📋 Question Bank', active: false },
    { label: '📦 Collections', active: false },
    { label: '🏢 Company', active: false },
    { label: '📊 Analytics', active: false },
    { label: '💬 Help', active: false },
  ];

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar navItems={navItems} />
        <div className="w-4/5 p-8">
          <h1 className="text-2xl font-semibold mb-6">Create Text Snippet</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input for Factor */}
            <div>
              <label className="block text-lg font-medium">Factor</label>
              <input
                type="text"
                value={factor}
                onChange={(e) => setFactor(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter factor"
                required
              />
            </div>

            {/* Input for Score Range */}
            <div>
              <label className="block text-lg font-medium">Score Range</label>
              <input
                type="text"
                value={scoreRange}
                onChange={(e) => setScoreRange(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter score range (e.g., 1-2, 3-4)"
                required
              />
            </div>

            {/* Input for Snippet Text */}
            <div>
              <label className="block text-lg font-medium">Snippet Text</label>
              <textarea
                value={snippetText}
                onChange={(e) => setSnippetText(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter snippet text"
                rows={4}
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Create Text Snippet
              </button>
            </div>

            {/* Error or Success Message */}
            {errorMessage && (
              <p className="text-red-500">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="text-green-500">{successMessage}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTextSnippet;
