'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '@/amplify/data/resource';
import outputs from '@/amplify_outputs.json';
import { Amplify } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { identifyUser } from 'aws-amplify/analytics';

Amplify.configure(outputs);
const client = generateClient<Schema>();

interface Question{
    questionNumber: number;
    factor: string;
    questionText: string;
    options: string[];
    };

    interface HeaderProps {
        userName: string;
        userEmail: string;
      }
      
      interface SidebarProps {
        navItems: NavItem[];
      }
      
      interface NavItem {
        label: string;
        active: boolean;
      }
      
      interface TableProps {
        headers: string[];
        data: Record<string, string>[];
      }

// Header Component
const Header: React.FC<HeaderProps> = ({ userName, userEmail }) => {
    return (
      <div className="w-full bg-white shadow-md p-6">
        <div className="flex flex-col items-end text-gray-600 space-y-2">
          <span className="font-bold">{userName}</span>
          <span>{userEmail}</span>
        </div>
      </div>
    );
  };
  
  // Sidebar (Navigation) Component
  const Sidebar: React.FC<SidebarProps> = ({ navItems }) => {
    return (
      <div className="w-1/5 bg-gray-50 p-6">
        <ul className="space-y-6 text-gray-800">
          {navItems.map((item, index) => (
            <li key={index} className={item.active ? 'font-bold text-blue-600' : ''}>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Table Component (Generalized)
  const Table: React.FC<TableProps> = ({ headers, data }) => {
    const router = useRouter();
  
    const handleIdClick = (id: string) => {
      router.push(`admin/collectiondetails?id=${id}`);
    };
  
    return (
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="min-w-full bg-white divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
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
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {headers.map((header, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                      header.toLowerCase() === 'id' ? 'underline cursor-pointer' : ''
                    }`}
                    onClick={() => {
                      if (header.toLowerCase() === 'id') {
                        handleIdClick(row[header].replace(/\s+/g, '_'));
                      }
                    }}
                  >
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

function DetailsPage() {

  const searchParams = useSearchParams();
  const [id, setId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const router = useRouter();
  const navItems: NavItem[] = [
    { label: 'Question Bank', active: false },
    { label: 'Collections', active: true },
    { label: 'Company', active: false },
    { label: 'Analytics', active: false },
    { label: 'Help', active: false },
  ];

  const goToManualCreation = () => {
    router.push('/admin/manualcollection');
  };

  const goToCSVCreation = () => {
    router.push('/admin/csvcollection');
  };


  useEffect(() => {
    const getQuestions = async (id: string) => {
      const {data : collections} = await client.models.Collection.list({
        filter : {
          name : {eq : id}
        }
      })
      const collection = collections[0]
        const { data: allquestions  } = await client.models.Question.list({
            filter: {
                collectionId: { eq: collection.id },
            },
        });
       setQuestions(allquestions.map((question : any) => ({  
            questionNumber: question.questionNumber,
            factor: question.factor,
            questionText: question.questionText,
            options: question.options,
        })));
        setTableHeaders(['Question Number', 'Factor', 'Question Text', 'Options']);
        //sort allquestions by factor and then by question number
        allquestions.sort((a: any, b: any) => {
            if (a.factor < b.factor) {
                return -1;
            }
            if (a.factor > b.factor) {
                return 1;
            }
            return a.questionNumber - b.questionNumber;
        });
        setTableData(allquestions.map((question : any) => ({
            'Question Number': question.questionNumber,
            'Factor': question.factor,
            'Question Text': question.questionText,
            'Options': question.options.join(', '),
        })));
    }

    const idFromUrl = searchParams.get('id');
    setId(idFromUrl);
    if (idFromUrl) {
        getQuestions(idFromUrl);

    }
  }, [searchParams]);

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
        {/* Question Bank Header */}
        <h1 className="text-2xl font-semibold mb-6">Collections</h1>

        <div className='border p-4'>
        <div className="flex items-center mb-4 justify-end">
          <div className="flex space-x-4">
            <button onClick = {goToManualCreation} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-1">
              <span>Create Collection Manually</span>
              <span className="text-xl font-bold">+</span>
            </button>
            <button onClick={goToCSVCreation} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-1">
              Create Collection CSV
            </button>
          </div>
        </div>

        {/* Generalized Table */}
        {tableData && tableHeaders?<Table headers={tableHeaders} data={tableData} />:<p>Loading Table...</p>}
      </div>

      </div>
    </div>
  </div>
);
}

export default function ConfirmSignUpPage() {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <DetailsPage />
      </Suspense>
    );
  }