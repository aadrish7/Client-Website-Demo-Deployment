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
interface CreateTextSnippetProps {
  onClose: () => void;
}

const CreateTextSnippet: React.FC<CreateTextSnippetProps> = ({ onClose }) => {
  const [factor, setFactor] = useState<string>(''); 
  const [score, setScore] = useState<string>(''); 
  const [snippetText, setSnippetText] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Added loading state

  const router = useRouter();

  const factors = ['Advocacy', 'Psychological Safety', 'Flexibility', 'Growth Satisfaction', 'Purpose'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true); // Start loading when form is submitted

    try {
      if (!factor || !score || !snippetText) {
        setErrorMessage('All fields are required.');
        setLoading(false); // Stop loading on error
        return;
      }

      await client.models.TextSnippet.create({
        factor,
        score: Number(score),
        snippetText,
      });

      setFactor('');
      setScore('');
      setSnippetText('');
      setSuccessMessage('Text Snippet created successfully!');
      
      setLoading(false); // Stop loading after success
      onClose(); // Call onClose after successful creation
    } catch (error) {
      console.error('Failed to create text snippet', error);
      setErrorMessage('Failed to create text snippet. Please try again.');
      setLoading(false); // Stop loading on error
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
              <option value="" disabled>Select a factor</option>
              {factors.map((item, index) => (
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
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2">
            Cancel
          </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
              disabled={loading} // Disable button while loading
            >
              {loading ? 'Creating...' : 'Create Text Snippet'}
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
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [showCsvPopup, setShowCsvPopup] = useState(false);  // State to handle popup visibility
  const [showManualCreationPopup, setShowManualCreationPopup] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null); // State to store uploaded CSV file
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter()

  const handleIdClick = (id: string) => {
  };
  const fetchTextSnippets = async () => {
    try {
      const { data: textSnippetList } = await client.models.TextSnippet.list({});
      setTableHeaders(() => ['factor', 'score', 'snippet text']);
      setTableData(
        textSnippetList.map((snippet: any) => ({
          factor: snippet.factor,
          score: snippet.score,
          "snippet text": snippet.snippetText,
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
  const onClose = () => {
    setShowManualCreationPopup(false);
    fetchTextSnippets(); // Call fetchQuestions after closing the modal
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
                  onClick={()=> setShowManualCreationPopup(true)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-10">
        <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
          <h2 className="text-lg font-semibold mb-7">Upload CSV to Create Snippets</h2>
          
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
              className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2">
              Cancel
            </button>
            <button 
              onClick={handleCsvSubmit} 
              disabled={isUploading} 
              className="bg-blue-600 text-white px-4 py-2 rounded-md">
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
      
      )}
      {showManualCreationPopup && (<CreateTextSnippet onClose={onClose}/>)}
    </div>
  );
};

export default SuperAdminMainPage;
