"use client";
import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import Header from "@/components/superadminHeader";
import Sidebar from "@/components/superadminSidebar";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

Amplify.configure(outputs);
const client = generateClient<Schema>();

const EmployeesPage: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const fetchData = async () => {
    setLoading(true);
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
    setLoading(false);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(tableData.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  const renderPaginationButtons = () => {
    const totalPages = pageNumbers.length;
    const buttons = [];

    buttons.push(
      <button
        key="prev"
        onClick={() => paginate(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
      >
        &lt;
      </button>
    );

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => paginate(i)}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
              currentPage === i ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // Always show first page button
      buttons.push(
        <button
          key={1}
          onClick={() => paginate(1)}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
            currentPage === 1 ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          1
        </button>
      );

      // Add ellipsis if necessary
      if (currentPage > 3) {
        buttons.push(
          <span key="ellipsis1" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            ...
          </span>
        );
      }

      // Add one or two buttons before current page
      for (let i = Math.max(2, currentPage - 1); i < currentPage; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => paginate(i)}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            {i}
          </button>
        );
      }

      // Current page
      if (currentPage !== 1 && currentPage !== totalPages) {
        buttons.push(
          <button
            key={currentPage}
            onClick={() => paginate(currentPage)}
            className="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
          >
            {currentPage}
          </button>
        );
      }

      // Add one or two buttons after current page
      for (let i = currentPage + 1; i < Math.min(totalPages, currentPage + 2); i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => paginate(i)}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            {i}
          </button>
        );
      }

      // Add ellipsis if necessary
      if (currentPage < totalPages - 2) {
        buttons.push(
          <span key="ellipsis2" className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
            ...
          </span>
        );
      }

      // Always show last page button
      buttons.push(
        <button
          key={totalPages}
          onClick={() => paginate(totalPages)}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
            currentPage === totalPages ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
      >
        &gt;
      </button>
    );

    return buttons;
  };

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar navItems={navItems} />
        <div className="w-4/5 p-8 bg-white">
          <h1 className="text-2xl font-semibold mb-6">Employees</h1>
          <div className="border p-4">
          {loading ? (
              <div className="text-center py-4">Loading Data for Employees...</div>
            ) : tableData.length > 0 ? (
            <>
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
                  {currentItems.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {tableHeaders.map((header, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm"
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
            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
              <h6 className="ml-1 font-thin text-gray-500 opacity-98">
               Showing <span className="font-semibold text-black">{indexOfFirstItem + 1} - {Math.min(indexOfLastItem, tableData.length)}</span> of <span className="font-semibold text-black">{tableData.length}</span>
              </h6>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  {renderPaginationButtons()}
                </nav>
              </div>
            </div>
            </>
            ) : (
              <div className="text-center py-4">No data found</div>
            )}
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