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
import { Suspense } from "react";
import { truncate } from "fs";

Amplify.configure(outputs);
const client = generateClient<Schema>();

interface CreateTextSnippetProps {
  onClose: () => void;
}

const EditSnippetModal: React.FC<{
  snippet: any;
  onClose: () => void;
  onSave: () => void;
}> = ({ snippet, onClose, onSave }) => {
  const [factor, setFactor] = useState<string>(snippet.factor);
  const [score, setScore] = useState<string>(snippet.score);
  const [snippetText, setSnippetText] = useState<string>(snippet.snippetText);
  const [type, setType] = useState<
    "adminoverview" | "employeeaggregated" | "employeeindividual" | null
  >(snippet.type);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const typeValues = [
    "adminoverview",
    "employeeaggregated",
    "employeeindividual",
  ];

  const displayTypes: any = {
    adminoverview: "Admin Overview",
    employeeaggregated: "Employee Aggregated",
    employeeindividual: "Employee Individual",
  };

  const factors = [
    "Advocacy",
    "Psychological Safety",
    "Flexibility",
    "Growth Satisfaction",
    "Purpose",
  ];

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
      await client.models.TextSnippet.update({
        id : snippet.id,
        disabled: true,
      });
      // Update the snippet in Amplify with the type without spaces
      await client.models.TextSnippet.create({
        id: snippet.id,
        factor,
        score: Number(score),
        snippetText,
        type, 
        disabled: false,
        snippetSetId: "", 
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
                setType(
                  e.target.value as
                    | "adminoverview"
                    | "employeeaggregated"
                    | "employeeindividual"
                )
              } // Type casting
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-sm"
              required
            >
              <option value="" disabled>
                Select a type
              </option>
              {/* Show the type with spaces in the dropdown */}
              {typeValues.map((item, index) => (
                <option key={index} value={item}>
                  {displayTypes[item]} {/* Display the type with spaces */}
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
interface TextSnippet {
  id: string;
  factor: string;
  score: number;
  snippetText: string;
  type: "adminoverview" | "employeeaggregated" | "employeeindividual";
}
const fetchAllSnippets = async (client: any, pageSize: number = 100): Promise<any[]> => {
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

const CreateSnippetSetModal: React.FC<{
  onClose: () => void;
  onCreate: () => void;
}> = ({ onClose, onCreate }) => {
  const [name, setName] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [textSnippets, setTextSnippets] = useState<TextSnippet[]>([]); // Updated type for text snippets
  const [isCreating, setIsCreating] = useState<boolean>(false);

  useEffect(() => {
    const fetchTextSnippets = async () => {
      try {
        const allSnippets = await fetchAllSnippets(client);
        const snippetList = allSnippets.filter((snippet: any) => !snippet.disabled && snippet.snippetSetId === "");
        // const { data: snippetList } = await client.models.TextSnippet.list({
        //   filter: {
        //     and: [{ disabled: { eq: false } }, { snippetSetId: { eq: "" } }],
        //   },
        // });
        console.log("fetched snippetl list", snippetList )

        setTextSnippets(
          snippetList.map((snippet: any) => ({
            id: snippet.id,
            factor: snippet.factor, // Include required fields
            score: snippet.score,   // Include required fields
            snippetText: snippet.snippetText,
            type: snippet.type,     // Include required fields
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
      const { data: snippetSet } = await client.models.SnippetSet.create({
        name,
        tags,
      });
      if (!snippetSet) {
        console.error("Failed to create snippet set");
        return;
      }
      if (!snippetSet.id) {
        console.error("Snippet set ID not found");
        return;
      }
      for (const snippet of textSnippets) {
        const {data:mysavedsnippet} = await client.models.TextSnippet.create({
          factor: snippet.factor,
          score: snippet.score,
          snippetText: snippet.snippetText,
          type: snippet.type,
          disabled: true,
          snippetSetId: snippetSet.id,
        });
      }
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
          <label className="text-sm block font-medium mb-2">Text Snippets</label>
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
  const [type, setType] = useState<
    "adminoverview" | "employeeaggregated" | "employeeindividual" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();

  // Define types without spaces for saving
  const typeValues = [
    "adminoverview",
    "employeeaggregated",
    "employeeindividual",
  ];

  // Define corresponding display types with spaces
  const displayTypes: any = {
    adminoverview: "Admin Overview",
    employeeaggregated: "Employee Aggregated",
    employeeindividual: "Employee Individual",
  };

  const factors = [
    "Advocacy",
    "Psychological Safety",
    "Flexibility",
    "Growth Satisfaction",
    "Purpose",
  ];

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

      // Submit without spaces in the 'type' value
      await client.models.TextSnippet.create({
        factor,
        score: Number(score),
        snippetText,
        type, // This is already stored without spaces
        disabled: false,
        snippetSetId: "", // Default value for snippetSetId
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
                setType(
                  e.target.value as
                    | "adminoverview"
                    | "employeeaggregated"
                    | "employeeindividual"
                )
              }
              className="w-full p-2 border border-gray-300 rounded bg-gray-100 text-sm"
              required
            >
              <option value="" disabled>
                Select a type
              </option>
              {/* Show the type with spaces in the dropdown */}
              {typeValues.map((item, index) => (
                <option key={index} value={item}>
                  {displayTypes[item]} {/* Display the type with spaces */}
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
  const [isSnippetDropdownOpen, setIsSnippetDropdownOpen] = useState(false);
  const [editSnippet, setEditSnippet] = useState<any | null>(null);
  const [createSnippetSetModalOpen, setCreateSnippetSetModalOpen] =
    useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>("factor"); 
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const displayTypes: any = {
    adminoverview: "Admin Overview",
    employeeaggregated: "Employee Aggregated",
    employeeindividual: "Employee Individual",
  };

  const handleIdClick = (id: string) => {
    // Handle ID click logic
  };

  const fetchTextSnippets = async () => {
    try {
      const allSnippets = await fetchAllSnippets(client);
      const textSnippetList = allSnippets.filter((snippet: any) => !snippet.disabled);
      // const { data: textSnippetList } = await client.models.TextSnippet.list({
      //   filter: { disabled: { eq: false } },
      // });
      setTableHeaders(["factor", "score", "type", "snippet text", "manage"]);
      setTableData(
        textSnippetList.map((snippet: any) => ({
          factor: snippet.factor,
          score: snippet.score,
          "snippet text": snippet.snippetText,
          type: snippet.type,
          manage: (
            <div className="flex space-x-4">
              <FaEdit
                onClick={() => setEditSnippet(snippet)}
                className="cursor-pointer text-blue-600"
              />
              <FaTrash
                onClick={() => handleDelete(snippet)}
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

  // Sorting function
  const handleSort = (column: string) => {
    const isAsc = sortColumn === column && sortDirection === "asc";
    const direction = isAsc ? "desc" : "asc";
    setSortDirection(direction);
    setSortColumn(column);

    const sortedData = [...tableData].sort((a, b) => {
      const valueA = a[column]?.toString().toLowerCase();
      const valueB = b[column]?.toString().toLowerCase();

      if (direction === "asc") {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      } else {
        return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
      }
    });

    setTableData(sortedData);
  };

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
    setEditSnippet(null);
    fetchTextSnippets();
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
      type:
        | "adminoverview"
        | "employeeaggregated"
        | "employeeindividual"
        | null
        | undefined;
    };

    Papa.parse(csvFile, {
      header: true,
      complete: async (results) => {
        const data = results.data as SnippetRow[];
        try {
          for (const row of data) {
            const { factor, score, text: snippetText, type } = row;
            const sanitizedType = type?.replace(/\s/g, "") as
              | "adminoverview"
              | "employeeaggregated"
              | "employeeindividual"
              | null;

            if (
              sanitizedType !== "adminoverview" &&
              sanitizedType !== "employeeaggregated" &&
              sanitizedType !== "employeeindividual"
            ) {
              console.error(`Invalid type: ${sanitizedType}`);
              continue;
            }

            await client.models.TextSnippet.create({
              factor,
              score: Number(score),
              snippetText,
              type: sanitizedType,
              disabled: false,
              snippetSetId: "",
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
              <button
                onClick={() => setCreateSnippetSetModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Create Snippet Set
              </button>

              <div className="relative">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                  onClick={() => setIsSnippetDropdownOpen((prev) => !prev)}
                >
                  <span>Add Snippet</span>
                  <FaChevronDown className="ml-2" />
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
              <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="min-w-full bg-white divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {tableHeaders.map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                          onClick={() => handleSort(header)}
                        >
                          {header}
                          {sortColumn === header && (
                            <span className="ml-1">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
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
                              header.toLowerCase() === ""
                                ? "text-blue-500 font-bold cursor-pointer"
                                : ""
                            }`}
                            onClick={() => {
                              if (header.toLowerCase() === "") {
                                handleIdClick(row[header]);
                              }
                            }}
                          >
                            {/* If the column is 'type', show the value from displayTypes */}
                            {header === "type"
                              ? displayTypes[row[header]] || row[header]
                              : row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
