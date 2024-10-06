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

Amplify.configure(outputs);
const client = generateClient<Schema>();

// Modal component for creating a collection
const CreateCollectionModal: React.FC<{
  onClose: () => void;
  onCreate: () => void;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [questions, setQuestions] = useState<
    {
      factor: string;
      questionText: string;
      options: string[] | null;
      id: string;
      createdAt: string;
      updatedAt: string;
    }[]
  >([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data: questionList } = await client.models.Question.list({
          filter: { disabled: { eq: false } },
        });
        setQuestions(
          questionList.map((question) => ({
            ...question,
            options: question.options as string[] | null,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch questions", error);
      }
    };

    fetchQuestions();
  }, []);

  const handleSubmit = async () => {
    setIsCreating(true);
    try {
      const questionIds = questions.map((question) => question.id);

      await client.models.Collection.create({
        name,
        tags,
        questions: questionIds,
      });
      onCreate(); // Close modal and trigger refresh
    } catch (error) {
      console.error("Failed to create collection", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-10">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-7">Create New Collection</h2>

        {/* Name Input */}
        <div className="mb-6 mt-4">
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full bg-gray-100 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter collection name"
            disabled={isCreating}
          />
        </div>

        {/* Tags Input */}
        <div className="mb-6 mt-4">
          <label className="block text-sm font-medium mb-2">Tags</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full bg-gray-100 text-sm"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter collection tags"
            disabled={isCreating}
          />
        </div>

        {/* Questions Information */}
        <div className="mb-6 mt-4">
          <label className="block text-sm font-medium mb-2">Questions</label>
          <p>
            {questions.length} questions will be added to this collection by
            default.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-center mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
            disabled={isCreating}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`bg-blue-600 text-white px-4 py-2 rounded-md ${
              isCreating ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isCreating}
          >
            {isCreating ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};



const CollectionsPage: React.FC = () => {
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const router = useRouter();

  // Fetch collections from the Collection model
  const fetchCollections = async () => {
    try {
      const { data: collectionList } = await client.models.Collection.list({});
      setTableHeaders(() => ["name", "tags", "questions"]);
      setTableData(
        collectionList.map((collection) => ({
          name: collection.name || '',
          tags: collection.tags || '',
          questions: collection.questions ? collection.questions.length.toString() : '0', // Number of questions
        }))
      );
    } catch (error) {
      console.error('Failed to fetch collections', error);
      console.error('Error:', error);
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
    // Toggle sort direction
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

      {/* Modal for creating a new collection */}
      {isModalOpen && <CreateCollectionModal onClose={() => setIsModalOpen(false)} onCreate={fetchCollections} />}
    </div>
  );
};

export default CollectionsPage;
