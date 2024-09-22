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

Amplify.configure(outputs);
const client = generateClient<Schema>();

// Modal component for creating a Snippet Set
const CreateSnippetSetModal: React.FC<{
  onClose: () => void;
  onCreate: () => void;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [textSnippets, setTextSnippets] = useState<{ id: string; snippetText: string }[]>([]);

  useEffect(() => {
    const fetchTextSnippets = async () => {
      try {
        const { data: snippetList } = await client.models.TextSnippet.list({});
        setTextSnippets(
          snippetList.map((snippet) => ({
            id: snippet.id,
            snippetText: snippet.snippetText,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch text snippets", error);
      }
    };

    fetchTextSnippets();
  }, []);

  const handleSubmit = async () => {
    try {
      // Extract textSnippet IDs to store in the snippet set
      const snippetIds = textSnippets.map((snippet) => snippet.id);

      // Create snippet set with name, tags, and associated snippet IDs
      await client.models.SnippetSet.create({
        name,
        tags,
        textSnippets: snippetIds,
      });
      onCreate(); // Close modal and trigger refresh
    } catch (error) {
      console.error("Failed to create snippet set", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Snippet Set</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            className="border rounded p-2 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter snippet set name"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Tags</label>
          <input
            type="text"
            className="border rounded p-2 w-full"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter snippet set tags"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Text Snippets
          </label>
          <p>
            {textSnippets.length} snippets will be added to this set by default.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded-md mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

// Main component for displaying Snippet Sets
const SnippetSetsPage: React.FC = () => {
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const router = useRouter();

  const fetchSnippetSets = async () => {
    try {
      const { data: snippetSetList } = await client.models.SnippetSet.list({});
      setTableHeaders(() => ["name", "tags", "textSnippets"]);
      setTableData(
        snippetSetList.map((set) => ({
          name: set.name || "",
          tags: set.tags || "",
          textSnippets: set.textSnippets
            ? set.textSnippets.length.toString()
            : "0", // Number of text snippets
        }))
      );
    } catch (error) {
      console.error("Failed to fetch snippet sets", error);
    }
  };

  useEffect(() => {
    fetchSnippetSets();
  }, []);

  const navItems = [
    {
        label: '📦 Collections',
        active: false,
        subItems: [
          { label: '📋 Question Bank', active: false, href: '/superadmin/collections/questionbank' },
          { label: '📦 Collection', active: false, href: '/superadmin/collections/collection' }
        ]
      },
    {
      label: '📦 Snippets',
      active: true,
      subItems: [
        { label: '📋 Snippet Bank', active: false, href: '/superadmin/snippets' },
        { label: '📦 Snippet Set', active: true, href: '/superadmin/snippets/snippetset' }
      ]
    },
    { label: '🏢 Company', active: false, href: '/superadmin' },
    { label: '📊 Analytics', active: false, href: '/analytics' },
    { label: '💬 Help', active: false, href: '/help' }
  ].filter(item => item !== undefined);

  const handleModalClose = () => setIsModalOpen(false);

  const handleSnippetSetClick = (setName: string) => {
    router.push(`snippetset/details?name=${encodeURIComponent(setName)}`);
  };

  const handleCreateSnippetSet = () => {
    setIsModalOpen(false);
    fetchSnippetSets(); // Refresh the table after creating a snippet set
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar navItems={navItems} />
        {/* Main Page Content */}
        <div className="w-4/5 p-8">
          {/* Page Header */}
          <h1 className="text-2xl font-semibold mb-6">Snippet Sets</h1>

          <div className="border p-4">
            <div className="flex items-center mb-4 justify-end">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-1"
              >
                <span>Create New Snippet Set</span>
                <span className="text-xl font-bold">+</span>
              </button>
            </div>

            {tableData && tableHeaders ? (
              <Table
                headers={tableHeaders}
                data={tableData}
                handleClick={handleSnippetSetClick}
                underlineColumn="name"
              />
            ) : (
              <p>Loading Snippet Sets...</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal for creating a new snippet set */}
      {isModalOpen && (
        <CreateSnippetSetModal
          onClose={handleModalClose}
          onCreate={handleCreateSnippetSet}
        />
      )}
    </div>
  );
};

export default SnippetSetsPage;
