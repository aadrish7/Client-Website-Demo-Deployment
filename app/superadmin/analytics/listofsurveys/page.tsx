"use client";

import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import { useRouter } from "next/navigation";
import outputs from "@/amplify_outputs.json";
import Header from "@/components/superadminHeader";
import { fetchUserAttributes } from "aws-amplify/auth";
import Sidebar from "@/components/superadminSidebar";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Breadcrumb from "@/components/breadCrumb";
import {
  createPaginatedFetchFunctionForUser,
  createPaginatedFetchFunctionForSurveyResults,
  createPaginatedFetchFunctionForSurvey,
  createPaginatedFetchFunctionForAverageSurveyResults,
  createPaginatedFetchFunctionForFactorImportance,
  createPaginatedFetchFunctionForCompany,
  createPaginatedFetchFunctionForTextSnippet,
  createPaginatedFetchFunctionForQuestion,
  createPaginatedFetchFunctionForCollection,
  createPaginatedFetchFunctionForSnippetSet
} from "@/constants/pagination";

Amplify.configure(outputs);
const client = generateClient<Schema>();

const AdminPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);

  const fetchData = async () => {
    const CompanyId = searchParams.get("companyId");
    const companyId = searchParams.get("companyId");
    console.log("CompanyId", CompanyId);
    if (!CompanyId) {
      console.error("No company id found in query params");
      return;
    }
    const filterForCompany = {
      id: {
        eq: CompanyId,
      },
    };
    const companyData = await createPaginatedFetchFunctionForCompany(client, filterForCompany)();
    if (companyData.length === 0) {
      console.error("No company found with id:", CompanyId);
      return;
    }
    console.log("companyData", companyData);

    const userAttributes = companyData[0].adminEmail;
    const filterForUser = {
      email: {
        eq: userAttributes,
      },
      role: {
        eq: "admin",
      },
    };
    const usersdata = await createPaginatedFetchFunctionForUser(client, filterForUser)();
    if (usersdata.length === 0) {
      console.error("No user found with email:", userAttributes);
      return;
    }
    const filterForSurvey = {
      companyId: {
        eq: companyId,
      },
    };
    const surveys = await createPaginatedFetchFunctionForSurvey(client, filterForSurvey)();
    if (surveys.length === 0) {
      console.error("No surveys found for company:", companyId);
      return;
    }

    setTableHeaders(["Survey Name", "Survey Status", "Percentage Completion"]);

    const tableData = await Promise.all(
      surveys.map(async (survey) => {
        const surveyId = survey.id;

        // Get the total number of employees
        const filterForEmployees = {
          companyId: {
            eq: companyId,
          },
          surveyId: {
            eq: surveyId,
          },
        };
        const listOfAllEmployees = await createPaginatedFetchFunctionForUser(client, filterForEmployees)();
        const lengthOfEmployees = listOfAllEmployees.length;

        // Get the total number of survey results
        const filterForAverageSurveyResults = {
          surveyId: {
            eq: surveyId,
          },
        };
        const SurveyResults = await createPaginatedFetchFunctionForAverageSurveyResults(client, filterForAverageSurveyResults)();
        const lengthOfSurveyResults = SurveyResults.length;

        // Calculate completion percentage
        const finalpercentage =
          lengthOfEmployees > 0
            ? (lengthOfSurveyResults / lengthOfEmployees) * 100
            : 0;

        // Return data for this survey
        return {
          surveyName: survey?.surveyName || "",
          start: survey?.start === true ? "In progress" : "Completed",
          "Percentage Completion": finalpercentage.toFixed(2) + "%",
        };
      })
    );

    setTableData(tableData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTableClick = async (surveyName: string) => {
    const filterForSurvey = {
      surveyName: {
        eq: surveyName,
      },
    };
    const surveyData = await createPaginatedFetchFunctionForSurvey(client, filterForSurvey)();
    router.push(`listofsurveys/overview?surveyId=${surveyData[0].id}`);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1 justify-center">
      <Sidebar activePath="/superadmin/analytics" />
        <div className="w-4/5 p-8">
          <Breadcrumb />
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
                        ) : header === "Percentage Completion" ? (
                          row["Percentage Completion"]
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
