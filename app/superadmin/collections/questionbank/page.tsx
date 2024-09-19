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

Amplify.configure(outputs);
const client = generateClient<Schema>();

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

  const fetchQuestions = async () => {
    try {
      const { userId } = await getCurrentUser();
      const { data: questionList } = await client.models.Question.list({});
      setTableHeaders(() => ["factor", "questionText", "options"]);
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
      label: '📦 Snippets',
      active: false,
      subItems: [
        { label: '📋 Snippet Bank', active: false, href: '/superadmin/snippets' },
        { label: '📦 Snippet Set', active: false, href: '/superadmin/snippets' }
      ]
    },
    {
      label: '📦 Collections',
      active: true,
      subItems: [
        { label: '📋 Question Bank', active: true, href: '/superadmin/collections/questionbank' },
        { label: '📦 Collection', active: false, href: '/superadmin/collections/collection' }
      ]
    },
    { label: '🏢 Company', active: false, href: '/superadmin' },
    { label: '📊 Analytics', active: false, href: '/analytics' },
    { label: '💬 Help', active: false, href: '/help' }
  ].filter(item => item !== undefined);

  const handleModalClose = () => setIsModalOpen(false);

  const handleCreateQuestion = () => {
    // After creating a new question, refetch the questions and close the modal
    setIsModalOpen(false);
    // We can refetch the questions here or handle updating the state as needed
    fetchQuestions();  // To refresh the table after question creation
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
    </div>
  );
};

export default QuestionsPage;
