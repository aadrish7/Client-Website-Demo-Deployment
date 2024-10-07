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
import Breadcrumb from '@/components/normalBreadCrumb';

Amplify.configure(outputs);
const client = generateClient<Schema>();
type Nullable<T> = T | null;

const CollectionDetailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const collectionName = searchParams.get('name') || '';
  const [tableHeaders, setTableHeaders] = useState<string[]>(["factor", "questionText"]);
  const [questions, setQuestions] = useState<
    { disabled: boolean; factor: string; questionText: string; options: Nullable<string>[] | null; readonly id: string; readonly createdAt: string; readonly updatedAt: string; }[]
  >([]);
  const [collection, setCollection] = useState<{ name: string; tags: string; questions: string[] } | null>(null);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(true); // New loading state

  useEffect(() => {
    if (collectionName) {
      const fetchCollection = async () => {
        try {
          const { data: collections } = await client.models.Collection.list({
            filter: { name: { eq: collectionName } },
          });

          const selectedCollection = collections[0];

          if (selectedCollection) {
            setCollection({
              name: selectedCollection.name || '',
              tags: selectedCollection.tags || '',
              questions: selectedCollection.questions ? selectedCollection.questions.filter((q): q is string => q !== null) : [],
            });

            const questionIds = selectedCollection.questions?.filter((id): id is string => id !== null) || [];
            const fetchedQuestions = await Promise.all(
              questionIds.map(async (id) => {
                const { data: question } = await client.models.Question.get({ id });
                return question;
              })
            );

            const validQuestions = fetchedQuestions.filter((q): q is {
              disabled: boolean;
              factor: string;
              questionText: string;
              options: Nullable<string>[] | null;
              readonly id: string;
              readonly createdAt: string;
              readonly updatedAt: string;
            } => q !== null && !q.disabled);
            
            setQuestions(validQuestions);
          }
        } catch (error) {
          console.error('Failed to fetch collection details', error);
        } finally {
          setLoadingQuestions(false); // Mark loading as false after fetching is done
        }
      };

      fetchCollection();
    }
  }, [collectionName]);

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar activePath={"/superadmin/collections/collection"} />
        <div className="w-4/5 p-8">
          <Breadcrumb/>
          <h1 className="text-2xl font-semibold mb-6">{collection ? collection.name : 'Loading...'}</h1>

          <div className="border p-4">
            {collection ? (
              <>
                <h2 className="text-lg mb-4 font-semibold"> Tags: {collection.tags}</h2>
                {loadingQuestions ? (
                  <p>Loading questions...</p> // Loading state for questions
                ) : questions.length > 0 ? (
                  <Table
                    headers={tableHeaders}
                    data={questions.map(({ factor, questionText, id, createdAt, updatedAt }) => ({
                      factor,
                      questionText,
                      id,
                      createdAt,
                      updatedAt,
                    }))}
                    handleClick={() => {}}
                    underlineColumn=""
                  />
                ) : (
                  <p>No questions available.</p>
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
