'use client'
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
  const router = useRouter();

  const handleIdClick = (id: string) => {
    router.push(`superadmin/surveys?companyName=${id}`);
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data: companyList } = await client.models.Company.list({});
        setTableHeaders(() => ['companyName', 'adminEmail']);
        setTableData(
          companyList.map((collection: any) => ({
            companyName: collection.companyName,
            adminEmail: collection.adminEmail,
          }))
        );
      } catch (error) {
        console.error('Failed to fetch collections');
        console.error('Error:', error);
      }
    };

    fetchCompanies();
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
      active: false,
      subItems: [
        { label: '📋 Snippet Bank', active: false, href: '/superadmin/snippets' },
        { label: '📦 Snippet Set', active: false, href: '/superadmin/snippets/snippetset' }
      ]
    },
 
    { label: '🏢 Company', active: true, href: '/superadmin' },
    { label: '📊 Analytics', active: false, href: '/analytics' },
    { label: '💬 Help', active: false, href: '/help' }
  ].filter(item => item !== undefined); 

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar navItems={navItems} />
        <div className="w-4/5 p-8">
          <h1 className="text-2xl font-semibold mb-6">Companies</h1>
          <div className="border p-4">
            <div className="flex items-center mb-4 justify-end">
              <div className="flex space-x-4">
                <button
                  onClick={()=>{router.push("/superadmin/createcompany")}}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-1"
                >
                  <span>Create Company Manually</span>
                  <span className="text-xl font-bold">+</span>
                </button>
                {/* <button
                  onClick={goToCSVCreation}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-1"
                >
                  Create Company CSV
                </button> */}
              </div>
            </div>

            {/* Generalized Table */}
            {tableData && tableHeaders ? (
              <Table headers={tableHeaders} data={tableData} handleClick={handleIdClick} underlineColumn='companyname' />
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
