"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { Amplify } from "aws-amplify";
import Header from "@/components/superadminHeader";
import Sidebar from "@/components/superadminSidebar";
import { Suspense } from "react";
import Breadcrumb from "@/components/normalBreadCrumb";
import { Pagination } from "@aws-amplify/ui-react";
import {
  createPaginatedFetchFunctionForSnippetSet
} from "@/constants/pagination";

Amplify.configure(outputs);
const client = generateClient<Schema>();

// Define a type for text snippet details
type TextSnippetDetails = {
  factor: string;
  score: number;
  snippetText: string;
  type: "adminoverview"| "employeeaggregated" |"employeeindividual" | null | undefined;
  disabled: boolean; // Disabled field is required
};

// Function to map enum values to hardcoded display values with spaces
const displayType = (type: string | null | undefined): string => {
  switch (type) {
    case "adminoverview":
      return "Admin Overview";
    case "employeeaggregated":
      return "Employee Aggregated";
    case "employeeindividual":
      return "Employee Individual";
    default:
      return "Unknown";
  }
};

const SnippetSetDetails: React.FC = () => {
  const [snippetSet, setSnippetSet] = useState<{
    name: string;
    tags: string;
    textSnippets: string[];
  }>({ name: "", textSnippets: [], tags: "" });

  const [textSnippetsDetails, setTextSnippetsDetails] = useState<TextSnippetDetails[]>([]);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc"); // Sort direction state

  const router = useRouter();
  const searchParams = useSearchParams();
  const snippetSetName = searchParams.get("name");

  const fetchAllTextSnippets = async (client: any, pageSize: number = 100): Promise<any[]> => {
    let allTodos: any[] = [];
    let nextToken: string | null = null;
    let hasMorePages: boolean = true;

    while (hasMorePages) {
      const { data: todos, nextToken: newNextToken }: { data: any[]; nextToken: any } = await client.models.TextSnippet.list({
        nextToken,
        limit: pageSize,
      });

      allTodos = [...allTodos, ...todos];
      nextToken = newNextToken;

      if (!nextToken || todos.length < pageSize) {
        hasMorePages = false;
      }
    }

    return allTodos;
  };

  useEffect(() => {
    const fetchSnippetSet = async () => {
      try {
        if (!snippetSetName) return;
        const filterForSnippetSet = {
          name: {
            eq: snippetSetName,
          },
        };
        const snippetSets = await createPaginatedFetchFunctionForSnippetSet(client, filterForSnippetSet)();
        const foundSet = snippetSets.find((set) => set.name === snippetSetName);

        if (foundSet) {
          setSnippetSet({
            name: foundSet.name ?? "",
            tags: foundSet.tags ?? "",
            textSnippets: [],
          });

          if (!foundSet.id) {
            console.error("Snippet set ID not found");
            return;
          }

          var snippets = await fetchAllTextSnippets(client);
          const filteredSnippets = snippets.filter((snippet: any) => snippet.snippetSetId === foundSet.id && snippet.disabled === true);
          snippets = filteredSnippets;

          setTextSnippetsDetails(
            snippets.map((snippet: any) => ({
              factor: snippet.factor,
              score: snippet.score,
              snippetText: snippet.snippetText,
              type: snippet.type,
              disabled: snippet.disabled ?? false,
            }))
          );
        }
      } catch (error) {
        console.error("Failed to fetch snippet set or text snippets", error);
      }
    };

    if (snippetSetName) fetchSnippetSet();
  }, [snippetSetName]);

  // Function to sort snippets by "Type" column
  const sortSnippetsByType = () => {
    const sortedSnippets = [...textSnippetsDetails].sort((a, b) => {
      const typeA = displayType(a.type ?? "").toLowerCase();
      const typeB = displayType(b.type ?? "").toLowerCase();
      if (sortDirection === "asc") {
        return typeA > typeB ? 1 : -1;
      } else {
        return typeA < typeB ? 1 : -1;
      }
    });

    setTextSnippetsDetails(sortedSnippets);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc"); // Toggle sort direction
  };

  const headers = ["Factor", "Score", "Snippet Text", "Type"];
  console.log(textSnippetsDetails);

  const tableData = textSnippetsDetails.map((snippet) => ({
    Factor: snippet.factor,
    Score: snippet.score.toString(),
    "Snippet Text": snippet.snippetText,
    Type: displayType(snippet.type), // Use hardcoded display for the Type column
  }));

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar activePath="/superadmin/snippets/snippetset" />
        <div className="w-4/5 p-8">
          <Breadcrumb />
          <h1 className="text-2xl font-semibold mb-6">{snippetSetName}</h1>
          <div className="border p-4">
            {snippetSet.tags.length > 0 ? (
              <h2 className="text-lg mb-4 font-semibold">
                Tags: {snippetSet.tags}
              </h2>
            ) : null}

            {textSnippetsDetails.length > 0 ? (
              <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="min-w-full bg-white divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {headers.map((header, index) => (
                        <th
                          key={index}
                          className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${header === "Type" ? "hover:underline" : ""}`}
                          onClick={header === "Type" ? sortSnippetsByType : undefined} // Add sorting functionality for "Type"
                        >
                          {header}
                          {header === "Type" && (
                            <span>
                              {sortDirection === "asc" ? " ↑" : " ↓"}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tableData.map((row:any, rowIndex) => (
                      <tr key={rowIndex}>
                        {headers.map((header, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm"
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
              <p>Loading snippets...</p>
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
      <SnippetSetDetails />
    </Suspense>
  );
}
