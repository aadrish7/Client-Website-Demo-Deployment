'use client';

import React, { useState } from "react";
import { Amplify } from "aws-amplify";
import outputs from '@/amplify_outputs.json';
import type { Schema } from "@/amplify/data/resource";
import { generateClient } from 'aws-amplify/data';

const client = generateClient<Schema>();

Amplify.configure(outputs);

interface Question {
  questionId: string;
  factor: 'Psychological_Safety' | 'Growth_Satisfaction' | 'Other_Factors';
  questionText: string;
  options: string[];
}

const CreateCollection: React.FC = () => {
  const [collectionName, setCollectionName] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionText, setQuestionText] = useState<string>('');
  const [questionFactor, setQuestionFactor] = useState<Question['factor']>("Psychological_Safety");
  const [questionOptions, setQuestionOptions] = useState<string[]>([]);
  const [optionText, setOptionText] = useState<string>('');

  const addOption = () => {
    if (optionText) {
      setQuestionOptions([...questionOptions, optionText]);
      setOptionText(''); // Reset the option text input
    }
  };

  const addQuestion = () => {
    if (questionText && questionFactor && questionOptions.length > 0) {
      const newQuestion: Question = {
        questionId: `Q${questions.length + 1}`, // Fixed template literal
        factor: questionFactor,
        questionText: questionText,
        options: questionOptions,
      };
      setQuestions([...questions, newQuestion]);
      // Reset the fields for the next question
      setQuestionText('');
      setQuestionFactor("Psychological_Safety");
      setQuestionOptions([]);
    }
  };

  const createCollection = async () => {
    try {
      const { data: collection } = await client.models.Collection.create({
        name: collectionName,
      });
      console.log('Collection created:', collection);
      for (const question of questions) {
        console.log('Creating question:', question);  
        const { data: questionData } = await client.models.Question.create({
          questionId: question.questionId,
          factor: question.factor,
          questionText: question.questionText,
          options: question.options,
          collectionId: collection?.id,
        });
        console.log('Question created:', questionData);
      }
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Create a New Collection</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Collection Name:</label>
        <input
          type="text"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Add Questions</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question Text:</label>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Factor:</label>
          <select
            value={questionFactor}
            onChange={(e) => setQuestionFactor(e.target.value as Question['factor'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Psychological_Safety">Psychological Safety</option>
            <option value="Growth_Satisfaction">Growth Satisfaction</option>
            <option value="Other_Factors">Other Factors</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Options:</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={optionText}
              onChange={(e) => setOptionText(e.target.value)}
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button onClick={addOption} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Add Option</button>
          </div>
        </div>
        <div>
          <ul className="list-disc pl-5 space-y-1">
            {questionOptions.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        </div>
        <button onClick={addQuestion} className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500">Add Question</button>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Questions Added</h2>
      <ul className="space-y-4">
        {questions.map((question, index) => (
          <li key={index} className="border border-gray-200 rounded-md p-4">
            <strong>{question.questionId}:</strong> {question.questionText} ({question.factor})
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {question.options.map((option, i) => (
                <li key={i}>{option}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <button onClick={createCollection} className="mt-8 w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">Create Collection</button>
    </div>
  );
};

export default CreateCollection;
