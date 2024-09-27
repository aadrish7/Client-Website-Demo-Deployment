"use client";
import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import Header from "@/components/superadminHeader";
import Sidebar from "@/components/superadminSidebar";
import Table from "@/components/table";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

Amplify.configure(outputs);
const client = generateClient<Schema>();

const EmployeesPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);

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
    console.log("survey", survey);

    const { data: listOfEmployees } = await client.models.User.list({
      filter: {
        surveyId: {
          eq: survey.id,
        },
        role: {
          eq: "employee",
        },
      },
    });
    const { data: attemptedSurveyResponses } =
      await client.models.SurveyResults.list({
        filter: {
          surveyId: {
            eq: survey.id,
          },
        },
      });
    const attemptedSurveyUserIds = attemptedSurveyResponses.map(
      (response) => response.userId
    );
    console.log("attemptedSurveyUserIds", attemptedSurveyUserIds);
    console.log("listOfEmployees", listOfEmployees);
    setTableHeaders(["name", "department", "email", "status"]);
    setTableData(
      listOfEmployees.map((surveyResponse) => {
        return {
          name:
            surveyResponse?.firstName + " " + surveyResponse?.lastName || "",
          department: surveyResponse?.department || "",
          email: surveyResponse?.email || "",
          status: attemptedSurveyUserIds.includes(surveyResponse.id)
            ? "Attempted"
            : "Not Attempted",
        };
      })
    );
  };

  useEffect(() => {
    if (searchParams.has("surveyId")) {
      fetchData();
    }
  }, []);

  const navItems = [
    {
      label: "📦 Overview",
      active: false,
      href: "/admin",
    },
    {
      label: "📊 Analytics",
      active: false,
      href: `/admin/analytics?surveyId=${searchParams.get("surveyId")}`,
    },
    {
      label: "🏢 Employees",
      active: true,
      href: `/admin/employees?surveyId=${searchParams.get("surveyId")}`,
    },
  ].filter((item) => item !== undefined);

  const getStatusStyle = (status: string) => {
    if (status === 'Attempted') {
      return 'inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800';
    } else if (status === 'Not Attempted') {
      return 'inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800';
    }
    return ''; 
  };

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar navItems={navItems} />
        <div className="w-4/5 p-8 bg-gray-50">
          <h1 className="text-2xl font-semibold mb-6">Employees</h1>
          <div className="border p-4">
            <div className="overflow-x-auto border border-gray-200 rounded-md">
              <table className="min-w-full bg-white divide-y divide-gray-200">
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
                          className={`px-6 py-4 whitespace-nowrap text-sm`}
                        >
                        {header.toLowerCase() === 'status' ? (
                            <span className={getStatusStyle(row[header])}>

                              {row[header]}

                            </span>
                          ) : (

                            row[header]
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
    </div>
  );
};

export default function () {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmployeesPage />
    </Suspense>
  );
}
