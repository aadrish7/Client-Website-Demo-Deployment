"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { Schema } from "@/amplify/data/resource";
import { createPaginatedFetchFunctionForUser } from "@/constants/pagination";

// Amplify configuration
Amplify.configure(outputs);
const client = generateClient<Schema>();

const CsvParser = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [surveyId, setSurveyId] = useState<string>("");
  const [companyId, setCompanyId] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);

  // Fetch all users from the database based on surveyId and companyId
  const getAllUsers = async () => {
    const filterForUser = {
      companyId: {
        eq: companyId,
      },
      surveyId: {
        eq: surveyId,
      },
      role: {
        eq: "employee",
      },
    };
    const fetchUsers = createPaginatedFetchFunctionForUser(client, filterForUser);
    const fetchedUsers = await fetchUsers();
    console.log(fetchedUsers);
    setUsers(fetchedUsers);
  };

  const handleSaveEmployees = async () => {
    try {
      if (!surveyId || !companyId) {
        alert("Please provide both surveyId and companyId.");
        return;
      }
      for (const employee of csvData) {
        const user = {
          firstName: employee["First Name"],
          lastName: employee["Last Name"],
          email: employee.Email,
          dob: new Date(employee.DOB).toISOString(),
          hireDate: new Date(employee["Hire Date"]).toISOString(),
          gender: employee.Gender,
          ethnicity: employee.Ethnicity,
          department: employee.Department,
          companyId: companyId,
          surveyId: surveyId,
        };
        const formattedDOB = user.dob ? new Date(user.dob).toISOString().split('T')[0] : null;
        const formattedHireDate = user.hireDate ? new Date(user.hireDate).toISOString().split('T')[0] : null;
        const {data : userstored} = await client.models.User.create({
            firstName : user.firstName,
            lastName : user.lastName,
            email : user.email,
            dob : formattedDOB,
            hireDate : formattedHireDate,
            gender : user.gender,
            ethnicity : user.ethnicity,
            department : user.department,
            companyId : user.companyId,
            surveyId : user.surveyId,   
            role : "employee",    
        })
        console.log(userstored);
      }
      alert("Data Stored Successfully");
    } catch (error) {
      console.error("Failed to process employees", error);
    }
  }

  // Call getAllUsers when surveyId or companyId changes
  useEffect(() => {
    if (surveyId && companyId) {
      getAllUsers();
    }
  }, [surveyId, companyId]);

  // File upload and parsing handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      Papa.parse(file, {
        header: true, // Treat the first row as headers
        skipEmptyLines: true, // Skip empty lines
        complete: (result) => {
          setCsvData(result.data);
        },
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Employee Management</h2>

      <div className="flex flex-col space-y-4 mb-6">
        {/* Survey ID Input */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Survey ID:</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full"
            value={surveyId}
            onChange={(e) => setSurveyId(e.target.value)}
            placeholder="Enter survey ID"
          />
        </div>

        {/* Company ID Input */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Company ID:</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            placeholder="Enter company ID"
          />
        </div>

        {/* CSV Upload */}
        <div className="flex flex-col">
          <label className="text-sm font-medium">Upload Employee CSV:</label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="border border-gray-300 rounded p-2"
          />
        </div>
      </div>

      {/* Display Fetched Users */}
      {users.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  First Name
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Name
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.firstName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{user.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Display CSV data in a table (if any) */}
      {csvData.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {Object.keys(csvData[0]).map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {csvData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {Object.values(row).map((value, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 text-sm text-gray-700">
                      {String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Save Employees Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSaveEmployees}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Save Employees
        </button>
      </div>
    </div>
  );
};

export default CsvParser;
