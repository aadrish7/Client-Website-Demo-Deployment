"use client";

import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import { useRouter } from "next/navigation";
import outputs from "@/amplify_outputs.json";
import Header from "@/components/superadminHeader";
import { fetchUserAttributes } from "aws-amplify/auth";
import { data } from "../../amplify/data/resource";
import Breadcrumb from "@/components/breadCrumb";
import { Suspense } from "react";
import useUserStore from "@/store/userStore";


Amplify.configure(outputs);
const client = generateClient<Schema>();

const AdminPage: React.FC = () => {
  const router = useRouter();
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const setSurveyId = useUserStore((state) => state.setSurveyId)
  const surveyId = useUserStore((state) => state.surveyId)

  const fetchData = async () => {
    const userAttributes = await fetchUserAttributes();
    
    // Fetch admin user data
    const { data: usersdata } = await client.models.User.list({
      filter: {
        email: {
          eq: userAttributes.email,
        },
        role: {
          eq: "admin",
        },
      },
    });
    if (usersdata.length === 0) {
      console.error("No user found with email:", userAttributes.email);
      return;
    }
    
    const companyId = usersdata[0].companyId;
    
    // Fetch surveys for the company
    const { data: surveys } = await client.models.Survey.list({
      filter: {
        companyId: {
          eq: companyId,
        },
      },
    });
    if (surveys.length === 0) {
      console.error("No surveys found for company:", companyId);
      return;
    }
    
    setTableHeaders(["Survey Name", "Survey Status", "Completion Percentage"]);
  
    // Fetch completion percentage for each survey
    const tableData = await Promise.all(
      surveys.map(async (survey) => {
        const surveyId = survey.id;
  
        // Fetch total number of employees for this survey
        const { data: listOfAllEmployees } = await client.models.User.list({
          filter: {
            companyId: {
              eq: companyId,
            },
            surveyId: {
              eq: surveyId,
            },
          },
        });
        const lengthOfEmployees = listOfAllEmployees.length;
  
        // Fetch total number of survey results for this survey
        const { data: SurveyResults } = await client.models.AverageSurveyResults.list({
          filter: {
            surveyId: {
              eq: surveyId,
            },
          },
        });
        const lengthOfSurveyResults = SurveyResults.length;
  
        // Calculate completion percentage
        const finalpercentage = lengthOfEmployees > 0 ? (lengthOfSurveyResults / lengthOfEmployees) * 100 : 0;
  
        // Return survey data including the completion percentage
        return {
          surveyName: survey?.surveyName || "",
          start: survey?.start === true ? "In progress" : "Completed",
          "Completion Percentage": finalpercentage.toFixed(2) + "%",
        };
      })
    );
  
    setTableData(tableData);
  };
  

  useEffect(() => {
    fetchData();
  }, []);

  const handleTableClick = async (surveyName: string) => {
    const { data: surveyData } = await client.models.Survey.list({
      filter: {
        surveyName: {
          eq: surveyName,
        },
      },
    });
    setSurveyId(surveyData[0].id)
    router.push(`/admin/overview?surveyId=${surveyData[0].id}`);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1 justify-center">
        <div className="w-4/5 p-8">
        <Breadcrumb/>
          <h1 className="text-2xl font-semibold mb-6">List of Surveys</h1>
          <div className="border p-4">
            <div className="flex items-center mb-4 justify-end">
              <div className="flex space-x-4"></div>
            </div>
            <table className="min-w-full bg-white divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  {tableHeaders.map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {tableHeaders.map((header, colIndex) => (
                      <td
                        key={colIndex}
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          header === "Survey Name"
                            ? "text-blue-500 font-bold cursor-pointer"
                            : ""
                        }`}
                        onClick={() => {
                          if (header === "Survey Name") {
                            handleTableClick(row.surveyName);
                          }
                        }}
                      >
                        {header === "Survey Status" ? (
                          row.start === "Completed" ? (
                            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              In progress
                            </span>
                          )
                        ) : header === "Survey Name" ? (
                          row.surveyName
                        ) : header === "Completion Percentage" ? (
                          row["Completion Percentage"]
                        ) : (
                          row.start
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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


