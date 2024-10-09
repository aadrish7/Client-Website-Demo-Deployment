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

    useEffect(() => {
      const fetchSnippetSet = async () => {
        try {
          if (!snippetSetName) return;
          const { data: snippetSets } = await client.models.SnippetSet.list({
            filter: {
              name: { eq: snippetSetName },
            },
          });
          const foundSet = snippetSets.find((set) => set.name === snippetSetName);
          console.log(foundSet);
    
          if (foundSet) {
            setSnippetSet({
              name: foundSet.name ?? "",
              tags: foundSet.tags ?? "",
              textSnippets: [], // No longer used, but kept for structure
            });
    
            // Fetch text snippets by snippetSetId instead of using textSnippet IDs
            const { data: textSnippets } = await client.models.TextSnippet.list({
              filter: {
                snippetSetId: { eq: foundSet.id || "" },
                disabled : {eq :true},
              },
            });
            console.log("textSnippets", textSnippets);
            // Only include snippets where disabled is false
            const snippets = textSnippets;
            console.log(snippets);
    
            setTextSnippetsDetails(
              snippets.map((snippet) => ({
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
