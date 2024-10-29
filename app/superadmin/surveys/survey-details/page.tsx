'use client';

import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/superadminHeader';
import Sidebar from '@/components/superadminSidebar';
import Table from '@/components/table';
import { Schema } from '@/amplify/data/resource';
import { Suspense } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useDropzone } from 'react-dropzone';
import Breadcrumb from '@/components/surveyBreadCrumb';
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
import { FaTrash } from 'react-icons/fa';

Amplify.configure(outputs);
const client = generateClient<Schema>();


import Papa from 'papaparse';
import Employee from '../../../assessment/page';

interface EmployeeUploadPopupProps {
  surveyId: string;
  companyId: string;
  onClose: () => void;
  onEmployeesCreated: () => void;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  hireDate: string;
  gender: string;
  ethnicity: string;
  manager: string;
  location: string;
  veteranStatus: string;
  disabilityStatus: string;
  jobLevel: string;
  department: string;
  companyName: string;
  companyId: string;
}

const EmployeeUploadPopup: React.FC<EmployeeUploadPopupProps> = ({ surveyId, companyId, onClose, onEmployeesCreated }) => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const expectedHeaders = [
    'First Name', 'Last Name', 'Email', 'DOB', 'Hire Date', 
    'Gender', 'Ethnicity', 'Manager/Supervisor', 'Location', 
    'Veteran Status', 'Disability Status', 'Job Level', 'Department'
  ];

  // Handle file parsing
  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const headerMismatch = expectedHeaders.some(header => !headers.includes(header));
        if (headerMismatch) {
          setErrorMessage('CSV headers do not match the expected format.');
          return;
        }
        const parsedData: UserData[] = results.data.map((row: any) => ({
          firstName: row['First Name'],
          lastName: row['Last Name'],
          email: row['Email'],
          dob: row['DOB'],
          hireDate: row['Hire Date'],
          gender: row['Gender'],
          ethnicity: row['Ethnicity'],
          manager: row['Manager/Supervisor'],
          location: row['Location'],
          veteranStatus: row['Veteran Status'],
          disabilityStatus: row['Disability Status'],
          jobLevel: row['Job Level'],
          department: row['Department'],
          companyName: companyId || '',
          companyId: companyId || '',
        }));
        setUsers(parsedData);
        setSelectedFile(file);
      },
      error: (error) => setErrorMessage('Error parsing CSV file: ' + error.message),
    });
  };

  // Integrate drag-and-drop functionality
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setErrorMessage('');
      parseCSV(file);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] } });

  // Create users in the database
  const createUserCollections = async () => {
    try {
      setLoading(true);
      let employeeArray: string[] = [];
      for (const user of users) {
        const formattedDOB = user.dob ? new Date(user.dob).toISOString().split('T')[0] : null;
        const formattedHireDate = user.hireDate ? new Date(user.hireDate).toISOString().split('T')[0] : null;
        employeeArray.push(`${user.firstName}:${user.lastName}:${user.email}:${formattedDOB}:${formattedHireDate}:${user.gender}:${user.ethnicity}:${user.manager}:${user.location}:${user.veteranStatus}:${user.disabilityStatus}:${user.jobLevel}:${user.department}:${user.companyId}:${surveyId}:employee`);
      }

      await client.mutations.bulkCreateEmployees({ employeesArray: employeeArray });
      alert('Employees created successfully!');
      onEmployeesCreated();
      setLoading(false);
      onClose();
    } catch (error) {
      console.error('Error creating users:', error);
      setErrorMessage('Error creating employees');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-md w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Upload CSV to Create Employees</h2>

        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 p-6 rounded-md flex flex-col items-center justify-center mb-4 cursor-pointer"
        >
          <input {...getInputProps()} />
          <i className="fas fa-file-csv text-5xl text-gray-500"></i>
          <label className="text-lg mt-4 text-gray-700 cursor-pointer">
            Drag & drop a CSV here, or click to select one
          </label>
          {selectedFile && <p className="text-green-600 mt-2">{selectedFile.name} selected.</p>}
        </div>

        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

        <div className="flex justify-end space-x-2">
          <button
            className={`bg-blue-600 text-white px-4 py-2 rounded-md ${!selectedFile || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={createUserCollections}
            disabled={!selectedFile || loading}
          >
            {loading ? 'Creating Employees...' : 'Create Employees'}
          </button>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-md" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};


const SurveyDetailsPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const surveyName = searchParams.get('surveyName');
  const companyId = searchParams.get('companyId');

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [collectionData, setCollectionData] = useState<Record<string, string>[]>([]);
  const [snippetData, setSnippetData] = useState<Record<string, string>[]>([]);
  const [employeeData, setEmployeeData] = useState<{ id: string, name: string, department: string, jobTitle: string, email: string }[]>([]);
  const [surveyId, setSurveyId] = useState<string>("")

  const collectionTableHeaders = ['name', 'tags']; 
  const snippetTableHeaders = ['name', 'tags']
  const employeeHeaders = ['name', 'department', 'job title', 'email', 'manage']; // Adding 'manage' column

  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);

  const handleCollectionClick = (collectionName: string) => {
    const newPath = `/superadmin/collections/collection/collection-details?name=${encodeURIComponent(collectionName)}`;
    router.push(newPath);
    
  };

  const handleIdClick = (id: string) => {
    router.push(`/superadmin/snippets/snippetset/details?name=${id}`);
  };

  const fetchData = async () => {
    try {
      if (surveyName && companyId) { 
        const filterForSurvey = {
          surveyName: { eq: surveyName },
          companyId: { eq: companyId }
        };
        const surveys = await createPaginatedFetchFunctionForSurvey(client, filterForSurvey)();

        if (surveys && surveys.length > 0) {
          const survey = surveys[0];
          const { collectionId, snippetSetId, id: surveyID } = survey;
          setSurveyId(surveyID)
          if (collectionId) {
            const filterForCollection = {
              id: { eq: collectionId }
            };
            const collections = await createPaginatedFetchFunctionForCollection(client, filterForCollection)();
            
            if (collections && collections.length > 0) {
              const collection = collections[0];
              setCollectionData([{ tags: collection.tags || "", name: collection.name || '' }]);
            }
          }

          if (snippetSetId) {
            const filterForSnippetSet = {
              id: { eq: snippetSetId }
            };
            const snippets = await createPaginatedFetchFunctionForSnippetSet(client, filterForSnippetSet)();

            if (snippets && snippets.length > 0) {
              const snippet = snippets[0];
              setSnippetData([{ tags: snippet.tags || "", name: snippet.name || '' }]);
            }
          }

          const filterForUser = {
            surveyId: { eq: surveyID }
          };
          const users = await createPaginatedFetchFunctionForUser(client, filterForUser)();
          console.log('Employee List:', users);

          const formattedEmployees = users.map(emp => ({
            id: emp.id, // Store the employee ID for deletion
            name: `${emp.firstName} ${emp.lastName}`,
            department: emp.department || '',
            jobTitle: emp.jobLevel || '',
            email: emp.email || ''
          }));

          setEmployeeData(formattedEmployees);
        }
      }
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [surveyName, companyId]);

  // Function to handle employee deletion
  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      const toBeDeletedEmployee = { id: employeeId };
      const surveyData = await createPaginatedFetchFunctionForSurveyResults(client, { userId: { eq: employeeId } })();
      if (surveyData.length > 0) {
        alert("Cannot delete employee as survey data exists for this employee");
        return;
      }
      const { data: deletedEmployee, errors } = await client.models.User.delete(toBeDeletedEmployee);
      if (errors) {
        console.error("Error deleting employee:", errors);
      } else {
        console.log("Employee deleted successfully:", deletedEmployee);
        // Refresh the employee data after deletion
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete employee", error);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
      <Sidebar activePath="/superadmin" />
        <div className="w-4/5 p-8">
          <Breadcrumb />
          <h1 className="text-2xl font-semibold mb-6">{surveyName}</h1>

          <div className="flex space-x-4">
            <div className="border p-4 w-1/2">
              <h1 className='mb-4'>Questions</h1>
              <Table headers={collectionTableHeaders} data={collectionData} handleClick={handleCollectionClick} underlineColumn='name' />
            </div>
            <div className="border p-4 w-1/2">
              <h1 className='mb-4'>Snippets</h1>
              <Table headers={snippetTableHeaders} data={snippetData} handleClick={handleIdClick} underlineColumn='name' />
            </div>
          </div>

          <div className="border p-4 mt-6">
            <div className="flex items-center mb-4 justify-end">
              <button
                onClick={handleOpenPopup}
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Add Employees CSV
              </button>
            </div>
            <h1 className='mb-4 font-bold'>Employees</h1>
            {employeeData.length > 0 ? (
              <div className="overflow-x-auto border border-gray-200 rounded-md">
                <table className="min-w-full bg-white divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {employeeHeaders.map((header, index) => (
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
                    {employeeData.map((row:any, rowIndex) => (
                      <tr key={rowIndex}>
                        {employeeHeaders.map((header, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm"
                          >
                            {header === "manage" ? (
                              <FaTrash
                                className="text-red-500 cursor-pointer"
                                onClick={() => handleDeleteEmployee(row.id)} // Delete employee on click
                              />
                            ) : (
                              row[header]
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p></p>
            )}
          </div>
        </div>
      </div>
      {isPopupOpen && <EmployeeUploadPopup surveyId={surveyId} companyId={companyId || ''} onClose={handleClosePopup} onEmployeesCreated={fetchData} />}
    </div>
  );
};

export default function () {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SurveyDetailsPage />
    </Suspense>
  );
}