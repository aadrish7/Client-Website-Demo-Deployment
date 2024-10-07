"use client";
import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import { useRouter } from "next/navigation";
import outputs from "@/amplify_outputs.json";
import Header from "@/components/superadminHeader";
import Sidebar from "@/components/superadminSidebar";
import Table from "@/components/table";
import Papa from "papaparse";
import { create } from "zustand";
import { FaChevronDown, FaEdit, FaTrash } from "react-icons/fa";
import Breadcrumb from "@/components/normalBreadCrumb";
import {Suspense} from "react";

Amplify.configure(outputs);
const client = generateClient<Schema>();

interface CreateTextSnippetProps {
  onClose: () => void;
}

const EditSnippetModal: React.FC<{ snippet: any; onClose: () => void; onSave: () => void }> = ({
  snippet,
  onClose,
  onSave,
}) => {
  const [factor, setFactor] = useState<string>(snippet.factor);
  const [score, setScore] = useState<string>(snippet.score);
  const [snippetText, setSnippetText] = useState<string>(snippet.snippetText);
  const [type, setType] = useState<"normal" | "admin" | "employee" | null>(snippet.type);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const factors = ["Advocacy", "Psychological Safety", "Flexibility", "Growth Satisfaction", "Purpose"];
  const types = ["normal", "employee", "admin"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!factor || !score || !snippetText || !type) {
        setErrorMessage("All fields are required.");
        setLoading(false);
        return;
      }

      // Update the snippet in Amplify
      await client.models.TextSnippet.update({
        id: snippet.id,
        factor,
        score: Number(score),
        snippetText,
        type,
      });

      setSuccessMessage("Text Snippet updated successfully!");
      setLoading(false);
      onSave(); // Trigger callback to refresh the data
    } catch (error) {
      console.error("Failed to update text snippet", error);
      setErrorMessage("Failed to update text snippet. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-10">
      <div className="w-full max-w-md p-6 bg-white rounded-md shadow-lg">
        <h1 className="text-lg font-semibold mb-7">Edit Text Snippet</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Factor</label>
            <select
              value={factor}
              onChange={(e) => setFactor(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-sm"
              required
            >
              <option value="" disabled>
                Select a factor
              </option>
              {factors.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={type || ""} // Default value when type is null
              onChange={(e) =>
                setType(e.target.value as "normal" | "admin" | "employee")
              } // Type casting
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-sm"
              required
            >
              <option value="" disabled>
                Select a type
              </option>
              {types.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Score</label>
            <input
              type="text"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-sm"
              placeholder="Enter score"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Snippet Text</label>
            <textarea
              value={snippetText}
              onChange={(e) => setSnippetText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-sm"
              placeholder="Enter snippet text"
              rows={4}
              required
            ></textarea>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Snippet"}
            </button>
          </div>

          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          {successMessage && <p className="text-black">{successMessage}</p>}
        </form>
      </div>
    </div>
  );
};


const CreateSnippetSetModal: React.FC<{
  onClose: () => void;
  onCreate: () => void;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [textSnippets, setTextSnippets] = useState<
    { id: string; snippetText: string }[]
  >([]);
  const [isCreating, setIsCreating] = useState<boolean>(false);

  useEffect(() => {
    const fetchTextSnippets = async () => {
      try {
        const { data: snippetList } = await client.models.TextSnippet.list({
          filter: { disabled: { eq: false } },
        });
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
    setIsCreating(true);
    try {
      const snippetIds = textSnippets.map((snippet) => snippet.id);
      await client.models.SnippetSet.create({
        name,
        tags,
        textSnippets: snippetIds,
      });
      onCreate();
    } catch (error) {
      console.error("Failed to create snippet set", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-10">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-7">Create New Snippet Set</h2>

        {/* Snippet Set Name Input */}
        <div className="mb-6 mt-4">
          <label className="text-sm block font-medium mb-2">Name</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full bg-gray-100 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter snippet set name"
          />
        </div>

        {/* Tags Input */}
        <div className="mb-6 mt-4">
          <label className="text-sm block font-medium mb-2">Tags</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full bg-gray-100 text-sm"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter snippet set tags"
          />
        </div>

        {/* Text Snippets Info */}
        <div className="mb-6 mt-4">
          <label className="text-sm block font-medium mb-2">
            Text Snippets
          </label>
          <p className="text-sm">
            {textSnippets.length} snippets will be added to this set by default.
          </p>
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
            {isCreating ? "Creating Snippet Set..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateTextSnippet: React.FC<CreateTextSnippetProps> = ({ onClose }) => {
  const [factor, setFactor] = useState<string>("");
  const [score, setScore] = useState<string>("");
  const [snippetText, setSnippetText] = useState<string>("");
  const [type, setType] = useState<"normal" | "admin" | "employee" | null>(
    null
  ); // Updated type
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  const factors = [
    "Advocacy",
    "Psychological Safety",
    "Flexibility",
    "Growth Satisfaction",
    "Purpose",
  ];
  const types = ["normal", "employee", "admin"]; // Array for the dropdown

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (!factor || !score || !snippetText || !type) {
        setErrorMessage("All fields are required.");
        setLoading(false);
        return;
      }

      await client.models.TextSnippet.create({
        factor,
        score: Number(score),
        snippetText,
        type, // Passed type to the create call
      });

      setFactor("");
      setScore("");
      setSnippetText("");
      setType(null); // Reset type to null after submission
      setSuccessMessage("Text Snippet created successfully!");

      setLoading(false);
      onClose();
    } catch (error) {
      console.error("Failed to create text snippet", error);
      setErrorMessage("Failed to create text snippet. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-10">
      <div className="w-full max-w-md p-6 bg-white rounded-md shadow-lg">
        <h1 className="text-lg font-semibold mb-7">Create Text Snippet</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Factor</label>
            <select
              value={factor}
              onChange={(e) => setFactor(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-sm"
              required
            >
              <option value="" disabled>
                Select a factor
              </option>
              {factors.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={type || ""} // Default value when type is null
              onChange={(e) =>
                setType(e.target.value as "normal" | "admin" | "employee")
              } // Type casting
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-sm"
              required
            >
              <option value="" disabled>
                Select a type
              </option>
              {types.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Score</label>
            <input
              type="text"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-sm"
              placeholder="Enter score"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Snippet Text
            </label>
            <textarea
              value={snippetText}
              onChange={(e) => setSnippetText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-sm"
              placeholder="Enter snippet text"
              rows={4}
              required
            ></textarea>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Text Snippet"}
            </button>
          </div>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          {successMessage && <p className="text-black">{successMessage}</p>}
        </form>
      </div>
    </div>
  );
};



const SuperAdminMainPage: React.FC = () => {
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const [showCsvPopup, setShowCsvPopup] = useState(false);
  const [showManualCreationPopup, setShowManualCreationPopup] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSnippetDropdownOpen, setIsSnippetDropdownOpen] = useState(false); // State for dropdown
  const [editSnippet, setEditSnippet] = useState<any | null>(null);
  const [createSnippetSetModalOpen, setCreateSnippetSetModalOpen] =
    useState(false); // State for modal
  const router = useRouter();

  const handleIdClick = (id: string) => {
    // Handle ID click logic
  };

  const fetchTextSnippets = async () => {
    try {
      const { data: textSnippetList } = await client.models.TextSnippet.list(
        {
          filter: { disabled: { eq: false } },
        }
      );
      console.log("textSnippetList:", textSnippetList);
      setTableHeaders(() => ["factor", "score", "type", "snippet text", "manage"]); // Added type to table headers
      setTableData(
        textSnippetList.map((snippet: any) => ({
          factor: snippet.factor,
          score: snippet.score,
          "snippet text": snippet.snippetText,
          type: snippet.type, // Added type to table data
          manage: (
            <div className="flex space-x-4">
              <FaEdit
                onClick={() => setEditSnippet(snippet)} // Show edit modal
                className="cursor-pointer text-blue-600"
              />
              <FaTrash
                onClick={() => handleDelete(snippet)} // Handle delete
                className="cursor-pointer text-red-600"
              />
            </div>
          ),
        }))
      );
    } catch (error) {
      console.error("Failed to fetch text snippets");
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchTextSnippets();
  }, []);

  const handleDelete = async (snippet: any) => {
    try {

      await client.models.TextSnippet.update({
        id: snippet.id,
        disabled: true, 
      });


      fetchTextSnippets();
    } catch (error) {
      console.error("Failed to delete snippet", error);
    }
  };

  const handleEditSave = () => {
    setEditSnippet(null); // Close edit modal
    fetchTextSnippets(); // Refresh the table after saving
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCsvFile(event.target.files[0]);
    }
  };

  const onClose = () => {
    setShowManualCreationPopup(false);
    fetchTextSnippets();
  };

  const handleCsvSubmit = async () => {
    setIsUploading(true);
    if (!csvFile) return;

    type SnippetRow = {
      factor: string;
      score: string;
      text: string;
      type: "normal" | "admin" | "employee" | null | undefined;
    };

    Papa.parse(csvFile, {
      header: true,
      complete: async (results) => {
        const data = results.data as SnippetRow[];
        try {
          for (const row of data) {
            const { factor, score, text: snippetText, type } = row;
            if (type !== "normal" && type !== "admin" && type !== "employee") {
              console.error(`Invalid type: ${type}`);
              continue;
            }

            await client.models.TextSnippet.create({
              factor,
              score: Number(score),
              snippetText,
              type,
            });
          }
          await fetchTextSnippets();
          setShowCsvPopup(false);
        } catch (error) {
          console.error("Failed to create snippets:", error);
        } finally {
          setIsUploading(false);
        }
      },
    });
  };

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
          active: true,
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

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar activePath="/superadmin/snippets" />
        <div className="w-4/5 p-8">
          <Breadcrumb />
          <h1 className="text-2xl font-semibold mb-6">Snippet Bank</h1>

          <div className="border p-4">
            <div className="flex items-center mb-4 justify-end space-x-4">
              {/* Create Snippet Set Button */}
              <button
                onClick={() => setCreateSnippetSetModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Create Snippet Set
              </button>

              {/* Add Snippet Dropdown Button */}
              <div className="relative">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                  onClick={() => setIsSnippetDropdownOpen((prev) => !prev)}
                >
                  <span>Add Snippet</span>
                  <FaChevronDown className="ml-2" /> {/* Dropdown icon */}
                </button>
                {isSnippetDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md z-10">
                    <button
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-200"
                      onClick={() => {
                        setShowManualCreationPopup(true);
                        setIsSnippetDropdownOpen(false);
                      }}
                    >
                      Manual
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-200"
                      onClick={() => {
                        setShowCsvPopup(true);
                        setIsSnippetDropdownOpen(false);
                      }}
                    >
                      CSV
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Generalized Table */}
            {tableData && tableHeaders ? (
              <Table
                headers={tableHeaders}
                data={tableData}
                handleClick={handleIdClick}
                underlineColumn=""
              />
            ) : (
              <p>Loading Table...</p>
            )}
          </div>
        </div>
      </div>

      {/* CSV Upload Popup */}
      {showCsvPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-10">
          <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-7">
              Upload CSV to Create Snippets
            </h2>

            {/* File Input */}
            <div className="mb-6 mt-4">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="border border-gray-300 rounded p-2 w-full bg-gray-100 text-sm"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowCsvPopup(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleCsvSubmit}
                disabled={isUploading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Creation Popup */}
      {showManualCreationPopup && <CreateTextSnippet onClose={onClose} />}
      {createSnippetSetModalOpen && (
        <CreateSnippetSetModal
          onClose={() => setCreateSnippetSetModalOpen(false)}
          onCreate={() => setCreateSnippetSetModalOpen(false)}
        />
      )}

{editSnippet && (
        <EditSnippetModal
          snippet={editSnippet}
          onClose={() => setEditSnippet(null)}
          onSave={handleEditSave}
        />
      )}

    </div>
  );
};

export default function () {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuperAdminMainPage />
    </Suspense>
  );
}

