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
  const [factor, setFactor] = useState<string>(''); // Updated state to handle dropdown selection
  const [score, setScore] = useState<string>(''); 
  const [snippetText, setSnippetText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  // List of available factors
  const factors = ['Advocacy', 'Psychological Safety', 'Flexibility', 'Growth Satisfaction', 'Purpose'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Validate that all fields are filled
      if (!factor || !score || !snippetText) {
        setErrorMessage('All fields are required.');
        return;
      }

      // Save the new snippet to the database
      await client.models.TextSnippet.create({
        factor,
        score : Number(score),
        snippetText,
      });

      // Reset form fields after successful creation
      setFactor('');
      setScore('');
      setSnippetText('');
      setSuccessMessage('Text Snippet created successfully!');
    } catch (error) {
      console.error('Failed to create text snippet', error);
      setErrorMessage('Failed to create text snippet. Please try again.');
    }
  };

  const navItems = [
    {
      label: '📦 Collections',
      active: false,
      subItems: [
        { label: '📋 Question Bank', active: false, href: '/superadmin/collections/questionbank' },
        { label: '📦 Collection', active: false, href: '/superadmin/collections/collection' }
      ]
    },
    {
      label: '📦 Snippets',
      active: true,
      subItems: [
        { label: '📋 Snippet Bank', active: true, href: '/superadmin/snippets' },
        { label: '📦 Snippet Set', active: false, href: '/superadmin/snippets' }
      ]
    },
  
    { label: '🏢 Company', active: false, href: '/superadmin' },
    { label: '📊 Analytics', active: false, href: '/analytics' },
    { label: '💬 Help', active: false, href: '/help' }
  ].filter(item => item !== undefined); 

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar navItems={navItems} />
        <div className="w-4/5 p-8">
          <h1 className="text-2xl font-semibold mb-6">Create Text Snippet</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dropdown for Factor */}
            <div>
              <label className="block text-lg font-medium">Factor</label>
              <select
                value={factor}
                onChange={(e) => setFactor(e.target.value)}
                className="w-full p-2 border rounded"
                required
              >
                <option value="" disabled>Select a factor</option>
                {factors.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Input for Score */}
            <div>
              <label className="block text-lg font-medium">Score</label>
              <input
                type="text"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter score"
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
