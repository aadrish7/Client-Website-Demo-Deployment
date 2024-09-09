"use client";
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '@/amplify/data/resource';
import { getCurrentUser } from 'aws-amplify/auth';
import outputs from '@/amplify_outputs.json';
import { Amplify } from 'aws-amplify';
import { useRouter } from 'next/navigation';

Amplify.configure(outputs);
const client = generateClient<Schema>();

type Question = {
  questionNumber: number;
  factor: string;
  questionText: string;
  options: string[];
};

type Collection = {
  id: string;
};



const GetCollection: React.FC = () => {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [questionsByCollection, setQuestionsByCollection] = useState<Record<string, Question[]>>({}); // Store questions by collection id

  const goToManualCreation = () => {
    router.push('/admin/manualcollection');
  };

  const goToCSVCreation = () => {
    router.push('/admin/csvcollection');
  };

  useEffect(() => {
    const fetchCollectionsAndQuestions = async () => {
      try {
        const { userId } = await getCurrentUser();
        const { data: collectionList } = await client.models.Collection.list({
          filter: {
            userId: { eq: userId },
          },
        });

        setCollections(collectionList.map((collection) => ({
          id: collection.id,
        })));

        const questionsMap: Record<string, any[]> = {};
        for (const collection of collectionList) {
          const { data: questions } = await client.models.Question.list({
            filter: {
              collectionId: { eq: collection.id },
            },
          });
          questionsMap[collection.id] = questions; 
        }
        setQuestionsByCollection(questionsMap); 
      } catch (error) {
        setError('Failed to fetch collections and questions');
      } finally {
        setLoading(false); 
      }
    };

    fetchCollectionsAndQuestions();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mx-auto px-4 py-8">
         <div className="flex space-x-4 mb-8">
        <button
          onClick={goToManualCreation}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Manual Creation
        </button>
        <button
          onClick={goToCSVCreation}
          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          CSV Creation
        </button>
      </div>
    <h1 className="text-3xl font-bold mb-6 text-gray-800">Collections and Questions</h1>
    {collections.map((collection) => (
      <div key={collection.id}  className="mb-8 bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Collection ID: {collection.id}</h2>
        <ul className="space-y-4">
          {questionsByCollection[collection.id]?.map((question) => (
            <li  className="bg-gray-50 rounded-md p-4">
              <p className="font-medium text-gray-800 mb-2">Question {question.questionNumber}: {question.questionText}</p>
              <p className="text-sm text-gray-600 mb-1">Factor: {question.factor}</p>
              <p className="text-sm text-gray-600">Options: {question.options.join(', ')}</p>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
  );
};

export default GetCollection;
