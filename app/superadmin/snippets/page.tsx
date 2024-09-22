'use client';
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '@/amplify/data/resource';
import { Amplify } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import outputs from '@/amplify_outputs.json';
import Header from '@/components/superadminHeader'; 
import Sidebar from '@/components/superadminSidebar';
import Table from '@/components/table';    
import Papa from 'papaparse';

Amplify.configure(outputs);
const client = generateClient<Schema>();

const SuperAdminMainPage: React.FC = () => {
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [showCsvPopup, setShowCsvPopup] = useState(false);  // State to handle popup visibility
  const [csvFile, setCsvFile] = useState<File | null>(null); // State to store uploaded CSV file
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter()

  const handleIdClick = (id: string) => {
  };
  const fetchTextSnippets = async () => {
    try {
      const { data: textSnippetList } = await client.models.TextSnippet.list({});
      setTableHeaders(() => ['factor', 'score', 'snippetText']);
      setTableData(
        textSnippetList.map((snippet: any) => ({
          factor: snippet.factor,
          score: snippet.score,
          snippetText: snippet.snippetText,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch text snippets');
      console.error('Error:', error);
    }
  };
  // Fetch Text Snippets and Set Table Data
  useEffect(() => {


    fetchTextSnippets();
  }, []);

  // Function to handle CSV file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setCsvFile(event.target.files[0]);
    }
  };

  // Function to parse CSV and create snippets
  const handleCsvSubmit = async () => {
    setIsUploading(true);
    if (!csvFile) return;
    type SnippetRow = {
      factor: string;
      score: string;
      text: string;
    };
    Papa.parse(csvFile, {
      header: true,
      complete: async (results) => {
        const data = results.data as SnippetRow[];
        try {
          for (const row of data) {
            const { factor, score, text: snippetText } = row;
            await client.models.TextSnippet.create({
              factor,
              score: Number(score),
              snippetText,
            });
          }
          await fetchTextSnippets(); 
          setShowCsvPopup(false); 
        } catch (error) {
          console.error('Failed to create snippets:', error);
        } finally {
          setIsUploading(false);
        }
      },
    });
    
  };

  // Sidebar Navigation Items
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
        { label: '📋 Snippet Bank', active: true, href: '/superadmin/snippets' },
        { label: '📦 Snippet Set', active: false, href: '/superadmin/snippets/snippetset' }
      ]
    },
    { label: '🏢 Company', active: false, href: '/superadmin' },
    { label: '📊 Analytics', active: false, href: '/analytics' },
    { label: '💬 Help', active: false, href: '/help' }
  ].filter(item => item !== undefined); 

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar navItems={navItems} />
        <div className="w-4/5 p-8">
          <h1 className="text-2xl font-semibold mb-6">Snippet Bank</h1>

          <div className="border p-4">
            <div className="flex items-center mb-4 justify-end">
              <div className="flex space-x-4">
                <button
                  onClick={() => { router.push("/superadmin/snippets/createsnippet") }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-1"
                >
                  <span>Create Text Snippet</span>
                  <span className="text-xl font-bold">+</span>
                </button>

                {/* Button to show CSV upload popup */}
                <button
                  onClick={() => setShowCsvPopup(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Create Snippets from CSV
                </button>
              </div>
            </div>

            {/* Generalized Table */}
            {tableData && tableHeaders ? (
              <Table headers={tableHeaders} data={tableData} handleClick={handleIdClick} underlineColumn='' />
            ) : (
              <p>Loading Table...</p>
            )}
          </div>
        </div>
      </div>

      {/* CSV Upload Popup */}
      {showCsvPopup && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">Upload CSV to Create Snippets</h2>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <div className="flex justify-end space-x-4 mt-4">
              <button onClick={() => setShowCsvPopup(false)} className="bg-gray-300 px-4 py-2 rounded-md">Cancel</button>
              <button onClick = {handleCsvSubmit} disabled={isUploading} className="bg-blue-600 text-white px-4 py-2 rounded-md">
            {isUploading ? 'Uploading...' : 'Upload'}
          </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminMainPage;
