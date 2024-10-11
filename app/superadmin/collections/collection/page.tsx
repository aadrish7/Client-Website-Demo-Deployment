"use client";
import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { getCurrentUser } from "aws-amplify/auth";
import outputs from "@/amplify_outputs.json";
import { Amplify } from "aws-amplify";
import { useRouter } from "next/navigation";
import Header from "@/components/superadminHeader";
import Sidebar from "@/components/superadminSidebar";
import Breadcrumb from "@/components/normalBreadCrumb";
import { Suspense } from "react";
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

const CollectionsPage: React.FC = () => {
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const router = useRouter();

  // Fetch collections from the Collection model
  const fetchCollections = async () => {
    try {
      const collectionList = await createPaginatedFetchFunctionForCollection(client, {})();
      setTableHeaders(() => ["name", "tags"]); 
      setTableData(
        collectionList.map((collection) => ({
          name: collection.name || '',
          tags: collection.tags || '',
        }))
      );
    } catch (error) {
      console.error('Failed to fetch collections', error);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCollectionClick = (collectionName: string) => {
    router.push(`collection/collection-details?name=${encodeURIComponent(collectionName)}`);
  };

  // Sorting function for Tags column
  const handleSortTags = () => {
    const sortedData = [...tableData].sort((a, b) => {
      if (sortDirection === 'asc') {
        return a.tags.localeCompare(b.tags);
      } else {
        return b.tags.localeCompare(a.tags);
      }
    });
    setTableData(sortedData);
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar activePath="/superadmin/collections/collection" />
        {/* Main Page Content */}
        <div className="w-4/5 p-8">
          {/* Page Header */}
          <Breadcrumb />
          <h1 className="text-2xl font-semibold mb-6">Collections</h1>

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
                          {header === 'tags' ? (
                            <div className="flex items-center">
                              Tags
                              <button
                                className="ml-2"
                                onClick={handleSortTags}
                                title="Sort Tags"
                              >
                                {sortDirection === 'asc' ? '↑' : '↓'}
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
                              header.toLowerCase() === 'name' ? 'text-blue-500 font-bold cursor-pointer' : ''
                            }`}
                            onClick={() => {
                              if (header.toLowerCase() === 'name') {
                                handleCollectionClick(row[header]);
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
              <p>Loading Collections...</p>
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
      <CollectionsPage />
    </Suspense>
  );
}
