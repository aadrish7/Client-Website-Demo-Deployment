"use client";
import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import Header from "@/components/superadminHeader";
import Sidebar from "@/components/adminSideBar";
import DropdownButton from "@/components/dropDownButton";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AdminEmployeeComponent from "@/components/adminEmployeeComponent";
import { data } from '../../../amplify/data/resource';
import Breadcrumb from "@/components/adminBreadCrumb";
import { disable } from 'aws-amplify/analytics';

const PieChart = dynamic(() => import("@/components/adminPieChart"), {
  ssr: false,
  loading: () => <div className="text-center py-4">Loading Graph...</div>,
});

const BarChart = dynamic(() => import("@/components/barChartEmployee"), {
  ssr: false,
  loading: () => <div className="text-center py-4">Loading Graph...</div>,
});

Amplify.configure(outputs);
const client = generateClient<Schema>();

const OverviewPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [surveyName, setSurveyName] = useState<string>("");
  const [companyName, setComoanyName] = useState<string>("");
  const [percentageFactorImportance, setPercentageFactorImportance] = useState<{
    [key: string]: number;
  }>({});
  const [averageScores, setAverageScores] = useState<{ [key: string]: number }>(
    {}
  );
  const [snippetSetId, setSnippetSetId] = useState<string>("");
  //array of strings
  const [matchingSnippets, setMatchingSnippets] = useState<any>([]);

  const isScoreInRange = (score: number, range: Number): boolean => {
    const rangeValue = range.valueOf();
    const min = rangeValue - 0.49;
    const max = rangeValue + 0.5;
    return score >= min && score <= max;
  };



  const preparingDataForPercentagePieChart = (
    factorImportanceResponses: { factor: string; score: number }[]
  ) => {
    // Step 1: Filter responses to include only those with a score of 5
    const factorImportanceResponsesFiltered = factorImportanceResponses.filter(
      (response) => response.score === 5
    );

    // Step 2: Count occurrences of each factor
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

    // Step 3: Calculate the percentage of each factor
    const totalResponses = factorImportanceResponsesFiltered.length;
    const factorImportancePercentage = Object.keys(
      factorImportanceCount
    ).reduce((acc, factor) => {
      acc[factor] = totalResponses
        ? parseFloat(
            ((factorImportanceCount[factor] / totalResponses) * 100).toFixed(2)
          )
        : 0; // Handle division by zero if totalResponses is 0
      return acc;
    }, {} as { [key: string]: number });

    // Step 4: Update the state with the calculated percentages
    setPercentageFactorImportance(factorImportancePercentage);
  };




  const fetchData = async () => {
    const idOfSurvey = searchParams.get("surveyId") || "";

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
    const survey = surveys[0];
    setSurveyName(survey.surveyName);
    setSnippetSetId(()=>survey.snippetSetId || "");
   if (!survey.companyId) {
      console.error("No company found for survey:", survey);
      return;
    } 
    const { data: companies } = await client.models.Company.list({
      filter: {
        id: {
          eq: survey.companyId,
        },
      },
    });
    if (companies.length === 0) {
      console.error("No companies found for survey:", survey);
      return;
    }
    const company = companies[0];
    if (!company.companyName) {
      console.error("No company name found for company:", company);
      return;
    }
    setComoanyName(company.companyName);

    const { data: factorImportanceResponses } =
    await client.models.FactorImportance.list({
      filter: {
        surveyId: {
          eq: survey.id,
        },
      },
    });

   

    preparingDataForPercentagePieChart(factorImportanceResponses)

    const {data : averageSurveyResponses} =  await client.models.AverageSurveyResults.list({
      filter : {
        surveyId: {
          eq: survey.id,
        },
      }
    })
    if (averageSurveyResponses.length == 0){
      console.error("No Average Surveys found")
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
    const finalAverage = averageSurveyResponses[0];
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
    console.log("average", avgScores)

    setAverageScores(avgScores)
  };

  useEffect(() => {
    if (searchParams.has("surveyId")) {
      fetchData();

    }
  }, [searchParams]);
  const fetchAllSnippets = async (client: any, pageSize: number = 100): Promise<any[]> => {
    let allTodos: any[] = [];
    let nextToken: string | null = null;
    let hasMorePages: boolean = true;
  
    while (hasMorePages) {
      const { data: todos, nextToken: newNextToken }: { data: any[]; nextToken: any } = await client.models.TextSnippet.list({
        nextToken,
        limit: pageSize,
      });
  
      // Combine the new todos with the existing ones
      allTodos = [...allTodos, ...todos];
  
      // Update the nextToken for the next request
      nextToken = newNextToken;
  
      // If there's no more nextToken or fewer items than the page size, stop fetching
      if (!nextToken || todos.length < pageSize) {
        hasMorePages = false;
      }
    }
  
    return allTodos;
  };
  const getSnippets = async () => {
    const allSnippets = await fetchAllSnippets(client);
    if (!allSnippets) {
      console.error("No snippets found for company:");
      return;
    }
    const overviewSnippets = allSnippets.filter((snippet: any) => snippet.snippetSetId === snippetSetId && snippet.disabled === true && snippet.type === "adminoverview");

    console.log("Overview Snippets", overviewSnippets)

    if (overviewSnippets.length === 0) {
      console.error("No snippets found for company:");
      return;
    }
    return overviewSnippets;
  }
  useEffect(() => {
    const findMatchingSnippets = async () => {
      if (Object.keys(averageScores).length > 0) {
        // Convert the averageScores object to an array of entries and sort it by the score value
        const sortedScores = Object.entries(averageScores).sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

        console.log("sortedScores", sortedScores);
    
        // Fetch the snippets
        const snippets = await getSnippets();
        if (!snippets) {
          console.error("No snippets found for company:");
          return;
        }
    
        // Filter snippets based on sortedScores
        const matchedSnippets = snippets.filter((snippet: any) => {
          // Find the factorScore from the sorted averageScores
          const factorScoreEntry = sortedScores.find(([factor]) => factor === snippet.factor);
          const factorScore = factorScoreEntry ? factorScoreEntry[1] : null;
          return factorScore && isScoreInRange(factorScore, snippet.score);
        });
    
        // Reverse the matchedSnippets and set them
        setMatchingSnippets(matchedSnippets);
      }
    };
    
    findMatchingSnippets();
    
  }, [averageScores]);

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar activePath="/admin/overview" />
        <div className="w-4/5 p-3 bg-gray-50 flex flex-col">
        <Breadcrumb/>
          {/* Section with charts and summary paragraph */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            {surveyName.length > 0 ?(<h1 className="text-[20px] font-bold mb-6">
              Hi <span className="text-blue-500">{companyName}</span>! Here is your
              {" "}<span className="text-blue-500">{surveyName} </span> survey summary.
            </h1>) : (<h1 className="text-[20px] font-bold mb-6"></h1>)}

            <div className="flex mb-6">
              {/* Pie Chart Section */}
              <div className="w-full md:w-1/2 pr-4 border-b border-r">
                <h2 className="text-sm font-semibold mb-2 flex items-center">
                  % of employees rated each factor as the most important
                  <span className="ml-1 text-gray-400">ⓘ</span>
                </h2>
                <div className="w-full h-96 pl-5 pt-6">
                  <PieChart data={percentageFactorImportance} />
                </div>
              </div>

              {/* Bar Chart Section */}
              <div className="w-full md:w-1/2 pl-4 border-b">
                <h2 className="text-sm font-semibold mb-2 flex items-center">
                  Average score for each factor
                  <span className="ml-1 text-gray-400">ⓘ</span>
                </h2>
                <div className="w-full h-96">
                  <BarChart data={averageScores} />
                </div>
              </div>
            </div>

            {/* Paragraph Summary */}
            <div className="text-gray-600 text-sm">
              <p>
              {matchingSnippets.map((snippet: any, index: any) => (
                <span key={index}>{snippet.snippetText} {" "}</span>
              ))}
              </p>
            </div>
          </div>

          {/* Section with AdminEmployeeComponent */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <AdminEmployeeComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function () {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OverviewPage />
    </Suspense>
  );
}
