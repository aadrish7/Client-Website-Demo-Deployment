'use client';
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '@/amplify/data/resource';
import outputs from '@/amplify_outputs.json';
import { Amplify } from 'aws-amplify';
import BarChart from '@/components/barChartEmployee';

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
  const [questionsByFactor, setQuestionsByFactor] = useState<QuestionsByFactor>({});
  const [currentFactor, setCurrentFactor] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userSelections, setUserSelections] = useState<UserSelections>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFactorIntro, setShowFactorIntro] = useState<boolean>(true);
  const [isFinished, setIsFinished] = useState<boolean>(false); 

  const fetchCollections = async () => {
    const { data: collectionList } = await client.models.Collection.list();
    return collectionList[0];
  };

  const getQuestions = async () => {
    try {
      const collection = await fetchCollections();
      const { data: questionList } = await client.models.Question.list({
        filter: {
          collectionId: { eq: collection.id },
        },
      });

      // Grouping questions by factor
      const questionsByFactor = questionList.reduce((acc, question) => {
        const { factor } = question;
        if (!acc[factor]) {
          acc[factor] = [];
        }
        acc[factor].push({
          questionNumber: question.questionNumber,
          questionText: question.questionText,
          options: question.options?.filter((option): option is string => option !== null) ?? ["1", "2", "3", "4"],
        });
        return acc;
      }, {} as Record<string, { questionNumber: number; questionText: string; options: string[] }[]>);

      Object.keys(questionsByFactor).forEach((factor) => {
        questionsByFactor[factor].sort((a, b) => a.questionNumber - b.questionNumber);
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
  };

  const handleNextQuestion = () => {
    if (!currentFactor) return;

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
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      // Move to the next factor if there are no more questions in the current factor
      const factorKeys = Object.keys(questionsByFactor);
      const currentFactorIndex = factorKeys.indexOf(currentFactor);
      if (currentFactorIndex < factorKeys.length - 1) {
        const nextFactor = factorKeys[currentFactorIndex + 1];
        setCurrentFactor(nextFactor);
        setCurrentQuestionIndex(0);
        setSelectedOption(null); 
        setShowFactorIntro(true);  
      } else {
        setIsFinished(true);
      }
    }
  };

  const calculateAverages = (userSelections: UserSelections): Record<string, number> => {
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
    return <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold">You have completed all the questions!</h1>
      <pre className="mt-4">{JSON.stringify(userSelections, null, 2)}</pre>
      <BarChart data={calculateAverages(userSelections)} />
    </div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      {showFactorIntro ? (
        <div>
          <h1 className="text-2xl font-bold mb-4">Questions for the '{currentFactor}' factor are starting!</h1>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            onClick={() => setShowFactorIntro(false)}
          >
            Start Questions
          </button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold">Question {currentQuestion.questionNumber}:</h2>
          <p>{currentQuestion.questionText}</p>
          
          <div className="mt-4">
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="mb-2">
                <input
                  type="radio"
                  name="option"
                  value={index + 1}
                  checked={selectedOption === index + 1}
                  onChange={() => handleOptionSelect(index + 1)}
                  className="mr-2"
                />
                {option}
              </div>
            ))}
          </div>
          
          <button
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            onClick={handleNextQuestion}
          >
            {currentFactor && currentQuestionIndex === currentQuestions.length - 1 && Object.keys(questionsByFactor).indexOf(currentFactor) === Object.keys(questionsByFactor).length - 1
              ? "Finish" : "Next"}
          </button>
        </div>
      )}

      {/* For Debugging: Displaying the selected options */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold">User Selections</h3>
        <pre>{JSON.stringify(userSelections, null, 2)}</pre>
      </div>
     
    </div>
  );
};

export default QuestionsComponent;
