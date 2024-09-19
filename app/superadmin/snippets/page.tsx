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

Amplify.configure(outputs);
const client = generateClient<Schema>();

const SuperAdminMainPage: React.FC = () => {
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const router = useRouter()

  const handleIdClick = (id: string) => {
  };

  useEffect(() => {
    const fetchTextSnippets = async () => {
      try {
        const { data: textSnippetList } = await client.models.TextSnippet.list({});
        setTableHeaders(() => ['factor', 'scoreRange', 'snippetText']);
        setTableData(
          textSnippetList.map((snippet: any) => ({
            factor: snippet.factor,
            scoreRange: snippet.scoreRange,
            snippetText: snippet.snippetText,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch text snippets');
        console.error('Error:', error);
      }
    };

    fetchTextSnippets();
  }, []);

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
        { label: '📦 Snippet Set', active: false, href: '/superadmin/snippets' }
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
          <h1 className="text-2xl font-semibold mb-6">Text Snippets</h1>

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
    </div>
  );
};

export default SuperAdminMainPage;
