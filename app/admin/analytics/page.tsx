"use client";
import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import Header from "@/components/superadminHeader";
import Sidebar from "@/components/superadminSidebar";
import DropdownButton from "@/components/dropDownButton";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from "react";

const PieChart = dynamic(() => import("@/components/adminPieChart"), {
  ssr: false,
  loading: () => <div>Loading Graph...</div>,
});

const BarChart = dynamic(() => import("@/components/barChartEmployee"), {
  ssr: false,
  loading: () => <div>Loading Graph...</div>,
});

const StackedBarChart = dynamic(
  () => import("@/components/adminStackedBarChart"),
  {
    ssr: false,
    loading: () => <div>Loading Graph...</div>,
  }
);

const AdminBarChart = dynamic(
  () => import("@/components/adminBarChartQuestions"),
  {
    ssr: false,
    loading: () => <div>Loading Graph...</div>,
  }
);
Amplify.configure(outputs);
const client = generateClient<Schema>();
type RatingData = {
  label: string;
  values: number[];
  color: string;
};

const AdminPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [allIndividualSurveyResponses, setAllIndividualSurveyResponses] =
    useState<any[]>([]);
  const [allSurveyResponses, setAllSurveyResponses] = useState<any[]>([]);
  const [averageScores, setAverageScores] = useState<{ [key: string]: number }>(
    {}
  );
  const [avgQuesstionScoresArray, setAvgQuestionScoresArray] = useState<{
    [key: string]: number;
  }>({});
  const [selectedFactor, setSelectedFactor] = useState("Psychological Safety");
  const [percentageFactorImportance, setPercentageFactorImportance] = useState<{
    [key: string]: number;
  }>({});
  const [factorImportancePercentage, setFactorImportancePercentage] = useState<{
    [key: string]: { [key: string]: number };
  }>({});
  const [ratingsData, setRatingsData] = useState<RatingData[]>([
    { label: "5", values: [0, 0, 0, 0, 0], color: "#C22D7E" },
    { label: "4", values: [0, 0, 0, 0, 0], color: "#D86393" },
    { label: "3", values: [0, 0, 0, 0, 0], color: "#E58DA4" },
    { label: "2", values: [0, 0, 0, 0, 0], color: "#F4B7C8" },
    { label: "1", values: [0, 0, 0, 0, 0], color: "#F8D1DD" },
  ]);

  const router = useRouter();

  const fetchData = async () => {
    const idOfSurvey = searchParams.get("surveyId") || "";
    console.log("Params Id", idOfSurvey)
    const { data: surveys } = await client.models.Survey.list({
      filter: {
        id: {
          eq: idOfSurvey,
        },
      },
    });
    if (surveys.length === 0) {
      console.error("No surveys found for company:");
      return;
    }
    console.log("params survey", surveys);
    const survey = surveys[0];

    const { data: surveyResponses } =
      await client.models.AverageSurveyResults.list({
        filter: {
          surveyId: {
            eq: survey.id,
          },
        },
      });

    const { data: factorImportanceResponses } =
      await client.models.FactorImportance.list({
        filter: {
          surveyId: {
            eq: survey.id,
          },
        },
      });

    const EachfactorImportanceIndividualCount =
      factorImportanceResponses.reduce((acc, response) => {
        const { factor, score } = response;

        // Initialize factor object if it doesn't exist
        if (!acc[factor]) {
          acc[factor] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        }

        // Increment the count for the respective score
        acc[factor][score] += 1;

        return acc;
      }, {} as { [factor: string]: { [score: number]: number } });

    const EachfactorImportanceIndividualPercentage = Object.keys(
      EachfactorImportanceIndividualCount
    ).reduce((acc, factor) => {
      const totalResponsesForFactor = Object.values(
        EachfactorImportanceIndividualCount[factor]
      ).reduce((sum, count) => sum + count, 0);

      acc[factor] = Object.keys(
        EachfactorImportanceIndividualCount[factor]
      ).reduce((scoreAcc, score) => {
        scoreAcc[score] = parseFloat(
          (
            (EachfactorImportanceIndividualCount[factor][Number(score)] /
              totalResponsesForFactor) *
            100
          ).toFixed(2)
        );
        return scoreAcc;
      }, {} as { [score: string]: number });

      return acc;
    }, {} as { [factor: string]: { [score: string]: number } });
    console.log(
      "Factor Importance Percentage by Score:",
      EachfactorImportanceIndividualPercentage
    );

    const factorWithIndexes: any = {
      "Psychological Safety": 0,
      "Growth Satisfaction": 1,
      "Purpose" : 2,
      "Advocacy" : 3,
      "Alignment" : 4,
    };
    //update the RatingsData with the percentage of each factor by matching the label of ratings with the score of each factor
    const tempratingsData = ratingsData;
    console.log("tempratingsData before", tempratingsData);
    //loop over the EachfactorImportanceIndividualPercentage object and update the ratingsData
    for (const [factor, scores] of Object.entries(
      EachfactorImportanceIndividualPercentage
    )) {
      //loop over the tempRatingsData, and check where the label of ratingsData matches the key of the scores
      for (let i = 0; i < tempratingsData.length; i++) {
        if (tempratingsData[i].label === "5") {
          tempratingsData[i].values[factorWithIndexes[factor]] = scores["5"];
        } else if (tempratingsData[i].label === "4") {
          tempratingsData[i].values[factorWithIndexes[factor]] = scores["4"];
        } else if (tempratingsData[i].label === "3") {
          tempratingsData[i].values[factorWithIndexes[factor]] = scores["3"];
        } else if (tempratingsData[i].label === "2") {
          tempratingsData[i].values[factorWithIndexes[factor]] = scores["2"];
        } else if (tempratingsData[i].label === "1") {
          tempratingsData[i].values[factorWithIndexes[factor]] = scores["1"];
        }
      }
    }

    console.log("tempratingsData after", tempratingsData);

    //filtering out the responses with score 5
    const factorImportanceResponsesFiltered = factorImportanceResponses.filter(
      (response) => response.score === 5
    );
    //getting the count of each factor
    const factorImportanceCount = factorImportanceResponsesFiltered.reduce(
      (acc, response) => {
        if (!acc[response.factor]) {
          acc[response.factor] = 0;
        }
        acc[response.factor] += 1;
        return acc;
      },
      {} as { [key: string]: number }
    );

    //getting the percentage of each factor
    const totalResponses = factorImportanceResponsesFiltered.length;
    const factorImportancePercentage = Object.keys(
      factorImportanceCount
    ).reduce((acc, factor) => {
      acc[factor] = parseFloat(
        ((factorImportanceCount[factor] / totalResponses) * 100).toFixed(2)
      );
      return acc;
    }, {} as { [key: string]: number });

    setPercentageFactorImportance(factorImportancePercentage);

    const { data: indivdualSurveyResponses } =
      await client.models.SurveyResults.list({
        filter: {
          surveyId: {
            eq: survey.id,
          },
        },
      });

    const tempIndividualSurveyResponses: any[] = [];
    indivdualSurveyResponses.forEach((response) => {
      if (typeof response.allanswersjson === "string") {
        const surveyResponse = JSON.parse(response.allanswersjson);
        tempIndividualSurveyResponses.push(surveyResponse);
      } else {
        console.error(
          "Invalid type for surveyResultsjson:",
          typeof response.allanswersjson
        );
      }
    });
    setAllIndividualSurveyResponses(tempIndividualSurveyResponses);

    const allResponses: any[] = [];
    surveyResponses.forEach((response) => {
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
    setAllSurveyResponses(allResponses);

    const totalScores: { [key: string]: { total: number; count: number } } = {};
    allResponses.forEach((response) => {
      Object.keys(response).forEach((factor) => {
        if (!totalScores[factor]) {
          totalScores[factor] = { total: 0, count: 0 };
        }
        totalScores[factor].total += response[factor];
        totalScores[factor].count += 1;
      });
    });

    const avgScores = Object.keys(totalScores).reduce((acc, factor) => {
      acc[factor] = totalScores[factor].total / totalScores[factor].count;
      return acc;
    }, {} as { [key: string]: number });

    setAverageScores(avgScores);
  };

  useEffect(() => {
    if (searchParams.has("surveyId")) {
      fetchData();
    }
  }, []);

  useEffect(() => {
    const handleFactorChange = () => {
      if (allIndividualSurveyResponses.length === 0) {
        console.warn("No individual survey responses available yet.");
        return;
      }

      console.log(`Factor changed to: ${selectedFactor}`);

      const questionIds = [];
      for (let i = 0; i < allIndividualSurveyResponses.length; i++) {
        const response = allIndividualSurveyResponses[i];
        // Check if the key of the response matches the selected factor
        if (response.hasOwnProperty(selectedFactor)) {
          for (let j = 0; j < response[selectedFactor].length; j++) {
            questionIds.push(response[selectedFactor][j].questionId);
          }
        }
      }

      //for each individual question id, go through allIndividualSurveyResponses array, and for the selected factor, get the score for that question and in at the end take the average for each questionId
      const questionScores: any = {};
      questionIds.forEach((questionId) => {
        let totalScore = 0;
        let count = 0;
        for (let i = 0; i < allIndividualSurveyResponses.length; i++) {
          const response = allIndividualSurveyResponses[i];
          if (response.hasOwnProperty(selectedFactor)) {
            for (let j = 0; j < response[selectedFactor].length; j++) {
              if (response[selectedFactor][j].questionId === questionId) {
                totalScore += Number(response[selectedFactor][j].selection);
                count += 1;
              }
            }
          }
        }
        questionScores[questionId] = totalScore / count;
      });

      console.log("avgquestionScores", questionScores);
      setAvgQuestionScoresArray(questionScores);
    };

    handleFactorChange();
  }, [selectedFactor, allIndividualSurveyResponses]);

  const navItems = [
    {
      label: "📦 Overview",
      active: false,
      href : "/admin",
    },
    { label: "📊 Analytics", active: true, href: `/admin/analytics?surveyId=${searchParams.get('surveyId')}` },
    { label: "🏢 Employees", active: false, href: `/admin/employees?surveyId=${searchParams.get('surveyId')}` },
  ].filter((item) => item !== undefined);

  const categories = [
    "Psychological Safety",
    "Growth Satisfaction",
    "Purpose",
    "Advocacy",
    "Alignment",
  ];

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar navItems={navItems} />
        <div className="w-4/5 p-8 bg-gray-50">
          <h1 className="text-2xl font-semibold mb-6">Analytics</h1>
          <div className="border p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col items-center w-full h-[400px] border-2 border-white rounded-sm p-4 bg-white">
                <h2 className="text-sm font-semibold mb-2">
                  %age of Employees rated each factor as most important
                </h2>
                <div className="w-full h-full">
                  <PieChart data={percentageFactorImportance} />
                </div>
              </div>
              <div className="flex flex-col items-center w-full h-[400px] border-2 border-white rounded-sm p-4 bg-white overflow-hidden">
                <h2 className="text-sm font-semibold mb-2">
                  How important each factor is to employees
                </h2>
                <div className="w-full h-full">
                  <StackedBarChart
                    ratings={ratingsData}
                    categories={categories}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center w-full h-[400px] border-2 border-white rounded-sm p-4 bg-white">
                <h2 className="text-sm font-semibold mb-2">
                  Average Score for each factor
                </h2>
                <div className="w-full h-full">
                  <BarChart data={averageScores} />
                </div>
              </div>
              <div className="flex flex-col items-center w-full h-[400px] border-2 border-white rounded-sm p-4 bg-white">
                <h2 className="text-sm font-semibold mb-2">
                  Average score for specific factor for each question
                </h2>
                <div className="w-full flex justify-end mb-2">
                  <DropdownButton
                    selectedFactor={selectedFactor}
                    setSelectedFactor={setSelectedFactor}
                  />
                </div>
                <div className="w-full h-full">
                  <AdminBarChart data={avgQuesstionScoresArray} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function () {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminPage />
    </Suspense>
  );
}
