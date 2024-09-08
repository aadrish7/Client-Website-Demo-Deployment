"use client";

import React, { useState } from "react";
import { Amplify } from "aws-amplify";
import outputs from '@/amplify_outputs.json';
import type { Schema } from "@/amplify/data/resource";
import { generateClient } from 'aws-amplify/data';
import { getCurrentUser } from "aws-amplify/auth";

const client = generateClient<Schema>();

Amplify.configure(outputs);

interface Question {
  questionNumber: number;
  factor: string;
  questionText: string;
  options: string[];
}

const CreateCollection: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionText, setQuestionText] = useState<string>('');
  const [questionFactor, setQuestionFactor] = useState<Question['factor']>(""); // Changed to string input
  const [questionOptions, setQuestionOptions] = useState<string[]>([]);
  const [optionText, setOptionText] = useState<string>('');

  const addOption = () => {
    if (optionText) {
      setQuestionOptions([...questionOptions, optionText]);
      setOptionText(''); 
    }
  };

  const addQuestion = () => {
    if (questionText && questionFactor && questionOptions.length > 0) {
      const newQuestion: Question = {
        questionNumber: questions.length + 1,
        factor: questionFactor,
        questionText: questionText,
        options: questionOptions,
      };
      setQuestions([...questions, newQuestion]);
      setQuestionText('');
      setQuestionFactor("");
      setQuestionOptions([]);
    }
  };

  const createCollection = async () => {
    try {
      const { username, userId, signInDetails } = await getCurrentUser();
      const { data: collection } = await client.models.Collection.create({
        userId,
      });

      for (const question of questions) {
        const { data: questionData } = await client.models.Question.create({
          questionNumber: question.questionNumber,
          factor: question.factor,
          questionText: question.questionText,
          options: question.options,
          collectionId: collection?.id,
        });
        setQuestions([])
      }
    } catch (error) {
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6">Create a New Collection</h1>

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
          <input
            type="text"
            value={questionFactor}
            onChange={(e) => setQuestionFactor(e.target.value)} 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter factor (e.g., Psychological Safety)"
          />
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
            <button
              onClick={addOption}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Option
            </button>
          </div>
        </div>
        <div>
          <ul className="list-disc pl-5 space-y-1">
            {questionOptions.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        </div>
        <button
          onClick={addQuestion}
          className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Add Question
        </button>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Questions Added</h2>
      <ul className="space-y-4">
        {questions.map((question, index) => (
          <li key={index} className="border border-gray-200 rounded-md p-4">
            <strong>Question {question.questionNumber}:</strong> {question.questionText} ({question.factor})
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {question.options.map((option, i) => (
                <li key={i}>{option}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <button
        onClick={createCollection}
        className="mt-8 w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Create Collection
      </button>
    </div>
  );
};

export default CreateCollection;
