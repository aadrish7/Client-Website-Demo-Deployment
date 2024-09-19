"use client";
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '@/amplify/data/resource';
import { getCurrentUser } from 'aws-amplify/auth';
import outputs from '@/amplify_outputs.json';
import { Amplify } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import Header from '@/components/superadminHeader'; 
import Sidebar from '@/components/superadminSidebar';
import Table from '@/components/table';
import Papa from "papaparse";   

Amplify.configure(outputs);
const client = generateClient<Schema>();

const CSVUploadModal: React.FC<{ onClose: () => void; onUpload: (data: Map<string, string[]>) => Promise<void> }> = ({ onClose, onUpload }) => {
  const [parsedData, setParsedData] = useState<Map<string, string[]> | null>(null);
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

  const groupQuestionsByFactor = (data: { Factor: string; Questions: string }[]): Map<string, string[]> => {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Upload Questions CSV</h2>
        <input type="file" accept=".csv" onChange={handleFileUpload} className="mb-4" disabled={isCreating} />
        
        <div className="flex justify-end mt-4">
          <button 
            onClick={onClose} 
            className="bg-gray-400 text-white px-4 py-2 rounded-md mr-2"
            disabled={isCreating}
          >
            Cancel
          </button>
          {parsedData && (
            <button 
              onClick={handleCreate} 
              className={`bg-green-600 text-white px-4 py-2 rounded-md ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
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
// Modal component for creating a question
const CreateQuestionModal: React.FC<{ onClose: () => void; onCreate: () => void }> = ({ onClose, onCreate }) => {
  const [factor, setFactor] = useState<string>('');
  const [questionText, setQuestionText] = useState<string>('');

  const factorOptions = ['Advocacy', 'Psychological Safety', 'Flexibility', 'Growth Satisfaction', 'Purpose'];

  const handleSubmit = async () => {
    try {
      await client.models.Question.create({
        factor,
        questionText,
        options: ['1', '2', '3', '4', '5'] 
      });
      onCreate();  // Close modal and trigger refresh
    } catch (error) {
      console.error('Failed to create question', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Question</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Factor</label>
          <select
            className="border rounded p-2 w-full"
            value={factor}
            onChange={(e) => setFactor(e.target.value)}
          >
            <option value="">Select a factor</option>
            {factorOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Question Text</label>
          <textarea
            className="border rounded p-2 w-full"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Enter question text"
          />
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded-md mr-2">
            Cancel
          </button>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded-md">
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
// Main component for displaying Questions
const QuestionsPage: React.FC = () => {
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState<boolean>(false);

  const fetchQuestions = async () => {
    try {
      const { userId } = await getCurrentUser();
      const { data: questionList } = await client.models.Question.list({});
      setTableHeaders(() => ["factor", "questionText"]);
      setTableData(questionList.map((question) => ({
        factor: question.factor || '',
        questionText: question.questionText || '',
        options: question.options ? question.options.join(', ') : 'None',
      })));
    } catch (error) {
      console.error('Failed to fetch questions');
      console.error('Error:', error);
    }
  };


  useEffect(() => {
    fetchQuestions();
  }, []);

  const navItems = [
    {
      label: '📦 Collections',
      active: true,
      subItems: [
        { label: '📋 Question Bank', active: true, href: '/superadmin/collections/questionbank' },
        { label: '📦 Collection', active: false, href: '/superadmin/collections/collection' }
      ]
    },
    {
      label: '📦 Snippets',
      active: false,
      subItems: [
        { label: '📋 Snippet Bank', active: false, href: '/superadmin/snippets' },
        { label: '📦 Snippet Set', active: false, href: '/superadmin/snippets' }
      ]
    },
    { label: '🏢 Company', active: false, href: '/superadmin' },
    { label: '📊 Analytics', active: false, href: '/analytics' },
    { label: '💬 Help', active: false, href: '/help' }
  ].filter(item => item !== undefined);

  const handleModalClose = () => setIsModalOpen(false);
  const handleCSVModalClose = () => setIsCSVModalOpen(false);

  const handleCreateQuestion = () => {
    // After creating a new question, refetch the questions and close the modal
    setIsModalOpen(false);
    // We can refetch the questions here or handle updating the state as needed
    fetchQuestions();  // To refresh the table after question creation
  };

  const handleCSVUpload = async (groupedQuestions: Map<string, string[]>) => {
    try {
      // Convert Map to an array of entries for iteration
      for (const [factor, questions] of Array.from(groupedQuestions.entries())) {
        for (const questionText of questions) {
          await client.models.Question.create({
            factor,
            questionText,
            options: ['1', '2', '3', '4', '5']
          });
        }
      }
      fetchQuestions();
      setIsCSVModalOpen(false);
    } catch (error) {
      console.error('Failed to create questions from CSV', error);
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
              <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-1">
                <span>Create New Question</span>
                <span className="text-xl font-bold">+</span>
              </button>
              <button onClick={() => setIsCSVModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-1 ml-2">
                <span>Upload CSV Question</span>
              </button>
            </div>

            {tableData && tableHeaders ? (
              <Table headers={tableHeaders} data={tableData} handleClick={() => {}} underlineColumn="" />
            ) : (
              <p>Loading Questions...</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal for creating a new question */}
      {isModalOpen && <CreateQuestionModal onClose={handleModalClose} onCreate={handleCreateQuestion} />}
      {isCSVModalOpen && <CSVUploadModal onClose={handleCSVModalClose} onUpload={handleCSVUpload} />}
    </div>
    
  );
};

export default QuestionsPage;
