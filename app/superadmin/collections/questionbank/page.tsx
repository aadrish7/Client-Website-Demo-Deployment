"use client";
import React, { useState, useEffect, useCallback } from "react";
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
import { FaChevronDown } from "react-icons/fa";
import '@fortawesome/fontawesome-free/css/all.min.css';
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
import { useDropzone } from "react-dropzone";


Amplify.configure(outputs);
const client = generateClient<Schema>();

const CreateCollectionModal: React.FC<{ 
  onClose: () => void; 
  onCreate: () => void; 
  questions: { id: string; factor: string; questionText: string; }[] 
}> = ({ onClose, onCreate, questions }) => {
  const [name, setName] = useState<string>('');
  const [tags, setTags] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  const handleSubmit = async () => {
    setIsCreating(true);
    try {
      const allCollections = await createPaginatedFetchFunctionForCollection(client, {})();
      const collectionNames = allCollections.map((collection) => collection.name);
      if (collectionNames.includes(name)) {
        alert('Collection name already exists. Choose a different name for the collection');
        return;
      }
      if (!name || !tags) {
        alert('Please fill in all the fields');
        return;
      }
      const { data: collection } = await client.models.Collection.create({
        name,
        tags,
      });
      if (!collection) {
        console.error('Failed to create collection');
        return;
      }
      let questionArray: string[] = [];
      for (const question of questions) {
        questionArray.push(`${question.factor}:${question.questionText}:${collection.id}`);
      }
      console.log("Question Array:", questionArray);
      const { data, errors } = await client.mutations.bulkCreateQuestions({
        questionArray: questionArray,
      });
      onCreate();

    } catch (error) {
      console.error('Failed to create collection', error);
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
            placeholder="Enter question set name"
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
            placeholder="Enter question set tags"
            disabled={isCreating}
          />
        </div>

        {/* Questions Information */}
        <div className="mb-6 mt-4">
          <label className="block text-sm font-medium mb-2">Questions</label>
          <p>{questions.length} questions will be added to this collection by default.</p>
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
            className={`bg-blue-600 text-white px-4 py-2 rounded-md ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};



const CSVUploadModal: React.FC<{
  onClose: () => void;
  onUpload: (data: Map<string, string[]>) => Promise<void>;
}> = ({ onClose, onUpload }) => {
  const [parsedData, setParsedData] = useState<Map<string, string[]> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null); // Reset error on new file selection
    const file = acceptedFiles[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.errors.length > 0) {
          console.error(result.errors); // Log for debugging
          setError("Error parsing the CSV file. Please check the file format.");
          return;
        }

        try {
          const data = result.data as { Factor: string; Questions: string }[];

          if (data.length === 0 || !data[0].Factor || !data[0].Questions) {
            setError("Invalid CSV format. Ensure the CSV contains 'Factor' and 'Questions' columns.");
            return;
          }

          const groupedQuestions = groupQuestionsByFactor(data);
          setParsedData(groupedQuestions);
        } catch (err) {
          setError("Error processing the CSV data.");
        }
      },
      error: () => {
        setError("Error reading the CSV file. Please try again.");
      },
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    disabled: isCreating,
  });

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
      setError(null);
      try {
        await onUpload(parsedData);
      } catch {
        setError("Error uploading the data. Please try again.");
      } finally {
        setIsCreating(false);
      }
    } else {
      setError("No data available to upload.");
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-md w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Upload Questions CSV</h2>

        <div
          {...getRootProps({
            className: "border-2 border-dashed border-gray-300 p-6 rounded-md flex flex-col items-center justify-center mb-4 cursor-pointer",
          })}
        >
          <input {...getInputProps()} />
          <i className="fas fa-file-csv text-5xl text-gray-500"></i>
          <label className="text-lg mt-4 text-gray-700 cursor-pointer">
            Click to upload or drag and drop
          </label>
          {parsedData && <p className="text-green-600 mt-2">File selected.</p>}
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded-md"
            disabled={isCreating}
          >
            Cancel
          </button>
          {parsedData && (
            <button
              onClick={handleCreate}
              className={`bg-blue-600 text-white px-4 py-2 rounded-md ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Questions'}
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
      if (!factor || !questionText) {
        alert("Please fill in all the fields");
        return;
      }
      // Step 1: Disable the current question
      await client.models.Question.update({
        id: question.id,
        disabled: true,  // Disable the old question
      });
  
      // Step 2: Create a new question with the updated values
      await client.models.Question.create({
        factor,
        questionText,
        disabled: false, // New question is active
        collectionId: "", // No collection for now
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
      if (!factor || !questionText) {
        alert("Please fill in all the fields");
        return;
      }
      await client.models.Question.create({
        factor,
        questionText,
        disabled: false,
        collectionId: "",
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
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Sorting state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState<boolean>(false);
  const [questions, setQuestions] = useState<{ 
    id: string; 
    factor: string; 
    questionText: string; 
  }[]>([]);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
  };

  const handleEditSave = () => {
    setEditingQuestion(null);
    fetchQuestions();
  };

  const handleCreateCollection = () => {
    setIsCollectionModalOpen(false);
    fetchQuestions();
  };

  const handleClearAll = async () => {
    const confirmed = window.confirm("Are you sure you want to disable all questions?");
    if (confirmed) {
      try {
        setIsClearing(() => true);
        let questionArray: string[] = [];
        for (const question of questions) {
          questionArray.push(`${question.id}:"dummy-data":true`);
        }
        console.log("Question Array:", questionArray);
        const { data, errors } = await client.mutations.bulkUpdateQuestions({
          questionsArray: questionArray,
        });
        // for (const question of questions) {
        //   await client.models.Question.update({
        //     id: question.id,
        //     disabled: true,
        //   });
        // }
        fetchQuestions(); 
      } catch (error) {
        console.error("Failed to disable all questions", error);
      }finally {
        setIsClearing(false); // End loading state
      }
    }
  };

  const fetchAllQuestions = async (client: any, pageSize: number = 100): Promise<any[]> => {
    let allQuestions: any[] = [];
    let nextToken: string | null = null;
    let hasMorePages: boolean = true;
  
    while (hasMorePages) {
      const { data: questions, nextToken: newNextToken }: { data: any[]; nextToken: any } = await client.models.Question.list({
        nextToken,
        limit: pageSize,
        filter: {
          and: [
            { disabled: { eq: false } },
            { collectionId: { eq: "" } },
          ],
        },
      });
  
      allQuestions = [...allQuestions, ...questions];
      nextToken = newNextToken;
  
      if (!nextToken || questions.length < pageSize) {
        hasMorePages = false;
      }
    }
  
    return allQuestions;
  };

  const fetchQuestions = async () => {
    try {
      const { userId } = await getCurrentUser();
      const filterForQuestions = {
        disabled : {
          eq: false
        },
        collectionId: {
          eq: ""
        }
      };

      const questionList = await createPaginatedFetchFunctionForQuestion(client, filterForQuestions)();
      const allQuestions = await createPaginatedFetchFunctionForQuestion(client, {})();
      console.log("All Question :::", allQuestions)
      
      
      
      console.log("Questions:", questionList);

      if (!questionList) return;
      if (questionList.length === 0) {
        setTableHeaders(() => ["factor", "question text", "manage"]);
        setTableData([]);
        return;
      }
      setQuestions(questionList.map((question) => ({
        id: question.id,
        factor: question.factor || "",
        questionText: question.questionText || "",
      })));
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
      console.error("Failed to fetch questions", error);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleModalClose = () => setIsModalOpen(false);
  const handleCSVModalClose = () => setIsCSVModalOpen(false);

  const handleCreateQuestion = () => {
    setIsModalOpen(false);
    fetchQuestions();
  };

  const handleCSVUpload = async (groupedQuestions: Map<string, string[]>) => {
    try {
      let questionArray: string[] = [];
      let emptyCollectionId = "";
        for (const [factor, questions] of Array.from(groupedQuestions.entries())) {
          for (const questionText of questions) {
            questionArray.push(
            `${factor}:${questionText}:${emptyCollectionId}`);
          }
        }
  
        const { data, errors } = await client.mutations.bulkCreateQuestions({
          questionArray: questionArray
          
        });
      fetchQuestions();
      setIsCSVModalOpen(false);
    } catch (error) {
      console.error("Failed to create questions from CSV", error);
    }
  };

  const handleDelete = async (question: any) => {
    try {
      await client.models.Question.update({
        id: question.id,
        disabled: true,
      });
      fetchQuestions();
    } catch (error) {
      console.error("Failed to delete the question", error);
    }
  };

  const handleDropdownToggle = () => {
    setDropdownOpen((prev) => !prev);
  };

  // Handle sorting when the user clicks the factor column
  const handleSort = () => {
    const sortedData = [...tableData].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.factor.localeCompare(b.factor);
      } else {
        return b.factor.localeCompare(a.factor);
      }
    });
    setTableData(sortedData);
    setSortOrder((prevSortOrder) => (prevSortOrder === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar activePath="/superadmin/collections/questionbank" />
        <div className="w-4/5 p-8">
          <h1 className="text-2xl font-semibold mb-6">Question Bank</h1>

          <div className="border p-4">
            <div className="flex items-center mb-4 justify-end space-x-2">
              
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
                onClick={() => setIsCollectionModalOpen(true)}
              >
                Create Question Set
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
                onClick={handleClearAll}
                disabled={isClearing} // Disable button when clearing
              >
                {isClearing ? "Clearing..." : "Clear All"}
              </button>

              <div className="relative">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
                  onClick={handleDropdownToggle}
                >
                  <span>Add Question</span>
                  <FaChevronDown className="ml-2" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-md z-10">
                    <button
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-200"
                      onClick={() => {
                        setIsModalOpen(true);
                        setDropdownOpen(false);
                      }}
                    >
                      Manual
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-200"
                      onClick={() => {
                        setIsCSVModalOpen(true);
                        setDropdownOpen(false);
                      }}
                    >
                      CSV
                    </button>
                  </div>
                )}
              </div>
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
                          {header === "factor" ? (
                            <div className="flex items-center">
                              Factor
                              <button onClick={handleSort} className="ml-2">
                                {sortOrder === "asc" ? "↑" : "↓"}
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
                              header.toLowerCase() === ""
                                ? "text-blue-500 font-bold cursor-pointer"
                                : ""
                            }`}
                            onClick={() => {
                              if (header.toLowerCase() === "question text") {
                                console.log("Clicked:", row[header]);
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
              <p>Loading Questions...</p>
            )}
          </div>
        </div>
      </div>

      {isCollectionModalOpen && (
        <CreateCollectionModal
          onClose={() => setIsCollectionModalOpen(false)}
          onCreate={handleCreateCollection}
          questions={questions}
        />
      )}

      {isModalOpen && (
        <CreateQuestionModal
          onClose={handleModalClose}
          onCreate={handleCreateQuestion}
        />
      )}
      {isCSVModalOpen && (
        <CSVUploadModal onClose={handleCSVModalClose} onUpload={handleCSVUpload} />
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