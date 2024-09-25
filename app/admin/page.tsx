"use client";

import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import { useRouter } from "next/navigation";
import outputs from "@/amplify_outputs.json";
import Header from "@/components/superadminHeader";
import Sidebar from "@/components/superadminSidebar";
import { fetchUserAttributes } from "aws-amplify/auth";
import DropdownButton from "@/components/dropDownButton";
import dynamic from "next/dynamic";
import { data } from '../../amplify/data/resource';

const PieChart = dynamic(() => import("@/components/adminPieChart"), {
  ssr: false,
  loading: () => <div>Loading Graph...</div>,
});

const BarChart = dynamic(() => import("@/components/barChartEmployee"), {
  ssr: false,
  loading: () => <div>Loading Graph...</div>,
});

const StackedBarChart = dynamic(() => import("@/components/adminStackedBarChart"), {
  ssr: false,
  loading: () => <div>Loading Graph...</div>,
});

const AdminBarChart = dynamic(() => import("@/components/adminBarChartQuestions"), {
  ssr: false,
  loading: () => <div>Loading Graph...</div>,
});
Amplify.configure(outputs);
const client = generateClient<Schema>();

const AdminPage: React.FC = () => {
  //make this kind { [key: string]: number; } usestate variable
  const [allIndividualSurveyResponses, setAllIndividualSurveyResponses] =
    useState<any[]>([]);
  const [allSurveyResponses, setAllSurveyResponses] = useState<any[]>([]);
  const [averageScores, setAverageScores] = useState<{ [key: string]: number }>(
    {}
  );
  const [avgQuesstionScoresArray, setAvgQuestionScoresArray] = useState<{ [key: string]: number }>({});
  const [selectedFactor, setSelectedFactor] = useState("Psychological Safety"); // Parent state for selected factor
  const router = useRouter();

  const fetchData = async () => {
    const userAttributes = await fetchUserAttributes();
    console.log(userAttributes.email);
    const { data: usersdata } = await client.models.User.list({
      filter: {
        email: {
          eq: userAttributes.email,
        },
      },
    });
    const companyId = usersdata[0].companyId;
    const { data: surveys } = await client.models.Survey.list({
      filter: {
        companyId: {
          eq: companyId,
        },
      },
    });
    const survey = surveys[0];

    const { data: surveyResponses } =
      await client.models.AverageSurveyResults.list({
        filter: {
          surveyId: {
            eq: survey.id,
          },
        },
      });

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
    console.log("tempIndividualSurveyResponses", tempIndividualSurveyResponses);
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
    console.log("allResponses", allResponses);
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
    fetchData();
  }, []);

  useEffect(() => {
    const handleFactorChange = () => {
      if (allIndividualSurveyResponses.length === 0) {
        console.warn("No individual survey responses available yet.");
        return; // Early return if no data is available
      }

      console.log(`Factor changed to: ${selectedFactor}`);
      console.log("allIndividual", allIndividualSurveyResponses);
      
      const questionIds = [];
      for (let i = 0; i < allIndividualSurveyResponses.length; i++) {
        const response = allIndividualSurveyResponses[i];
        // Check if the key of the response matches the selected factor
        if (response.hasOwnProperty(selectedFactor)) {
          console.log("response", response[selectedFactor]);
          for (let j = 0; j < response[selectedFactor].length; j++) {
            questionIds.push(response[selectedFactor][j].questionId);
        }
      }
    };

     //for each individual question id, go through allIndividualSurveyResponses array, and for the selected factor, get the score for that question and in at the end take the average for each questionId
      const questionScores:any = {};
      questionIds.forEach((questionId) => {
        let totalScore = 0;
        let count = 0;
        for (let i = 0; i < allIndividualSurveyResponses.length; i++) {
          const response = allIndividualSurveyResponses[i];
          if (response.hasOwnProperty(selectedFactor)) {
            for (let j = 0; j < response[selectedFactor].length; j++) {
              if (response[selectedFactor][j].questionId === questionId) {
                console.log("response[selectedFactor][j].selection", response[selectedFactor][j].selection);
                console.log("QuestionId", questionId);
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
  }

    handleFactorChange();
  }, [selectedFactor, allIndividualSurveyResponses, avgQuesstionScoresArray]); // Added allIndividualSurveyResponses to dependencies

  const navItems = [
    {
      label: "📦 Collections",
      active: false,
      subItems: [
        {
          label: "📋 Question Bank",
          active: false,
          href: "/superadmin/collections/questionbank",
        },
        {
          label: "📦 Collection",
          active: false,
          href: "/superadmin/collections/collection",
        },
      ],
    },
    {
      label: "📦 Snippets",
      active: false,
      subItems: [
        {
          label: "📋 Snippet Bank",
          active: false,
          href: "/superadmin/snippets",
        },
        {
          label: "📦 Snippet Set",
          active: false,
          href: "/superadmin/snippets/snippetset",
        },
      ],
    },
    { label: "🏢 Company", active: false, href: "/superadmin" },
    { label: "📊 Analytics", active: true, href: "/analytics" },
    { label: "💬 Help", active: false, href: "/help" },
  ].filter((item) => item !== undefined);

  const chartData = {
    "Psychological Safety": 34,
    "Growth Satisfaction": 20,
    "Alignment/Flexibility": 20,
    "Purpose": 13,
    "Advocacy": 13,
  };

  const ratingsData = [
    { label: '5', values: [70, 50, 80, 60, 65], color: '#C22D7E' },
    { label: '4', values: [20, 30, 15, 25, 20], color: '#D86393' },
    { label: '3', values: [5, 10, 3, 10, 8], color: '#E58DA4' },
    { label: '2', values: [3, 5, 1, 3, 5], color: '#F4B7C8' },
    { label: '1', values: [2, 5, 1, 2, 2], color: '#F8D1DD' },
  ];
  
  const categories = ['Psychological Safety', 'Growth Satisfaction', 'Purpose', 'Advocacy', 'Alignment'];
  
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
                <PieChart data={chartData} />
              </div>
            </div>
            <div className="flex flex-col items-center w-full h-[400px] border-2 border-white rounded-sm p-4 bg-white overflow-hidden">
              <h2 className="text-sm font-semibold mb-2">
                How important each factor is to employees
              </h2>
              <div className="w-full h-full">
              <StackedBarChart ratings={ratingsData} categories={categories} />
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

export default AdminPage;
