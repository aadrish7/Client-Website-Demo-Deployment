"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { Amplify } from "aws-amplify";
import Header from "@/components/superadminHeader";
import Sidebar from "@/components/superadminSidebar";
import Table from "@/components/table";
import { Suspense } from "react";
import Breadcrumb from "@/components/normalBreadCrumb";
import { Pagination } from "@aws-amplify/ui-react";
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



// Define a type for text snippet details
type TextSnippetDetails = {
  factor: string;
  score: number;
  snippetText: string;
  type: "adminoverview"| "employeeaggregated" |"employeeindividual" | null | undefined;
  disabled: boolean; // Disabled field is required
};

const SnippetSetDetails: React.FC = () => {
  const [snippetSet, setSnippetSet] = useState<{
    name: string;
    tags: string;
    textSnippets: string[];
  }>({ name: "", textSnippets: [], tags: "" });

  const [textSnippetsDetails, setTextSnippetsDetails] = useState<
    TextSnippetDetails[]
  >([]);

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
  
      // Combine the new todos with the existing ones
      allTodos = [...allTodos, ...todos];
  
      // Update the nextToken for the next request
      nextToken = newNextToken;
  
      // If there's no more nextToken or fewer items than the page size, stop fetching
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
              textSnippets: [], // No longer used, but kept for structure
            });
    
            if (!foundSet.id) {
              console.error("Snippet set ID not found");
              return;
            }
      
            
            var snippets = await fetchAllTextSnippets(client);
            //filter the ones that have the disabled field set to true and the snippetSetId is equal to the foundSet.id
            const filteredSnippets = snippets.filter((snippet:any) => snippet.snippetSetId === foundSet.id && snippet.disabled === true);
            snippets = filteredSnippets;

            console.log("filteredSnippets", filteredSnippets);
    
            setTextSnippetsDetails(
              snippets.map((snippet:any) => ({
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
    

  const headers = ["Factor", "Score", "Snippet Text", "Type"];

  const tableData = textSnippetsDetails.map((snippet) => ({
    Factor: snippet.factor,
    Score: snippet.score.toString(),
    "Snippet Text": snippet.snippetText,
    Type: snippet.type ?? "Unknown", // Ensure Type is always a string
  }));

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar activePath="/superadmin/snippets/snippetset" />
        <div className="w-4/5 p-8">
        <Breadcrumb/>
          <h1 className="text-2xl font-semibold mb-6">{snippetSetName}</h1>
          <div className="border p-4">
            {snippetSet.tags.length > 0 ? (
              <h2 className="text-lg mb-4 font-semibold">
                Tags: {snippetSet.tags}
              </h2>
            ) : null}

            {textSnippetsDetails.length > 0 ? (
              <Table
                headers={headers}
                data={tableData}
                underlineColumn=""
                handleClick={() => {}}
              />
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
