"use client";
import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { Amplify } from "aws-amplify";
import dynamic from "next/dynamic";
import QuestionStepper from "@/components/questionStepper";
import ProgressBar from "./progressBar";
const BarChart = dynamic(() => import("@/components/barChartEmployee"), {
  ssr: false,
  loading: () => <div>Loading Graph...</div>,
});

Amplify.configure(outputs);
const client = generateClient<Schema>();

interface Question {
  questionNumber: number;
  questionText: string;
  options: string[];
}

type QuestionsByFactor = Record<string, Question[]>;
type UserSelections = Record<string, number[]>;

const QuestionsComponent: React.FC = () => {
  const [questionsByFactor, setQuestionsByFactor] = useState<QuestionsByFactor>(
    {}
  );
  const [currentFactor, setCurrentFactor] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userSelections, setUserSelections] = useState<UserSelections>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [firstAttempt, setFirstAttempt] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(2);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(0);
  const steps = [
    "Create Account",
    "Complete Profile",
    "Assessment",
    "Survey Results",
  ];
  const fetchCollections = async () => {
    const { data: collectionList } = await client.models.Collection.list();
    return collectionList[0];
  };

  const getQuestions = async () => {
    try {
      const collection = await fetchCollections();
      console.log("collection", collection);
      const { data: questionList } = await client.models.Question.list({
        filter: {
          collectionId: { eq: collection.id },
        },
      });
      setTotalQuestions(() => questionList.length);
      // Grouping questions by factor
      console.log("question list", questionList);
      const questionsByFactor = questionList.reduce((acc, question) => {
        const { factor } = question;
        if (!acc[factor]) {
          acc[factor] = [];
        }
        acc[factor].push({
          questionNumber: question.questionNumber,
          questionText: question.questionText,
          options: question.options?.filter(
            (option): option is string => option !== null
          ) ?? ["1", "2", "3", "4"],
        });
        return acc;
      }, {} as Record<string, { questionNumber: number; questionText: string; options: string[] }[]>);

      Object.keys(questionsByFactor).forEach((factor) => {
        questionsByFactor[factor].sort(
          (a, b) => a.questionNumber - b.questionNumber
        );
      });

      return questionsByFactor;
    } catch (error) {
      console.error("Error fetching questions:", error);
      return {};
    }
  };

  const loadQuestions = async () => {
    const groupedQuestions = await getQuestions();
    setQuestionsByFactor(groupedQuestions);
    const firstFactor = Object.keys(groupedQuestions)[0];
    setCurrentFactor(firstFactor);
  };

  const handleOptionSelect = (option: number) => {
    setSelectedOption(option);

    // Update userSelections as soon as an option is selected
    if (currentFactor !== null) {
      setUserSelections((prevSelections) => {
        const updatedSelections = { ...prevSelections };
        if (!updatedSelections[currentFactor]) {
          updatedSelections[currentFactor] = [];
        }

        updatedSelections[currentFactor][currentQuestionIndex] = option;
        return updatedSelections;
      });
    }
  };

  const handlePreviousQuestion = () => {
    if (!currentFactor) return;

    // If there's a previous question in the current factor
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      setCurrentQuestionNumber((prev) => prev - 1);
      setSelectedOption(
        userSelections[currentFactor]?.[currentQuestionIndex - 1] || null
      );
    } else {
      // Move to the previous factor if we're at the first question of the current factor
      const factorKeys = Object.keys(questionsByFactor);
      const currentFactorIndex = factorKeys.indexOf(currentFactor);
      if (currentFactorIndex > 0) {
        const previousFactor = factorKeys[currentFactorIndex - 1];
        const lastQuestionIndex = questionsByFactor[previousFactor].length - 1;
        setCurrentFactor(previousFactor);
        setCurrentQuestionIndex(lastQuestionIndex);
        setSelectedOption(
          userSelections[previousFactor]?.[lastQuestionIndex] || null
        );
        setCurrentQuestionNumber((prev) => prev - 1);
      }
    }
  };

  const handleNextQuestion = () => {
    if (!currentFactor) return;
    if (!selectedOption) return;
  
    const factorQuestions = questionsByFactor[currentFactor];
  
    // Save the selected option before moving to the next question
    if (selectedOption !== null) {
      setUserSelections((prevSelections) => {
        const updatedSelections = { ...prevSelections };
        if (!updatedSelections[currentFactor]) {
          updatedSelections[currentFactor] = [];
        }
  
        updatedSelections[currentFactor][currentQuestionIndex] = selectedOption;
        return updatedSelections;
      });
    }
  
    // Check if there are more questions in the current factor
    if (currentQuestionIndex < factorQuestions.length - 1) {
      const nextQuestionIndex = currentQuestionIndex + 1;
  
      // Check if an option was already selected for the next question
      const existingSelection = userSelections[currentFactor]?.[nextQuestionIndex] ?? null;
  
      setCurrentQuestionIndex(nextQuestionIndex);
      setSelectedOption(existingSelection); // Set the previously selected option or null
      setCurrentQuestionNumber((prev) => prev + 1);
    } else {
      // Move to the next factor if there are no more questions in the current factor
      const factorKeys = Object.keys(questionsByFactor);
      const currentFactorIndex = factorKeys.indexOf(currentFactor);
      if (currentFactorIndex < factorKeys.length - 1) {
        const nextFactor = factorKeys[currentFactorIndex + 1];
        setCurrentFactor(nextFactor);
        setCurrentQuestionIndex(0);
  
        // Check if an option was already selected for the first question of the next factor
        const existingSelection = userSelections[nextFactor]?.[0] ?? null;
  
        setSelectedOption(existingSelection); // Set the previously selected option or null
        setCurrentQuestionNumber((prev) => prev + 1);
      } else {
        setIsFinished(true);
        setCurrentQuestionNumber((prev) => prev + 1);
        setCurrentStep((currentStep) => currentStep + 1);
      }
    }
  };
  

  const calculateAverages = (
    userSelections: UserSelections
  ): Record<string, number> => {
    const averages: Record<string, number> = {};
    for (const key in userSelections) {
      if (Object.prototype.hasOwnProperty.call(userSelections, key)) {
        const values = userSelections[key];
        if (values.length > 0) {
          const sum = values.reduce((acc, value) => acc + value, 0);
          const average = sum / values.length;
          averages[key] = average;
        } else {
          averages[key] = 0;
        }
      }
    }

    return averages;
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  if (!currentFactor) {
    return <div>Loading questions...</div>;
  }

  const currentQuestions = questionsByFactor[currentFactor];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  if (isFinished) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <header className=" bg-white flex justify-between items-center mb-10 px-7 py-3">
          <img src="/api/placeholder/40/40" alt="Logo" className="w-10 h-10" />
          <div className="text-right">
            <h2 className="text-lg font-semibold">Neil Sims</h2>
            <p className="text-sm text-gray-600">neilsims@example.com</p>
          </div>
        </header>
        <div className="m-4">
          <QuestionStepper steps={steps} currentStep={currentStep} />
        </div>
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold">
            You have completed all the questions!
          </h1>
          {/* <pre className="mt-4">{JSON.stringify(userSelections, null, 2)}</pre> */}
          <div>
            <BarChart data={calculateAverages(userSelections)} />
          </div>
        </div>
        ;
      </div>
    );
  }

  if (firstAttempt) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <header className=" bg-white flex justify-between items-center mb-10 px-7 py-3">
          <img src="/api/placeholder/40/40" alt="Logo" className="w-10 h-10" />
          <div className="text-right">
            <h2 className="text-lg font-semibold">Neil Sims</h2>
            <p className="text-sm text-gray-600">neilsims@example.com</p>
          </div>
        </header>
        <div className="m-4">
          <QuestionStepper steps={steps} currentStep={currentStep} />
        </div>
        <main className="mx-auto w-3/5 bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold mb-4">
            Welcome to the CulTRUE assessment!
          </h1>

          <section className="mb-6">
            <h2 className="font-semibold mb-2">Introduction:</h2>
            <p className="text-gray-700">
              This assessment is not a measure of competence, it's a measure of{" "}
              <strong>engagement</strong> -- the more honest you are, the more
              the results will can be applied to improve the culture around you.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="font-semibold mb-2">Guidelines:</h2>
            <ul className="list-disc list-inside text-gray-700">
              <li>
                Do your best to answer the prompts based off of a quick{" "}
                <strong>gut reaction</strong>
              </li>
              <li>
                If you agree with one part of a statement, but not another,
                please answer based on how you feel about the{" "}
                <strong>full statement</strong>
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <p>Total Number of Prompts: 100</p>
            <p>Estimated Time Required: 10-15 minutes</p>
          </section>

          <button
            onClick={() => setFirstAttempt(() => false)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
          >
            Start Survey
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className=" bg-white flex justify-between items-center mb-10 px-7 py-3">
        <img src="/api/placeholder/40/40" alt="Logo" className="w-10 h-10" />
        <div className="text-right">
          <h2 className="text-lg font-semibold">Neil Sims</h2>
          <p className="text-sm text-gray-600">neilsims@example.com</p>
        </div>
      </header>

      <div className="m-4">
        <QuestionStepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="mx-auto w-3/5 bg-white rounded-lg shadow-md p-8">
        <ProgressBar
          currentQuestion={currentQuestionNumber}
          totalQuestions={totalQuestions}
        />
        <h2 className="text-xl font-semibold mb-2">
          Question {currentQuestionNumber + 1} of {totalQuestions}:
        </h2>
        <p className="text-gray-700 mb-6">{currentQuestion.questionText}</p>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="flex items-center">
              <input
                type="radio"
                id={`option-${index}`}
                name="option"
                value={index + 1}
                checked={selectedOption === index + 1}
                onChange={() => handleOptionSelect(index + 1)}
                className="mr-3 h-4 w-4 text-blue-500 focus:ring-blue-400"
              />
              <label htmlFor={`option-${index}`} className="text-gray-700">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          className="mt-3 px-2 py-2 mx-[260px] bg-gray-400 text-white rounded"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionNumber === 0}
        >
          Back
        </button>

        <button
          className="mt-3 px-2 py-2 mx-[260px] bg-blue-600 text-white rounded"
          onClick={handleNextQuestion}
        >
          {currentFactor &&
          currentQuestionIndex === currentQuestions.length - 1 &&
          Object.keys(questionsByFactor).indexOf(currentFactor) ===
            Object.keys(questionsByFactor).length - 1
            ? "Finish"
            : "Next Question"}
        </button>
      </div>

      <div className="mt-8 flex justify-center">
        <h3 className="text-lg font-semibold">User Selections</h3>
        <pre>{JSON.stringify(userSelections, null, 2)}</pre>
      </div>
    </div>
  );
};

export default QuestionsComponent;
