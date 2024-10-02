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

// Modal component for creating a collection
const CreateCollectionModal: React.FC<{ onClose: () => void; onCreate: () => void }> = ({ onClose, onCreate }) => {
    const [name, setName] = useState<string>('');
    const [tags, setTags] = useState<string>('');
    const [questions, setQuestions] = useState<{ factor: string; questionText: string; options: string[] | null; id: string; createdAt: string; updatedAt: string; }[]>([]);
    const [isCreating, setIsCreating] = useState<boolean>(false);
  
    useEffect(() => {
      const fetchQuestions = async () => {
        try {
          const { data: questionList } = await client.models.Question.list({});
          setQuestions(questionList.map((question) => ({
            ...question,
            options: question.options as string[] | null,
          }))); 
        } catch (error) {
          console.error('Failed to fetch questions', error);
        }
      };
  
      fetchQuestions();
    }, []);
  
    const handleSubmit = async () => {
      setIsCreating(true);
      try {
        const questionIds = questions.map((question) => question.id);
        
        await client.models.Collection.create({
          name,
          tags,
          questions: questionIds,
        });
        onCreate();  // Close modal and trigger refresh
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
              placeholder="Enter collection name"
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
              placeholder="Enter collection tags"
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
              className={`bg-blue-600 text-white px-4 py-2 rounded-md ${
                isCreating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </div>
      
    );
  };

// Main component for displaying Collections
const CollectionsPage: React.FC = () => {
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const router = useRouter();

      // Fetch collections from the Collection model
      const fetchCollections = async () => {
        try {
          const { data: collectionList } = await client.models.Collection.list({});
          setTableHeaders(() => ["name", "tags", "questions"]);
          setTableData(collectionList.map((collection) => ({
            name: collection.name || '',
            tags: collection.tags || '',
            questions: collection.questions ? collection.questions.length.toString() : '0', // Number of questions
          })));
        } catch (error) {
          console.error('Failed to fetch collections', error);
          console.error('Error:', error);
        }
      };
  useEffect(() => {
    fetchCollections();
  }, []);

  const navItems = [
    {
        label: '📦 Collections',
        active: true,
        subItems: [
          { label: '📋 Question Bank', active: false, href: '/superadmin/collections/questionbank' },
          { label: '📦 Collection', active: true, href: '/superadmin/collections/collection' }
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
  ].filter(item => item !== undefined);

  const handleModalClose = () => setIsModalOpen(false);

  const handleCollectionClick = (collectionName: string) => {
    router.push(`collection/collection-details?name=${encodeURIComponent(collectionName)}`);
  };
  

  const handleCreateCollection = () => {
    // After creating a new collection, refetch the collections and close the modal
    setIsModalOpen(false);
    // You can refetch the collections here or handle updating the state as needed
    fetchCollections();  // To refresh the table after collection creation
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar navItems={navItems} />
        {/* Main Page Content */}
        <div className="w-4/5 p-8">
          {/* Page Header */}
          <h1 className="text-2xl font-semibold mb-6">Collections</h1>

          <div className="border p-4">
            <div className="flex items-center mb-4 justify-end">
              <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-1">
                <span>Create New Collection</span>
                <span className="text-xl font-bold">+</span>
              </button>
            </div>

            {tableData && tableHeaders ? (
              <Table headers={tableHeaders} data={tableData} handleClick={handleCollectionClick} underlineColumn="name" />
            ) : (
              <p>Loading Collections...</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal for creating a new collection */}
      {isModalOpen && <CreateCollectionModal onClose={handleModalClose} onCreate={handleCreateCollection} />}
    </div>
  );
};

export default CollectionsPage;
