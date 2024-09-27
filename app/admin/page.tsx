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

Amplify.configure(outputs);
const client = generateClient<Schema>();

const AdminPage: React.FC = () => {
  const router = useRouter();
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);

  const fetchData = async () => {
    const userAttributes = await fetchUserAttributes();
    const { data: usersdata } = await client.models.User.list({
      filter: {
        email: {
          eq: userAttributes.email,
        },
      },
    });
    if (usersdata.length === 0) {
      console.error("No user found with email:", userAttributes.email);
      return;
    }
    const companyId = usersdata[0].companyId;
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

    console.log("surveys", surveys);
    setTableHeaders(["Survey Name", "Survey Status"]);
    setTableData(
      surveys.map((survey) => ({
        surveyName: survey?.surveyName || "",
        start: survey?.start === true ? "In progress" : "Completed",
      }))
    );
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
    router.push(`/admin/analytics?surveyId=${surveyData[0].id}`);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1 justify-center">
        <div className="border w-[90%] p-8 bg-white mx-auto mt-6">
          <h2 className="text-xl font-semibold mb-6">Select Survey</h2>
          <div className=" border p-4 mt-10 pt-16">
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
                          {header === "Survey Status" && row.start === "Completed" ? (
                            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Completed
                            </span>
                          ) : header === "Survey Status" && row.start === "In progress" ? (
                            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              In progress
                            </span>
                          ) : header === "Survey Name" ? (
                            row.surveyName
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
    </div>
  );
};

export default AdminPage;
