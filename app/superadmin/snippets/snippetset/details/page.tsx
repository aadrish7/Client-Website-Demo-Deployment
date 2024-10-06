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
  type: "normal" | "admin" | "employee" | null | undefined;
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
        const { data: snippetSets } = await client.models.SnippetSet.list({});
        const foundSet = snippetSets.find((set) => set.name === snippetSetName);
        if (foundSet) {
          setSnippetSet({
            name: foundSet.name ?? "",
            tags: foundSet.tags ?? "",
            textSnippets:
              foundSet.textSnippets?.filter(
                (snippet): snippet is string => snippet !== null
              ) ?? [],
          });

          // Fetch text snippets based on the IDs present in textSnippets array of the SnippetSet
          const fetchedTextSnippets = await Promise.all(
            foundSet.textSnippets?.filter(Boolean)?.map(async (snippetId) => {
              const { data: textSnippets } =
                await client.models.TextSnippet.list({
                  filter: {
                    id: { eq: snippetId || "" },
                  },
                });
              const textSnippet = textSnippets[0];
              return {
                factor: textSnippet?.factor,
                score: textSnippet?.score,
                snippetText: textSnippet?.snippetText,
                type: textSnippet?.type,
                disabled: textSnippet?.disabled ?? false, // Ensure disabled is present
              };
            }) ?? []
          );

          // Only include snippets where disabled is false
          const snippets = fetchedTextSnippets.filter(
            (snippet) => !snippet.disabled
          );

          setTextSnippetsDetails(snippets); // Now the snippets array includes 'disabled'
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

  const handleSnippetClick = (snippetText: string) => {};

  const navItems = [
    {
      label: "📦 Collections",
      active: false,
      subItems: [
        {
          label: "📋 Question Bank",
          active: false,
          href: "/superadmin/collections/questionbank",
        },
        {
          label: "📦 Collection",
          active: false,
          href: "/superadmin/collections/collection",
        },
      ],
    },
    {
      label: "📦 Snippets",
      active: true,
      subItems: [
        {
          label: "📋 Snippet Bank",
          active: false,
          href: "/superadmin/snippets",
        },
        {
          label: "📦 Snippet Set",
          active: true,
          href: "/superadmin/snippets/snippetset",
        },
      ],
    },
    {
      label: "📦 Overview Snippets",
      active: false,
      subItems: [
        {
          label: "📋 Snippet Bank",
          active: false,
          href: "/superadmin/overviewsnippets",
        },
        {
          label: "📦 Snippet Set",
          active: false,
          href: "/superadmin/overviewsnippets/overviewsnippetset",
        },
      ],
    },
    { label: "🏢 Company", active: false, href: "/superadmin" },
    { label: "📊 Analytics", active: false, href: "/superadmin/analytics" },
  ].filter((item) => item !== undefined);

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
                handleClick={handleSnippetClick}
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
