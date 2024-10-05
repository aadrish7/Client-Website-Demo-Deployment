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
import Table from "@/components/table";
import Papa from "papaparse";
import { FaEdit, FaTrash } from "react-icons/fa";
import { IoIosList } from "react-icons/io";

Amplify.configure(outputs);
const client = generateClient<Schema>();

const CSVUploadModal: React.FC<{
  onClose: () => void;
  onUpload: (data: Map<string, string[]>) => Promise<void>;
}> = ({ onClose, onUpload }) => {
  const [parsedData, setParsedData] = useState<Map<string, string[]> | null>(
    null
  );
  const [isCreating, setIsCreating] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const data = result.data as { Factor: string; Questions: string }[];
        const groupedQuestions = groupQuestionsByFactor(data);
        setParsedData(groupedQuestions);
      },
    });
  };

  const groupQuestionsByFactor = (
    data: { Factor: string; Questions: string }[]
  ): Map<string, string[]> => {
    const groupedData = new Map<string, string[]>();
    data.forEach(({ Factor, Questions }) => {
      if (!groupedData.has(Factor)) {
        groupedData.set(Factor, []);
      }
      groupedData.get(Factor)?.push(Questions);
    });
    return groupedData;
  };

  const handleCreate = async () => {
    if (parsedData) {
      setIsCreating(true);
      await onUpload(parsedData);
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-10">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-7">Upload Questions CSV</h2>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="mb-6"
          disabled={isCreating}
        />

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
            disabled={isCreating}
          >
            Cancel
          </button>
          {parsedData && (
            <button
              onClick={handleCreate}
              className={`bg-blue-600 text-white px-4 py-2 rounded-md ${
                isCreating ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isCreating}
            >
              {isCreating ? "Creating..." : "Create Questions"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const EditQuestionModal: React.FC<{
  question: any;
  onClose: () => void;
  onSave: () => void;
}> = ({ question, onClose, onSave }) => {
  const [factor, setFactor] = useState<string>(question.factor);
  const [questionText, setQuestionText] = useState<string>(question.questionText);

  // Factor options to match the create modal
  const factorOptions = [
    "Advocacy",
    "Psychological Safety",
    "Flexibility",
    "Growth Satisfaction",
    "Purpose",
  ];

  const handleSave = async () => {
    try {
      // Step 1: Disable the current question
      await client.models.Question.update({
        id: question.id,
        disabled: true,  // Disable the old question
      });
  
      // Step 2: Create a new question with the updated values
      await client.models.Question.create({
        factor,
        questionText,
        options: ["1", "2", "3", "4", "5"],  // Default options for consistency
        disabled: false, // New question is active
      });
  
      // Trigger refresh or any callback after saving
      onSave();
    } catch (error) {
      console.error("Failed to update and create new question", error);
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-10">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-7">Edit Question</h2>

        {/* Factor dropdown */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Factor</label>
          <select
            value={factor}
            onChange={(e) => setFactor(e.target.value)}
            className="border border-gray-300 rounded p-2 w-full bg-gray-100 text-sm"
          >
            <option value="">Select a factor</option>
            {factorOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Question text */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Question Text
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="border p-2 w-full"
          />
        </div>

        {/* Action buttons */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};


// Modal component for creating a question
const CreateQuestionModal: React.FC<{
  onClose: () => void;
  onCreate: () => void;
}> = ({ onClose, onCreate }) => {
  const [factor, setFactor] = useState<string>("");
  const [questionText, setQuestionText] = useState<string>("");
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const factorOptions = [
    "Advocacy",
    "Psychological Safety",
    "Flexibility",
    "Growth Satisfaction",
    "Purpose",
  ];

  const handleSubmit = async () => {
    setIsCreating(true);
    try {
      await client.models.Question.create({
        factor,
        questionText,
        options: ["1", "2", "3", "4", "5"],
        disabled: false,
      });
      onCreate(); // Close modal and trigger refresh
    } catch (error) {
      console.error("Failed to create question", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-10">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-7">Create New Question</h2>

        {/* Factor Selector */}
        <div className="mb-6 mt-4">
          <label className="text-sm block font-medium mb-2">Factor</label>
          <select
            className="border border-gray-300 rounded p-2 w-full bg-gray-100 text-sm"
            value={factor}
            onChange={(e) => setFactor(e.target.value)}
            disabled={isCreating}
          >
            <option value="">Select a factor</option>
            {factorOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Question Text Input */}
        <div className="mb-6 mt-4">
          <label className="text-sm block font-medium mb-2">
            Question Text
          </label>
          <textarea
            className="border border-gray-300 rounded p-2 w-full bg-gray-100 text-sm"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter question text"
            disabled={isCreating}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-center">
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
// Main component for displaying Questions
const QuestionsPage: React.FC = () => {
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);

  const handleEdit = (question: any) => {
    setEditingQuestion(question); // Show the edit modal with the selected question
  };

  // Close the modal and refresh the data after saving
  const handleEditSave = () => {
    setEditingQuestion(null);
    fetchQuestions(); // Refetch questions after saving
  };

  const fetchQuestions = async () => {
    try {
      const { userId } = await getCurrentUser();
      const { data: questionList } = await client.models.Question.list({
        filter: {
          disabled: { eq: false },
        },
      });
      setTableHeaders(() => ["factor", "question text", "manage"]);
      setTableData(
        questionList.map((question) => ({
          factor: question.factor || "",
          "question text": question.questionText || "",
          manage: (
            <div className="flex space-x-4">
              <FaEdit
                onClick={() => handleEdit(question)}
                className="cursor-pointer text-blue-600"
              />
              <FaTrash
                onClick={() => handleDelete(question)}
                className="cursor-pointer text-red-600"
              />
            </div>
          ),
        }))
      );
    } catch (error) {
      console.error("Failed to fetch questions");
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const navItems = [
    {
      label: " Collections",
      active: true,
      subItems: [
        {
          label: "📋 Question Bank",
          active: true,
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
      active: false,
      subItems: [
        {
          label: "📋 Snippet Bank",
          active: false,
          href: "/superadmin/snippets",
        },
        {
          label: "📦 Snippet Set",
          active: false,
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

  const handleModalClose = () => setIsModalOpen(false);
  const handleCSVModalClose = () => setIsCSVModalOpen(false);

  const handleCreateQuestion = () => {
    // After creating a new question, refetch the questions and close the modal
    setIsModalOpen(false);
    // We can refetch the questions here or handle updating the state as needed
    fetchQuestions(); // To refresh the table after question creation
  };

  const handleCSVUpload = async (groupedQuestions: Map<string, string[]>) => {
    try {
      // Convert Map to an array of entries for iteration
      for (const [factor, questions] of Array.from(
        groupedQuestions.entries()
      )) {
        for (const questionText of questions) {
          await client.models.Question.create({
            factor,
            questionText,
            options: ["1", "2", "3", "4", "5"],
            disabled: false,
          });
        }
      }
      fetchQuestions();
      setIsCSVModalOpen(false);
    } catch (error) {
      console.error("Failed to create questions from CSV", error);
    }
  };

  const handleDelete = async (question: any) => {
    try {
      // Disable the question
      await client.models.Question.update({
        id: question.id,
        disabled: true, // Mark the question as disabled
      });

      // Refetch the questions to update the UI
      fetchQuestions();
    } catch (error) {
      console.error("Failed to delete the question", error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar navItems={navItems} />
        <div className="w-4/5 p-8">
          <h1 className="text-2xl font-semibold mb-6">Question Bank</h1>

          <div className="border p-4">
            <div className="flex items-center mb-4 justify-end">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-1"
              >
                <span>Create New Question</span>
                <span className="text-xl font-bold">+</span>
              </button>
              <button
                onClick={() => setIsCSVModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-1 ml-2"
              >
                <span>Upload CSV Question</span>
              </button>
            </div>

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
                          {header}
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
                            className={`px-6 py-4 whitespace-nowrap text-sm`}
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
              <p>Loading Questions...</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal for creating a new question */}
      {isModalOpen && (
        <CreateQuestionModal
          onClose={handleModalClose}
          onCreate={handleCreateQuestion}
        />
      )}
      {isCSVModalOpen && (
        <CSVUploadModal
          onClose={handleCSVModalClose}
          onUpload={handleCSVUpload}
        />
      )}
      {editingQuestion && (
        <EditQuestionModal
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default QuestionsPage;
