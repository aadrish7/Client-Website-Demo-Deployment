'use client';
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import { getCurrentUser } from 'aws-amplify/auth';

const client = generateClient<Schema>();
Amplify.configure(outputs);

const CsvQuestionParser: React.FC = () => {
  const [questionData, setQuestionData] = useState<Map<string, string[]>>(new Map());

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data as { Factor: string; Questions: string }[];
        const groupedQuestions = groupQuestionsByFactor(data);
        setQuestionData(groupedQuestions);
      },
    });
  };

  const groupQuestionsByFactor = (data: { Factor: string; Questions: string }[]): Map<string, string[]> => {
    const groupedData = new Map<string, string[]>();

    data.forEach(({ Factor, Questions }) => {
      if (!groupedData.has(Factor)) {
        groupedData.set(Factor, []);
      }
      groupedData.get(Factor)?.push(Questions);
    });

    return groupedData;
  };

  const createCollection = async () => {
    try {
      const { username, userId, signInDetails } = await getCurrentUser();
      const { data: collection } = await client.models.Collection.create({
        userId,
      });
      // Loop through the questionData Map and create each question
      questionData.forEach((questions, factor) => {
        let questionNumber = 1;
        questions.forEach(async (questionText) => {
          const { data: questionData } = await client.models.Question.create({
            questionNumber: questionNumber++,
            factor,
            questionText,
            options: ['1', '2', '3', '4', '5'],
            collectionId: collection?.id,
          });
        });
      });
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Upload CSV File</h1>
      <div className="mb-8">
        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
          Choose a CSV file
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
      </div>
      {Array.from(questionData.entries()).map(([factor, questions], index) => (
        <div key={index} className="mb-6 last:mb-0">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">{factor}</h2>
          <ul className="space-y-2">
            {questions.map((question, i) => (
              <li key={i} className="text-gray-600 bg-gray-50 p-3 rounded-md">{question}</li>
            ))}
          </ul>
        </div>
      ))}
      {questionData.size > 0 && (
        <button
          onClick={createCollection}
          className="mt-8 w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Create Collection
        </button>
      )}
    </div>
  );
};

export default CsvQuestionParser;
