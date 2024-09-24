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

// Configure Amplify
Amplify.configure(outputs);

// Generate the client with Schema typing
const client = generateClient<Schema>();

import Papa from 'papaparse';

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

  // Function to handle file upload and parse CSV
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
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
        console.log('Parsed data:', parsedData);
        setUsers(parsedData);
      },
      error: (error) => {
        setErrorMessage('Error parsing CSV file: ' + error.message);
      },
    });
  };

  // Function to create users in the database
  const createUserCollections = async () => {
    try {
      for (const user of users) {
        const {data: clients} = await client.models.User.create({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          // dob: user.dob,
          // hireDate: user.hireDate,
          gender: user.gender,
          ethnicity: user.ethnicity,
          manager: user.manager,
          location: user.location,
          veteranStatus: user.veteranStatus,
          disabilityStatus: user.disabilityStatus,
          jobLevel: user.jobLevel,
          department: user.department,
          companyId: user.companyId,
          surveyId: surveyId, // Store surveyId
          role: 'employee',
        });
        console.log("user", user)
        console.log("client", clients)
      }
      alert('Employees created successfully!');
      onEmployeesCreated();
      onClose(); // Close the modal after success
    } catch (error) {
      console.error('Error creating users:', error);
      setErrorMessage('Error creating employees');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-md w-1/3">
        <h2 className="text-xl font-semibold mb-4">Upload CSV to Create Employees</h2>
        <input type="file" accept=".csv" onChange={handleFileUpload} className="mb-4" />
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
        <div className="flex justify-end space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md" onClick={createUserCollections}>
            Create Employees
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
  const handleCollectionClick = (collectionName: string) => {
    console.log("here")
    const newPath = `collection/collection-details?name=${encodeURIComponent(collectionName)}`;
    
  };
  const searchParams = useSearchParams();
  const surveyName = searchParams.get('surveyName');
  const companyId = searchParams.get('companyId');

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);

  const [collectionData, setCollectionData] = useState<Record<string, string>[]>([]);
  const [snippetData, setSnippetData] = useState<Record<string, string>[]>([]);
  const [employeeData, setEmployeeData] = useState<Record<string, string>[]>([]);
  const [surveyId, setSurveyId] = useState<string>("")

  const collectionTableHeaders = ['name', 'id']; 
  const snippetTableHeaders = ['name', 'id']
  const employeeHeaders = ['name', 'department', 'jobTitle', 'email'];

  const fetchData = async () => {
    try {
      if (surveyName && companyId) { 
        const { data: surveys } = await client.models.Survey.list({
          filter: {
            surveyName: { eq: surveyName },
            companyId: { eq: companyId }
          }
        });

        if (surveys && surveys.length > 0) {
          const survey = surveys[0];
          const { collectionId, snippetSetId, id: surveyID } = survey;
          setSurveyId(surveyID)
          if (collectionId) {
            const { data: collections } = await client.models.Collection.list({
              filter: { id: { eq: collectionId } }
            });
            
            if (collections && collections.length > 0) {
              const collection = collections[0];
              setCollectionData([{ id: collectionId, name: collection.name || '' }]);
            }
          }

          if (snippetSetId) {
            const { data: snippets } = await client.models.SnippetSet.list({
              filter: { id: { eq: snippetSetId } }
            });

            if (snippets && snippets.length > 0) {
              const snippet = snippets[0];
              setSnippetData([{ id: snippetSetId, name: snippet.name || '' }]);
              console.log("snippet", snippet)
            }
          }

          const { data: users } = await client.models.User.list({
            filter: { surveyId: { eq: surveyID } }
          });

          console.log('Users:', users);

          const formattedEmployees = users.map(emp => ({
            name: `${emp.firstName} ${emp.lastName}`,
            department: emp.department || '',
            jobTitle: emp.jobLevel || '',
            email: emp.email || '',
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

  const handleIdClick = (id: string) => {
    console.log('Clicked ID:', id);
  };

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
      active: false,
      subItems: [
        { label: '📋 Snippet Bank', active: false, href: '/superadmin/snippets' },
        { label: '📦 Snippet Set', active: false, href: '/superadmin/snippets/snippetset' }
      ]
    },
    { label: '🏢 Company', active: true, href: '/superadmin' },
    { label: '📊 Analytics', active: false, href: '/analytics' },
    { label: '💬 Help', active: false, href: '/help' }
  ];

  const handleEmployeesCreated = () => {
    fetchData();
  };

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar navItems={navItems} />
        <div className="w-4/5 p-8">
          <h1 className="text-2xl font-semibold mb-6">{surveyName}</h1>
          <div className="flex space-x-4">
            <div className="border p-4 w-1/2">
              <h1 className='mb-4'>Collections</h1>
              <Table headers={collectionTableHeaders} data={collectionData} handleClick={handleCollectionClick} underlineColumn='name' />
            </div>
            <div className="border p-4 w-1/2">
              <h1 className='mb-4'>Snippets</h1>
              <Table headers={snippetTableHeaders} data={snippetData} handleClick={handleIdClick} underlineColumn='naME' />
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
              <Table headers={employeeHeaders} data={employeeData} handleClick={handleIdClick} underlineColumn='' />
            ) : (
              <p></p>
            )}
          </div>
        </div>
      </div>
      {isPopupOpen && <EmployeeUploadPopup surveyId={surveyId} companyId={companyId || ''} onClose={handleClosePopup}  onEmployeesCreated={handleEmployeesCreated} />}
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
