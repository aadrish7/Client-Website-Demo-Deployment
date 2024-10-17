"use client";

import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import { useRouter } from "next/navigation";
import outputs from "@/amplify_outputs.json";
import Header from "@/components/superadminHeader";
import { fetchUserAttributes } from "aws-amplify/auth";
import { Suspense } from "react";
import useUserStore from "@/store/userStore";
import Breadcrumb from "@/components/adminBreadCrumb";
import {
  createPaginatedFetchFunctionForUser,
  createPaginatedFetchFunctionForSurveyResults,
  createPaginatedFetchFunctionForSurvey,
} from "@/constants/pagination";

Amplify.configure(outputs);
const client = generateClient<Schema>();

const AdminPage: React.FC = () => {
  const router = useRouter();
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [error, setError] = useState<string | null>(null); // Error state
  const [noData, setNoData] = useState<boolean>(false); // No data state
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [pageSurveyId, setPageSurveyId] = useState<string | null>(null);
  const { surveyId, setSurveyId } = useUserStore();


// 1. Gets the email of the current user
// 2. Fetches the admin user data based on the email and role "admin"
// 3. Fetches the companyId of the admin user
// 4. Fetches the surveys for the company using the companyId
// 5. Fetches the percentage completion for each survey using the total number of employees and the number of survey results
// 6. Sets the table headers and data based on the fetched data
  const fetchData = async () => {
    try {
      setError(null); // Reset previous errors
      setNoData(false); // Reset no data state
      setLoading(true); // Start loading

      const userAttributes = await fetchUserAttributes();
      if (!userAttributes) {
        throw new Error("No user attributes found");
      }

      // Fetch admin user data
      const filterForAdmin = {
        email: {
          eq: userAttributes.email,
        },
        role: {
          eq: "admin",
        },
      };

      const usersdata: any[] = await createPaginatedFetchFunctionForUser(client, filterForAdmin)();
      if (usersdata.length === 0) {
        setNoData(true);
        throw new Error(`No user found with email: ${userAttributes.email}`);
      }

      const companyId = usersdata[0].companyId;

      if (!companyId) {
        setNoData(true);
        throw new Error(`No company found for user: ${userAttributes.email}`);
      }

      // Fetch surveys for the company
      const filterForSurveys = {
        companyId: {
          eq: companyId,
        },
      };
      const surveys = await createPaginatedFetchFunctionForSurvey(client, filterForSurveys)();
      if (surveys.length === 0) {
        setNoData(true);
        throw new Error(`No surveys found for company: ${companyId}`);
      }

      setTableHeaders(["Survey Name", "Survey Status", "Percentage Completion"]);

      // Fetch Percentage Completion for each survey
      const tableData = await Promise.all(
        surveys.map(async (survey) => {
          const surveyId = survey.id;

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

          const filterForSurveyResults = {
            surveyId: {
              eq: surveyId,
            },
          };
          const SurveyResults = await createPaginatedFetchFunctionForSurveyResults(client, filterForSurveyResults)();
          const lengthOfSurveyResults = SurveyResults.length;

          const finalpercentage = lengthOfEmployees > 0
            ? (lengthOfSurveyResults / lengthOfEmployees) * 100
            : 0;

          return {
            surveyName: survey?.surveyName || "",
            start: survey?.start === true ? "In progress" : "Completed",
            "Percentage Completion": finalpercentage.toFixed(2) + "%",
          };
        })
      );

      if (tableData.length === 0) {
        setNoData(true); // Set no data if tableData is empty
      } else {
        setTableData(tableData);
      }
    } catch (err: any) {
      console.error(err);
      setError(`Error fetching data: ${err.message}`);
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTableClick = async (surveyName: string) => {
    try {
      setError(null); // Reset previous errors

      const filterForSurvey = {
        surveyName: {
          eq: surveyName,
        },
      };

      const surveyData: any = await createPaginatedFetchFunctionForSurvey(client, filterForSurvey)();
      if (surveyData.length === 0) {
        throw new Error(`No survey found with name: ${surveyName}`);
      }
      setSurveyId(surveyData[0].id);
      router.push(`/admin/overview?surveyId=${surveyData[0].id}`);
    } catch (err: any) {
      console.error(err);
      setError(`Error loading survey data: ${err.message}`);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1 justify-center">
        <div className="w-4/5 p-8">
          <Breadcrumb />
          <h1 className="text-2xl font-semibold mb-6">List of Surveys</h1>
          {error && <div className="text-red-600 mb-4">{error}</div>} {/* Show error message */}
          {loading ? (
            <div className="text-center text-gray-600 mt-6">Loading data, please wait...</div>
          ) : noData ? (
            <div className="text-center text-gray-600 mt-6">No data found</div>
          ) : (
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
          )}
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
