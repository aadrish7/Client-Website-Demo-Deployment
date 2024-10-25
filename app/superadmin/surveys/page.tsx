"use client";

import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { useSearchParams } from "next/navigation";
import Header from "@/components/superadminHeader";
import Sidebar from "@/components/superadminSidebar";
import Table from "@/components/table";
import { Schema } from "@/amplify/data/resource";
import { Suspense } from "react";
import Router, { useRouter } from "next/navigation";
import Breadcrumb from "@/components/surveyBreadCrumb";
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
import { create } from "domain";

Amplify.configure(outputs);
const client = generateClient<Schema>();

interface CreateSurveyModalProps {
  onClose: () => void;
  onCreate: () => void;
  collections: { id: string; name: string }[];
  snippetSets: { id: string; name: string }[];
  companyId: string;
  listOfSurveyNames: string[];
}
interface SnippetSet {
  id: string;
  name: string;
}

const CreateSurveyModal: React.FC<CreateSurveyModalProps> = ({
  onClose,
  onCreate,
  collections,
  snippetSets,
  companyId,
  listOfSurveyNames,
}) => {
  const [surveyName, setSurveyName] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [snippetSetId, setSnippetSetId] = useState("");

  const [start, setStart] = useState(false);

  const handleSubmit = async () => {
    try {
      const survey = {
        surveyName,
        collectionId,
        snippetSetId,
        companyId,
        start: true,
      };

      if (!surveyName || !collectionId || !snippetSetId) {
        alert("Please fill or select in all fields");
        return;
      }
      if (listOfSurveyNames.includes(surveyName)) {
        alert("Survey name already exists, Change the name and try again");
        return;
      }
      const {data:surveyCreated} = await client.models.Survey.create(survey);
      console.log("Survey created", surveyCreated);
      onCreate();
      onClose();
    } catch (error) {
      console.error("Failed to create survey", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-10">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-7">Add Survey</h2>

        {/* Survey Name Input */}
        <div className="mb-6 mt-4">
          <label className=" text-sm block font-medium mb-2">Survey Name</label>
          <input
            type="text"
            className="border border-gray-300 rounded p-2 w-full bg-gray-100 text-sm text-black"
            value={surveyName}
            onChange={(e) => setSurveyName(e.target.value)}
            placeholder="Enter survey name"
          />
        </div>

        {/* Collection Selector */}
        <div className="mb-6 mt-4">
          <label className="text-sm block font-medium mb-2 ">
            Select Collection
          </label>
          <select
            className="border border-gray-300 rounded p-2 w-full bg-gray-100 text-sm"
            value={collectionId}
            onChange={(e) => setCollectionId(e.target.value)}
          >
            <option value="">Select a collection</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </div>

        {/* Snippet Set Selector */}
        <div className="mb-6 mt-4">
          <label className="text-sm block font-medium mb-2">
            Select Snippet Set
          </label>
          <select
            className="border border-gray-300 rounded p-2 w-full bg-gray-100 text-sm"
            value={snippetSetId}
            onChange={(e) => setSnippetSetId(e.target.value)}
          >
            <option value="">Select a Snippet</option>
            {snippetSets.map((snippetSet) => (
              <option key={snippetSet.id} value={snippetSet.id}>
                {snippetSet.name}
              </option>
            ))}
          </select>
        </div>

        {/* Start Checkbox */}
        {/* <div className="flex items-center mb-6 mt-4">
          <input
            type="checkbox"
            checked={start}
            onChange={(e) => setStart(e.target.checked)}
            className="mr-2"
          />
          <label className="text-sm">Start</label>
        </div> */}

        {/* Buttons */}
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
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

interface EditSurveyModalProps {
  onClose: () => void;
  onUpdate: () => void;
  surveyId: string;
  currentStatus: boolean;
}

const EditSurveyModal: React.FC<EditSurveyModalProps> = ({
  onClose,
  onUpdate,
  surveyId,
  currentStatus,
}) => {
  const [status, setStatus] = useState(currentStatus);

  const handleSubmit = async () => {
    try {
      await client.models.Survey.update({
        id: surveyId,
        start: status,
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to update survey", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Edit Survey Status</h2>
        <div className="mb-4">
          <label className="block mb-2">
            <input
              type="radio"
              checked={status}
              onChange={() => setStatus(true)}
              className="mr-2"
            />
            Start Survey
          </label>
          <label className="block">
            <input
              type="radio"
              checked={!status}
              onChange={() => setStatus(false)}
              className="mr-2"
            />
            End Survey
          </label>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

const SurveysPage = () => {
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [listOfSurveyNames, setListOfSurveyNames] = useState<string[]>([]);
  const [tableData, setTableData] = useState<
    {
      id: string;
      "survey name": string;
      "updated at": string; // Update to use updatedAt field
      status: string;
      start: boolean;
    }[]
  >([]);
  const router = useRouter();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingSurveyId, setEditingSurveyId] = useState<string>("");
  const [editingSurveyStatus, setEditingSurveyStatus] =
    useState<boolean>(false);
  const [collections, setCollections] = useState<
    { id: string; name: string }[]
  >([]);
  const [snippetSets, setSnippetSets] = useState<
    { id: string; name: string }[]
  >([]);
  const [companyId, setCompanyId] = useState<string>("");
  const searchParams = useSearchParams();
  const companyName = searchParams.get("companyName");

  const handleSurveyClick = (surveyName: string) => {
    router.push(
      `surveys/survey-details?surveyName=${encodeURIComponent(
        surveyName
      )}&companyId=${encodeURIComponent(companyId || "")}`
    );
  };

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const filteredCompanyName = companyName || "";
        const filterForCompany = { companyName: { eq: filteredCompanyName } };
        const companies = await createPaginatedFetchFunctionForCompany(client, filterForCompany)();
        const company = companies.find((c) => c.companyName === companyName);
        setCompanyId(company?.id || "");
      } catch (error) {
        console.error("Failed to fetch company ID", error);
      }
    };
    fetchCompanyData();
  }, [companyName]);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const collectionList = await createPaginatedFetchFunctionForCollection(client, {})();
        setCollections(
          collectionList.map((c) => ({ id: c.id, name: c.name || "" }))
        );
      } catch (error) {
        console.error("Failed to fetch collections", error);
      }
    };
    const fetchSnippetSets = async () => {
      try {
        const SnippetSets = await createPaginatedFetchFunctionForSnippetSet(client, {})();
        setSnippetSets(
          SnippetSets.map((c) => ({ id: c.id, name: c.name || "" }))
        );
      } catch (error) {
        console.error("Failed to fetch Snippets", error);
      }
    };
    fetchCollections();
    fetchSnippetSets();
  }, []);

  const fetchSurveys = async () => {
    try {
      const filterForCompany = { companyId: { eq: companyId } };
      const surveyList = await createPaginatedFetchFunctionForSurvey(client, filterForCompany)();
      if (surveyList.length === 0) {
        setTableData([]);
        return;
      }
      setListOfSurveyNames(surveyList.map((s) => s.surveyName));
      setTableHeaders(["survey name", "updated at", "status", "manage"]);
      setTableData(
        surveyList.map((s) => ({
          id: s.id,
          "survey name": s.surveyName,
         "updated at": new Date(s.updatedAt).toLocaleDateString('default', {
          day: 'numeric', 
          month: 'long',   
          year: 'numeric',  
        }),
          status: s.start ? "In Progress" : "Completed",
          start: s.start ?? false,
        })))
    } catch (error) {
      console.error("Failed to fetch surveys", error);
    }
  };

  useEffect(() => {
    if (companyId) fetchSurveys();
  }, [companyId]);

  const handleEditClick = (surveyId: string, currentStatus: boolean) => {
    setEditingSurveyId(surveyId);
    setEditingSurveyStatus(currentStatus);
    setIsEditModalOpen(true);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar activePath="/superadmin" />
        <div className="w-4/5 p-8">
        <Breadcrumb />
          <h1 className="text-2xl font-semibold mb-6">Surveys</h1>
          <div className="border p-4">
            <div className="flex justify-end">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md mb-4"
              >
                Create New Survey
              </button>
            </div>
            {tableData.length > 0 ? (
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
                    {tableData.map((row: any, rowIndex) => (
                      <tr key={rowIndex}>
                        {tableHeaders.map((header, colIndex) => (
                          <td
                            key={colIndex}
                            className={`px-6 py-4 whitespace-nowrap text-sm ${
                              header.toLowerCase() === "survey name"
                                ? "text-blue-500 font-bold cursor-pointer"
                                : ""
                            }`}
                            onClick={() => {
                              if (header.toLowerCase() === "survey name") {
                                handleSurveyClick(row["survey name"]);
                              }
                            }}
                          >
                            {header.toLowerCase() === "manage" ? (
                              <button
                                onClick={() =>
                                  handleEditClick(row.id, row.start)
                                }
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                              >
                                Manage
                              </button>
                            ) : header.toLowerCase() === "status" ? (
                              <span
                                className={`${
                                  row[header] === "In Progress"
                                    ? "inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                    : "inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                                }`}
                              >
                                {row[header]}
                              </span>
                            ) : (
                              row[header as keyof typeof row]
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
      {isCreateModalOpen && (
        <CreateSurveyModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={fetchSurveys}
          collections={collections}
          snippetSets={snippetSets}
          companyId={companyId}
          listOfSurveyNames={listOfSurveyNames}
        />
      )}
      {isEditModalOpen && (
        <EditSurveyModal
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={fetchSurveys}
          surveyId={editingSurveyId}
          currentStatus={editingSurveyStatus}
        />
      )}
    </div>
  );
};

export default function () {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SurveysPage />
    </Suspense>
  );
}
