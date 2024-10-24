"use client";
import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { Amplify } from "aws-amplify";
import dynamic from "next/dynamic";
import QuestionStepper from "@/components/questionStepper";
import ProgressBar from "./progressBar";
import MetricsBreakdown from "./employeeMetricsBreakdown";
import { fetchUserAttributes } from "aws-amplify/auth";
import Header from "@/components/superadminHeader";
import useUserStore from "@/store/userStore";
const BarChart = dynamic(() => import("@/components/barChartEmployee"), {
  ssr: false,
  loading: () => <div>Loading Graph...</div>,
});
import FactorImportance from "@/components/employeeFactorImportance";
import {
  createPaginatedFetchFunctionForUser,
  createPaginatedFetchFunctionForSurveyResults,
  createPaginatedFetchFunctionForSurvey,
  createPaginatedFetchFunctionForAverageSurveyResults,
  createPaginatedFetchFunctionForFactorImportance,
  createPaginatedFetchFunctionForCompany,
  createPaginatedFetchFunctionForTextSnippet,
  createPaginatedFetchFunctionForQuestion,
} from "@/constants/pagination";

Amplify.configure(outputs);
const client = generateClient<Schema>();

interface Question {
  questionText: string;
  id: string;
}

type QuestionsByFactor = Record<string, Question[]>;
type UserSelections = Record<string, number[]>;
type FactorImportance = Record<string, number>;
const optionMapping: Record<number, string> = {
  1: "Strongly Disagree",
  2: "Mostly Disagree",
  3: "Neutral",
  4: "Mostly Agree",
  5: "Strongly Agree",
};
interface SelectionState {
  [key: string]: number | null;
}
const QuestionsComponent: React.FC = () => {
  const [snippets, setSnippets] = useState<any>([]);
  const [matchingSnippets, setMatchingSnippets] = useState<any>([]);
  const [questionsByFactor, setQuestionsByFactor] = useState<QuestionsByFactor>(
    {}
  );
  const [arrOfSnippetIds, setArrOfSnippetIds] = useState<string[]>([]);
  const [currentFactor, setCurrentFactor] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userSelections, setUserSelections] = useState<UserSelections>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [firstAttempt, setFirstAttempt] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(0);
  const [noQuestions, setNoQuestions] = useState<boolean>(false);
  const [surveyId, setSurveyId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [factorImportanceBool, setFactorImportanceBool] =
    useState<boolean>(false);
  const [viewSurveyResults, setViewSurveyResults] = useState<boolean>(false);
  const [selectedValues, setSelectedValues] = useState<SelectionState>({
    "Psychological Safety": null,
    "Growth Satisfaction": null,
    Purpose: null,
    Advocacy: null,
    "Flexibility": null,
  });
  const [isViewingResults, setIsViewingResults] = useState<boolean>(false);
  const [snippetId, setSnippetId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");

  const steps = ["Create Account", "Assessment", "Survey Results"];
  const email = useUserStore((state) => state.userEmail);

  async function handleFinish() {
    console.log("in handle finish");
    const updatedSelections: Record<
      string,
      { questionId: string | undefined; selection: string }[]
    > = {};
    Object.keys(userSelections).forEach((factor) => {
      const questionsForFactor = questionsByFactor[factor];

      // Map over the user's selections for each question, converting selection to string
      updatedSelections[factor] = userSelections[factor].map(
        (selection, index) => ({
          questionId: questionsForFactor?.[index]?.id,
          selection: String(selection),
        })
      );
    });

    try {
      const { data: saveddata } = await client.models.SurveyResults.create({
        surveyId: surveyId,
        userId: userId,
        allanswersjson: JSON.stringify(updatedSelections),
      });
      const avg = calculateAverages(userSelections);
      const { data: savedAverageData } =
        await client.models.AverageSurveyResults.create({
          surveyId: surveyId,
          userId: userId,
          averageScorejson: JSON.stringify(avg),
        });

      //loop over selectedValues and save to FactorImportance
      for (const [key, value] of Object.entries(selectedValues)) {
        const { data: savedFactorImportanceData } =
          await client.models.FactorImportance.create({
            surveyId: surveyId,
            userId: userId,
            factor: key,
            score: value || 0,
          });
      }

      setIsFinished(() => true);
      // setCurrentQuestionNumber((prev) => prev + 1);
      setCurrentStep((currentStep) => currentStep + 1);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  }

  const isScoreInRange = (score: number, range: Number): boolean => {
    const rangeValue = range.valueOf();
    const min = rangeValue - 0.49;
    const max = rangeValue + 0.5;
    return score >= min && score <= max;
  };

  const handleSelection = (category: string, value: number) => {
    const newSelectedValues = Object.fromEntries(
      Object.entries(selectedValues).map(([key, selectedValue]) => [
        key,
        selectedValue,
      ])
    );

    setSelectedValues({
      ...newSelectedValues,
      [category]: value,
    });
  };

  const handleFactorImportanceButton = async () => {
    if (Object.values(selectedValues).includes(null)) {
      alert("Please rate all categories before proceeding");
      return;
    }
    await handleFinish();
    setFactorImportanceBool(() => false);
    setIsFinished(() => true);
  };

  const getQuestions = async () => {
    try {
      const { email } = await fetchUserAttributes();

      if (!email) {
        throw new Error("User email is missing");
      }
      const filterForUser = {
        email: {
          eq: email,
        },
      };
      const userList = await createPaginatedFetchFunctionForUser(client, filterForUser)();
      if (!userList || userList.length === 0) {
        throw new Error(`No user found with email: ${email}`);
      }

      const finalUser = userList[0];
      if (!finalUser.id) {
        throw new Error("User ID is missing");
      }
      setUserName(() => finalUser.firstName);

      setUserId(() => finalUser.id);

      const companyId = finalUser.companyId;
      if (!companyId) {
        throw new Error("User's company ID is missing");
      }
      const filterForSurvey = {
        companyId: {
          eq: companyId,
        },
        start: { eq: true },
      }
      const SurveyList = await createPaginatedFetchFunctionForSurvey(client, filterForSurvey)();

      if (!SurveyList || SurveyList.length === 0) {
        setNoQuestions(() => true);
        throw new Error(`No active survey found for company ID: ${companyId}`);
      }

      const survey = SurveyList[0];
      if (!survey.id) {
        throw new Error("Survey ID is missing");
      }

      const collectionId = survey.collectionId;
      if (!collectionId) {
        throw new Error("Survey's collection ID is missing");
      }

      const snippetId = survey.snippetSetId;
      if (!snippetId) {
        throw new Error("Snippet ID is missing");
      }
      setSnippetId(() => snippetId);

      setSurveyId(() => survey.id);

      const filterForAverageSurveyResults = {
        surveyId: {
          eq: survey.id,
        },
        userId: {
          eq: finalUser.id,
        },
      };
      const averageSurveyResponses = await createPaginatedFetchFunctionForAverageSurveyResults(client, filterForAverageSurveyResults)();

      if (averageSurveyResponses && averageSurveyResponses.length > 0) {
        const allanswersjson = averageSurveyResponses[0].averageScorejson;
        if (!allanswersjson) {
          throw new Error("No answers found in average survey results");
        }
        const allResponses: any[] = [];
        averageSurveyResponses.forEach((response) => {
          if (typeof response.averageScorejson === "string") {
            const surveyResponse = JSON.parse(response.averageScorejson);
            allResponses.push(surveyResponse);
          } else {
            console.error(
              "Invalid type for averageScorejson:",
              typeof response.averageScorejson
            );
          }
        });
        //convert into userSelections type
        const userSelections: UserSelections = {};
        allResponses.forEach((response) => {
          for (const key in response) {
            if (!userSelections[key]) {
              userSelections[key] = [];
            }
            userSelections[key].push(response[key]);
          }
        });
        setCurrentStep((currentStep) => currentStep + 1);
        setUserSelections(() => userSelections);
        setViewSurveyResults(() => true);
        return null;
      }

      // Fetch all questions that belong to the collection using collectionId
      const filterForQuestions = {
        collectionId: {
          eq: collectionId,
        },
      };
      const questions = await createPaginatedFetchFunctionForQuestion(client, filterForQuestions)();

      if (!questions || questions.length === 0) {
        throw new Error(
          `No questions found for collection ID: ${collectionId}`
        );
      }

      setTotalQuestions(() => questions.length+1);

      // Group the questions by their factor
      const questionsByFactor: QuestionsByFactor = {};
      questions.forEach((question) => {
        const factor = question.factor;
        if (!factor) {
          console.warn("Question factor is missing");
          return;
        }

        if (!questionsByFactor[factor]) {
          questionsByFactor[factor] = [];
        }

        questionsByFactor[factor].push(question);
      });

      return questionsByFactor;
    } catch (error: any) {
      console.error("Error fetching questions:", error.message || error);
      return {};
    }
  };

  const loadQuestions = async () => {
    try {
      const groupedQuestions = await getQuestions();

      if (!groupedQuestions || Object.keys(groupedQuestions).length === 0) {
        console.warn("No questions available. Setting noQuestions to true.");
        return;
      }

      setQuestionsByFactor(groupedQuestions);

      const firstFactor = Object.keys(groupedQuestions)[0];
      if (!firstFactor) {
        throw new Error(
          "Failed to determine the first factor from grouped questions."
        );
      }

      setCurrentFactor(firstFactor);
    } catch (error: any) {
      console.error("Error loading questions:", error.message || error);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, []);

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

  const handleFirstAttempt = () => {
    setFirstAttempt(() => false);
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
      const existingSelection =
        userSelections[currentFactor]?.[nextQuestionIndex] ?? null;

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
        console.warn("No more questions available.");
        setFactorImportanceBool(() => true);
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
    //sort the averages
    const sortedAverages = Object.fromEntries(
      Object.entries(averages).sort(([, a], [, b]) => b - a)
    );
    return sortedAverages;
  };

  useEffect(() => {
    const fetchSnippets = async () => {
      if (viewSurveyResults) {
        const averageSurveyResults = calculateAverages(userSelections);
        try {
          const filterForSnippets = {
            snippetSetId: {
              eq: snippetId,
            },
            disabled: {
              eq: true,
            },
            type: {
              ne: "adminoverview",
            },
          };
          const beforeFilterSnippets = await createPaginatedFetchFunctionForTextSnippet(client, filterForSnippets)();
          const filteredSnippets = beforeFilterSnippets.filter((snippet:any) => snippet.snippetSetId === snippetId && snippet.disabled === true && snippet.type !== "adminoverview");
          const snippets = filteredSnippets;
          
          if (snippets.length > 0) {
            // Filter the snippets based on factorScore and score range
            setSnippets(() => snippets);
            let matchedSnippets = snippets.filter((snippet: any) => {
              if (
                snippet.type !== "employeeindividual" &&
                snippet.type !== "adminoverview"
              ) {
              
                const factorScore = averageSurveyResults[snippet.factor];
                return (
                  factorScore && isScoreInRange(factorScore, snippet.score)
                );
              }
            });

            // Sort the matched snippets based on the order of factors in averageSurveyResults
            matchedSnippets = matchedSnippets.sort((a: any, b: any) => {
              const factorA = a.factor;
              const factorB = b.factor;
              return (
                Object.keys(averageSurveyResults).indexOf(factorA) -
                Object.keys(averageSurveyResults).indexOf(factorB)
              );
            });

            // Reverse the sorted snippets if needed
            console.log("matchedSnippets", matchedSnippets);
            setMatchingSnippets(matchedSnippets);
          }
        } catch (error) {
          console.error("Failed to fetch snippets", error);
        }
      }
    };

    fetchSnippets();
  }, [viewSurveyResults]);

  if (viewSurveyResults) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Header userName="" userEmail="" />
        <div className="m-4">
          <QuestionStepper steps={steps} currentStep={currentStep} />
        </div>
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Hi <span className="text-blue-600">{userName}!</span> Here are your
            survey result.
          </h2>

          <div className="my-4"></div>
          <BarChart data={calculateAverages(userSelections)} />
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800">Overview</h3>
            {matchingSnippets.length > 0 &&
              matchingSnippets.map((snippet: any, index: any) => {
                if (snippet.type === "employeeaggregated") {
                  return (
                    <span className="text-gray-600 mt-2" key={index}>
                      {snippet.snippetText}{" "}
                    </span>
                  );
                }
                return null;
              })}

            <MetricsBreakdown
              averages={calculateAverages(userSelections)}
              arrOfTextSnippetsId={arrOfSnippetIds}
              snippets={snippets}
            />
          </div>
        </div>
      </div>
    );
  }

  if (noQuestions) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 text-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            No Active Surveys
          </h2>
          <p className="text-gray-600">
            There are no active surveys for your company. You may have completed
            the ongoing survey, or none are available at the moment.
          </p>
        </div>
      </div>
    );
  }

  if (!currentFactor) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Header userName="" userEmail="" />
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="text-gray-600 text-lg font-medium">
            Loading questions...
          </div>
        </div>
      </div>
    );
  }

  const currentQuestions = questionsByFactor[currentFactor];
  const currentQuestion = currentQuestions[currentQuestionIndex];

  if (isFinished) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Header userName="" userEmail="" />
        <div className="m-4">
          <QuestionStepper steps={steps} currentStep={currentStep} />
        </div>
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <p className="text-md font-thin">
            Congratulations! You finished the survey.
          </p>
          <p className="text-gray-800 mt-2 text-sm mb-[280px]">
            Click “View Report” to see how you did on this survey.
          </p>
        </div>
        <div className="flex justify-end mt-4 mr-[295px]">
          <button
            className={`bg-blue-600 text-white rounded px-2 py-2 ${
              isViewingResults ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => setViewSurveyResults(() => true)}
            disabled={isViewingResults}
          >
            {isViewingResults ? "Viewing Reports..." : "View Report"}
          </button>
        </div>
      </div>
    );
  }

  if (firstAttempt) {
    return (
      <div className="bg-gray-100 min-h-screen">
        <Header userName="" userEmail="" />
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
              the results can be applied to improve the culture around you.
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
            <p>Total Number of Prompts: {totalQuestions}</p>
            <p>Estimated Time Required: 10-15 minutes</p>
          </section>
        </main>
        <div className="h-20 flex items-center justify-center">
          <button
            onClick={handleFirstAttempt}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
          >
            Start Survey
          </button>
        </div>
      </div>
    );
  }

  if (factorImportanceBool) {
    return (
      <>
        <FactorImportance
          selectedValues={selectedValues}
          onSelectionChange={handleSelection}
          factorImportanceBool={factorImportanceBool}
          onButtonClick={handleFactorImportanceButton}
          currentQuestionNumber={currentQuestionNumber}
          totalQuestions={totalQuestions}
        />
      </>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header userName="" userEmail="" />

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

        <div className="border border-gray-300 rounded-lg">
          {Object.entries(optionMapping).map(([value, text], index, array) => (
            <div
              key={value}
              className={`flex items-center p-3 cursor-pointer hover:bg-gray-100 ${
                index !== array.length - 1 ? "border-b border-gray-300" : ""
              } ${selectedOption === Number(value) ? "bg-blue-100" : ""}`}
              onClick={() => handleOptionSelect(Number(value))}
            >
              <div
                className={`mr-3 h-4 w-4 rounded-full border ${
                  selectedOption === Number(value)
                    ? "bg-blue-500 border-blue-500"
                    : "border-gray-300"
                }`}
              />
              <label className="text-gray-700 flex-grow cursor-pointer">
                {text}
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
          className={`mt-3 px-2 py-2 mx-[260px] ${
            selectedOption === null
              ? "bg-blue-200 cursor-not-allowed"
              : "bg-blue-600"
          } text-white rounded`}
          onClick={
            currentFactor &&
            currentQuestionIndex === currentQuestions.length - 1 &&
            Object.keys(questionsByFactor).indexOf(currentFactor) ===
              Object.keys(questionsByFactor).length - 1
              ? handleNextQuestion
              : handleNextQuestion
          }
          disabled={selectedOption === null}
        >
          Next Question
        </button>
      </div>

      {/* <div className="mt-8 flex justify-center">
        <h3 className="text-lg font-semibold">User Selections</h3>
        <pre>{JSON.stringify(userSelections, null, 2)}</pre>
      </div> */}
    </div>
  );
};

export default QuestionsComponent;
