"use client";
import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import Header from "@/components/superadminHeader";
import Sidebar from "@/components/adminSideBar";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Breadcrumb from "@/components/breadCrumb";

Amplify.configure(outputs);
const client = generateClient<Schema>();

const EmployeesPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [filteredData, setFilteredData] = useState<Record<string, string>[]>(
    []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredData.length / itemsPerPage); i++) {
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
              currentPage === i
                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                : "text-gray-500 hover:bg-gray-50"
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
            currentPage === 1
              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          1
        </button>
      );

      // Add ellipsis if necessary
      if (currentPage > 3) {
        buttons.push(
          <span
            key="ellipsis1"
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
          >
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
      for (
        let i = currentPage + 1;
        i < Math.min(totalPages, currentPage + 2);
        i++
      ) {
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
          <span
            key="ellipsis2"
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
          >
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
            currentPage === totalPages
              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
              : "text-gray-500 hover:bg-gray-50"
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
    setTableHeaders(["name", "department", "email", "status"]);
    const employees = listOfEmployees.map((surveyResponse) => ({
      name: surveyResponse?.firstName + " " + surveyResponse?.lastName || "",
      department: surveyResponse?.department || "",
      email: surveyResponse?.email || "",
      status: attemptedSurveyUserIds.includes(surveyResponse.id)
        ? "Completed"
        : "Not Started",
    }));
    setTableData(employees);
    setFilteredData(employees);

    const uniqueDepartments: string[] = [];
    for (const employee of employees) {
      if (!uniqueDepartments.includes(employee.department)) {
        uniqueDepartments.push(employee.department);
      }
    }
    setDepartments(uniqueDepartments);

    setLoading(false);
  };

  useEffect(() => {
    console.log("search params value", searchParams.get("surveyId"));
    if (searchParams.has("surveyId")) {
      
      fetchData();
    }
  }, []);

  useEffect(() => {
    filterData();
  }, [selectedDepartment, selectedStatus, tableData, searchTerm]);

  const filterData = () => {
    const filtered = tableData.filter((employee) => {
      const matchesDepartment =
        selectedDepartment === null ||
        employee.department === selectedDepartment;
      const matchesStatus =
        selectedStatus === null || employee.status === selectedStatus;
      const matchesSearch =
        searchTerm === "" ||
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.status.toLocaleLowerCase().includes(searchTerm.toLowerCase());
      return matchesDepartment && matchesStatus && matchesSearch;
    });
    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getStatusStyle = (status: string) => {
    if (status === "Completed") {
      return "inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800";
    } else if (status === "Not Started") {
      return "inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800";
    }
    return "";
  };

  const navItems = [
    {
      label: "📦 Overview",
      active: false,
      href:`/admin/overview?surveyId=${searchParams.get("surveyId")}`,
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

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar activePath="/admin/employees" />
        <div className="w-4/5 p-8 bg-gray-50">
        <Breadcrumb/>
        <div className="bg-white p-4">
          <h1 className="text-2xl font-semibold mb-6">Employees</h1>
          <div className="flex justify-between items-center mb-4">
            {/* Left Side - Two Buttons */}
            <div className="flex space-x-4">
              {/* Department Filter Button */}
              <div className="relative inline-block text-left">
                <button
                  onClick={() => {
                    setShowDepartmentDropdown(!showDepartmentDropdown);
                    setShowStatusDropdown(false);
                  }}
                  className="inline-flex justify-center w-48 rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span className="truncate">
                    {selectedDepartment || "All Departments"}
                  </span>
                </button>
                {showDepartmentDropdown && (
                  <div className="absolute mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setSelectedDepartment(null);
                          setShowDepartmentDropdown(false);
                        }}
                        className="block px-4 py-2 text-sm text-gray-700"
                      >
                        All Departments
                      </button>
                      {departments.map((dept) => (
                        <button
                          key={dept}
                          onClick={() => {
                            setSelectedDepartment(dept);
                            setShowDepartmentDropdown(false);
                          }}
                          className="block px-4 py-2 text-sm text-gray-700"
                        >
                          {dept}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Filter Button */}
              <div className="relative inline-block text-left">
                <button
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowDepartmentDropdown(false);
                  }}
                  className="inline-flex justify-center w-48 rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span className="truncate">
                    {selectedStatus || "All Status"}
                  </span>
                </button>
                {showStatusDropdown && (
                  <div className="absolute mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setSelectedStatus(null);
                          setShowStatusDropdown(false);
                        }}
                        className="block px-4 py-2 text-sm text-gray-700"
                      >
                        All Status
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStatus("Completed");
                          setShowStatusDropdown(false);
                        }}
                        className="block px-4 py-2 text-sm text-gray-700"
                      >
                        Completed
                      </button>
                      <button
                        onClick={() => {
                          setSelectedStatus("Not Started");
                          setShowStatusDropdown(false);
                        }}
                        className="block px-4 py-2 text-sm text-gray-700"
                      >
                        Not Started
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Search Bar */}
            <div className="flex-grow max-w-md">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border p-4">
            {loading ? (
              <div className="text-center py-4">
                Loading Data for Employees...
              </div>
            ) : currentItems.length > 0 ? (
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
                              {header.toLowerCase() === "status" ? (
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
                    Showing{" "}
                    <span className="font-semibold text-black">
                      {indexOfFirstItem + 1} -{" "}
                      {Math.min(indexOfLastItem, filteredData.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-black">
                      {filteredData.length}
                    </span>
                  </h6>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      {renderPaginationButtons()}
                    </nav>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">No employees to display</div>
            )}
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
