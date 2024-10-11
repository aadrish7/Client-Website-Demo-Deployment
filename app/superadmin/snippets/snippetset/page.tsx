"use client";
import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { useRouter } from "next/navigation";
import Header from "@/components/superadminHeader";
import Sidebar from "@/components/superadminSidebar";
import Table from "@/components/table";
import Breadcrumb from "@/components/normalBreadCrumb";
import { Suspense } from "react";

Amplify.configure(outputs);
const client = generateClient<Schema>();


// Main component for displaying Snippet Sets
const SnippetSetsPage: React.FC = () => {
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const router = useRouter();

  // Fetch snippet sets from the server
  const fetchSnippetSets = async () => {
    try {
      const { data: snippetSetList } = await client.models.SnippetSet.list({
        limit: 10000,
      });
      setTableHeaders(["name", "tags"]);
      setTableData(
        snippetSetList.map((set) => ({
          name: set.name || "",
          tags: set.tags || "",
        }))
      );
    } catch (error) {
      console.error("Failed to fetch snippet sets", error);
    }
  };

  useEffect(() => {
    fetchSnippetSets();
  }, []);

  // Sorting function for Tags column
  const handleSortTags = () => {
    const sortedData = [...tableData].sort((a, b) => {
      if (sortDirection === "asc") {
        return a.tags.localeCompare(b.tags);
      } else {
        return b.tags.localeCompare(a.tags);
      }
    });
    setTableData(sortedData);
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleSnippetSetClick = (setName: string) => {
    router.push(`snippetset/details?name=${encodeURIComponent(setName)}`);
  };

  const handleCreateSnippetSet = () => {
    setIsModalOpen(false);
    fetchSnippetSets();
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar activePath="/superadmin/snippets/snippetset" />
        {/* Main Page Content */}
        <div className="w-4/5 p-8">
          {/* Page Header */}
          <Breadcrumb/>
          <h1 className="text-2xl font-semibold mb-6">Snippet Sets</h1>

          <div className="border p-4">
            {tableData && tableHeaders ? (
              <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="min-w-full bg-white divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {tableHeaders.map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header === "tags" ? (
                            <div className="flex items-center">
                              Tags
                              <button
                                className="ml-2"
                                onClick={handleSortTags}
                                title="Sort Tags"
                              >
                                {sortDirection === "asc" ? "↑" : "↓"}
                              </button>
                            </div>
                          ) : (
                            header
                          )}
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
                              header.toLowerCase() === "name"
                                ? "text-blue-500 font-bold cursor-pointer"
                                : ""
                            }`}
                            onClick={() => {
                              if (header.toLowerCase() === "name") {
                                handleSnippetSetClick(row[header]);
                              }
                            }}
                          >
                            {row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Loading Snippet Sets...</p>
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
      <SnippetSetsPage />
    </Suspense>
  );
}
