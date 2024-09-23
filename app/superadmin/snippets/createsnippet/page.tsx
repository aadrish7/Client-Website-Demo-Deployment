'use client';
import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '@/amplify/data/resource';
import { Amplify } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import outputs from '@/amplify_outputs.json';

Amplify.configure(outputs);
const client = generateClient<Schema>();

interface CreateTextSnippetProps {
  onClose: () => void;
}

const CreateTextSnippet: React.FC<CreateTextSnippetProps> = ({ onClose }) => {
  const [factor, setFactor] = useState<string>(''); 
  const [score, setScore] = useState<string>(''); 
  const [snippetText, setSnippetText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Added loading state

  const router = useRouter();

  const factors = ['Advocacy', 'Psychological Safety', 'Flexibility', 'Growth Satisfaction', 'Purpose'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true); // Start loading when form is submitted

    try {
      if (!factor || !score || !snippetText) {
        setErrorMessage('All fields are required.');
        setLoading(false); // Stop loading on error
        return;
      }

      await client.models.TextSnippet.create({
        factor,
        score: Number(score),
        snippetText,
      });

      setFactor('');
      setScore('');
      setSnippetText('');
      setSuccessMessage('Text Snippet created successfully!');
      
      setLoading(false); // Stop loading after success
      onClose(); // Call onClose after successful creation
    } catch (error) {
      console.error('Failed to create text snippet', error);
      setErrorMessage('Failed to create text snippet. Please try again.');
      setLoading(false); // Stop loading on error
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-10">
      <div className="w-full max-w-md p-6 bg-white rounded-md shadow-lg">
        <h1 className="text-lg font-semibold mb-7">Create Text Snippet</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Factor</label>
            <select
              value={factor}
              onChange={(e) => setFactor(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-sm"
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

          <div>
            <label className="block text-sm font-medium mb-2">Score</label>
            <input
              type="text"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-sm"
              placeholder="Enter score"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Snippet Text</label>
            <textarea
              value={snippetText}
              onChange={(e) => setSnippetText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-sm"
              placeholder="Enter snippet text"
              rows={4}
              required
            ></textarea>
          </div>

          <div className="flex justify-center">
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2">
            Cancel
          </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
              disabled={loading} // Disable button while loading
            >
              {loading ? 'Creating...' : 'Create Text Snippet'}
            </button>
            
          </div>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          {successMessage && <p className="text-black">{successMessage}</p>}
        </form>
      </div>
    </div>
  );
};

export default CreateTextSnippet;
