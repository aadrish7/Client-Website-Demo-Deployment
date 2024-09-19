"use client";
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '@/amplify/data/resource';
import { useRouter, useSearchParams } from 'next/navigation';
import outputs from '@/amplify_outputs.json';
import { Amplify } from 'aws-amplify';
import Header from '@/components/superadminHeader'; 
import Sidebar from '@/components/superadminSidebar';
import Table from '@/components/table';   
import { Suspense } from "react"; 

Amplify.configure(outputs);
const client = generateClient<Schema>();
type Nullable<T> = T | null;

const CollectionDetailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get collection name from URL params
  const collectionName = searchParams.get('name') || '';
  const [tableHeaders, setTableHeaders] = useState<string[]>(["factor", "questionText"]);
  const [questions, setQuestions] = useState<
    { factor: string; questionText: string; options: Nullable<string>[] | null; readonly id: string; readonly createdAt: string; readonly updatedAt: string; }[]
  >([]); // Updated type definition

  const [collection, setCollection] = useState<{ name: string; tags: string; questions: string[] } | null>(null);

  useEffect(() => {
    if (collectionName) {
      // Fetch collection by name
      const fetchCollection = async () => {
        try {
          const { data: collections } = await client.models.Collection.list({
            filter: { name: { eq: collectionName } }, // Updated filter
          });

          const selectedCollection = collections[0]; // Assuming collection name is unique

          if (selectedCollection) {
            setCollection({
              name: selectedCollection.name || '',
              tags: selectedCollection.tags || '',
              questions: selectedCollection.questions ? selectedCollection.questions.filter((q): q is string => q !== null) : [], // Added null check
            });

            // Fetch questions by their IDs
            const questionIds = selectedCollection.questions?.filter((id): id is string => id !== null) || []; // Ensure questionIds is an array of strings
            const fetchedQuestions = await Promise.all(
              questionIds.map(async (id) => {
                const { data: question } = await client.models.Question.get({ id }); // Changed 'read' to 'get'
                return question;
              })
            );

            // Filter out null values
            const validQuestions = fetchedQuestions.filter((q): q is { factor: string; questionText: string; options: Nullable<string>[] | null; readonly id: string; readonly createdAt: string; readonly updatedAt: string; } => q !== null); // Updated type guard
            setQuestions(validQuestions);
          }
        } catch (error) {
          console.error('Failed to fetch collection details', error);
        }
      };

      fetchCollection();
    }
  }, [collectionName]);

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
        { label: '📦 Snippet Set', active: false, href: '/superadmin/snippets' }
      ]
    },
    { label: '🏢 Company', active: false, href: '/superadmin' },
    { label: '📊 Analytics', active: false, href: '/analytics' },
    { label: '💬 Help', active: false, href: '/help' }
  ].filter(item => item !== undefined);

 

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
        <h1 className="text-2xl font-semibold mb-6">{collection ? collection.name : 'Loading...'}</h1>

        <div className="border p-4">
          {collection ? (
            <>
              <h2 className="text-lg mb-4 font-semibold"> Tags: {collection.tags}</h2>
              {questions.length > 0 ? (
                <Table
                  headers={tableHeaders}
                  data={questions.map(({ factor, questionText, id, createdAt, updatedAt }) => ({
                    factor,
                    questionText,
                    id,
                    createdAt,
                    updatedAt,
                  }))} // Transforming questions to match Record<string, string>[]
                  handleClick={() => {}}
                  underlineColumn=""
                />
              ) : (
                <p></p>
              )}
            </>
          ) : (
            <p>Loading collection details...</p>
          )}
        </div>
      </div>
    </div>
  </div>
);
};


export default function () {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <CollectionDetailPage />
      </Suspense>
    );
  }