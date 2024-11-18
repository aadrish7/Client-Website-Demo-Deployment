"use client";

import React, { useState } from "react";
import Papa from "papaparse";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { useEffect } from "react";
import { createPaginatedFetchFunctionForUser } from "@/constants/pagination";
import RootLayout from "@/app/layout";

// Amplify configuration
Amplify.configure(outputs);
const client = generateClient<Schema>();

const CsvParserForQuestions = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [averageJson, setAverageJson] = useState<any[]>([]);
  const [detailedJson, setDetailedJson] = useState<any[]>([]);
  const [surveyId, setSurveyId] = useState<string>("");

  // Categories
  const categories = [
    "Psychological Safety",
    "Growth Satisfaction",
    "Purpose",
    "Advocacy",
    "Flexibility",
  ];

  // File upload and parsing handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      Papa.parse(file, {
        header: true, // Treat the first row as headers
        skipEmptyLines: true, // Skip empty lines
        complete: (result) => {
          setCsvData(result.data);
          processCsvData(result.data);
        },
      });
    }
  };

  const processCsvData = async (data: any[]) => {
    const averageResults: any[] = [];
    const detailedResults: any[] = [];
  
    // Use for...of to handle asynchronous operations
    for (const row of data) {
      const email = row.Email;
      const factorTotals: any = {};
      const factorCounts: any = {};
      const detailedJsonForRow: any = {};
  
      // Initialize the JSON structure for detailed selections
      categories.forEach((category) => {
        detailedJsonForRow[category] = [];
      });
  
      // Go through each column in the row
      Object.keys(row).forEach((colName) => {
        if (colName !== "Email") {
          // Split the column name into factor and question parts
          const [factor, question] = colName.split("-");
          const score = parseInt(row[colName], 10);
  
          // Calculate the total for averages
          if (!factorTotals[factor]) {
            factorTotals[factor] = 0;
            factorCounts[factor] = 0;
          }
          factorTotals[factor] += score;
          factorCounts[factor] += 1;
  
          // Push the selection into the detailed JSON
          if (categories.includes(factor)) {
            detailedJsonForRow[factor].push({
              questionId: colName,
              selection: score,
            });
          }
        }
      });
  
      // Calculate average for each factor
      const averages: any = {};
      categories.forEach((category) => {
        if (factorTotals[category]) {
          averages[category] = factorTotals[category] / factorCounts[category];
        }
      });
  
      // Store the results for each row
      averageResults.push(averages);
      detailedResults.push(detailedJsonForRow);
  
      const filterForUser = {
        email: {
          eq: email,
        },
        role: {
          eq: "employee",
        },
      };
  
      // Fetch user data asynchronously
      const fetchUsers = await createPaginatedFetchFunctionForUser(client, filterForUser)();
      if (fetchUsers.length === 0) {
        console.error("No user found with email:", email);
        return;
      }
  
      const idOfUser = fetchUsers[0].id;
      await storeAverageSurveyResults(idOfUser, averages);
      await storeSurveyResults(idOfUser, detailedJsonForRow);
    }
  
    // Set the final results
    setAverageJson(averageResults);
    setDetailedJson(detailedResults);
  };
  
  // Store the AverageSurveyResults
  const storeAverageSurveyResults = async (userId: any, averageScorejson: any) => {
    try {
      const {data:savedUser } = await client.models.AverageSurveyResults.create({
        surveyId: surveyId,
        userId: userId,
        averageScorejson: JSON.stringify(averageScorejson),
      });
      console.log(`Average survey results saved for user ${savedUser}`);
    } catch (error) {
      console.error("Failed to save average survey results", error);
    }
  };

useEffect(() => {
    const fetchSurveyResults = async () => {
        const {data : surveyResponses} = await client.models.SurveyResults.list({
            filter: {
              surveyId: {
                eq: surveyId,
              },
            },
        limit: 10000,
          });
        console.log(surveyResponses);
        }

    if (surveyId) {
        fetchSurveyResults();
    }
    }, [surveyId]);
  // Store the SurveyResults
  const storeSurveyResults = async (userId: string, allanswersjson: any) => {
    try {
      const {data:savedUser} = await client.models.SurveyResults.create({
        surveyId: surveyId,
        userId: userId,
        allanswersjson: JSON.stringify(allanswersjson),
      });
      console.log(`Survey results saved for user ${savedUser}`);
    } catch (error) {
      console.error("Failed to save survey results", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Upload CSV for Questions</h2>

      {/* Survey ID Input */}
      <div className="flex flex-col mb-6">
        <label className="text-sm font-medium">Survey ID:</label>
        <input
          type="text"
          className="border border-gray-300 rounded p-2"
          value={surveyId}
          onChange={(e) => setSurveyId(e.target.value)}
          placeholder="Enter survey ID"
        />
      </div>

      {/* CSV Upload */}
      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="border border-gray-300 rounded p-2 mb-4"
      />
{/* 
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Average JSON</h3>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(averageJson, null, 2)}
        </pre>
      </div>


      <div>
        <h3 className="text-lg font-semibold">Detailed JSON</h3>
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(detailedJson, null, 2)}
        </pre>
      </div> */}
    </div>
  );
};

export default CsvParserForQuestions;