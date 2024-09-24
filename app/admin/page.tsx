'use client'
import React, { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '@/amplify/data/resource';
import { Amplify } from 'aws-amplify';
import { useRouter } from 'next/navigation';
import outputs from '@/amplify_outputs.json';
import Header from '@/components/superadminHeader'; 
import Sidebar from '@/components/superadminSidebar';
import { fetchUserAttributes } from "aws-amplify/auth";



Amplify.configure(outputs);
const client = generateClient<Schema>();

const AdminPage: React.FC = () => {
    const [companies, setCompanies] = useState<Schema['Company'][]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [surveyId, setSurveyId] = useState<string>('');
    const [allSurveyResponses, setAllSurveyResponses] = useState<any[]>([]);
    const router = useRouter();

    const fetchData = async () => {
        const userAttributes =  await fetchUserAttributes();
        console.log(userAttributes.email);
        const {data  : usersdata } =  await client.models.User.list({
            filter: {
                email: {
                    eq: userAttributes.email
                }
            }
        });
        const companyId = usersdata[0].companyId;
        const { data : company } = await client.models.Company.get({ id: companyId });
        const {data : surveys} = await client.models.Survey.list({
            filter: {
                companyId: {
                    eq: companyId
                }
            }
        });
        const survey = surveys[0];
        setSurveyId(survey.id);

        const {data :  surveyResponses} = await client.models.AverageSurveyResults.list({
            filter: {
                surveyId: {
                    eq: survey.id
                }
            }
        });
        const allSurveyResponses : any = [];
        surveyResponses.forEach((response) => {
            if (typeof response.averageScorejson === 'string') {
                const surveyResponse = JSON.parse(response.averageScorejson);
                allSurveyResponses.push(surveyResponse);
            } else {
                console.error("Invalid type for averageScorejson:", typeof response.averageScorejson);
            }
        });
        console.log("allSurveyResponses", allSurveyResponses);
        setAllSurveyResponses(allSurveyResponses);
    }

    useEffect(() => {
        fetchData();
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
     
        { label: '🏢 Company', active: false, href: '/superadmin' },
        { label: '📊 Analytics', active: true, href: '/analytics' },
        { label: '💬 Help', active: false, href: '/help' }
      ].filter(item => item !== undefined);
    
   
    return (
        <div className="h-screen flex flex-col">
          <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
          <div className="flex flex-1">
            <Sidebar navItems={navItems} />
            <div className="w-4/5 p-8">
              <h1 className="text-2xl font-semibold mb-6">Analytics</h1>
              <div className="border p-4 bg-red-300">
                <div className="flex items-center mb-4 justify-end">
 
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

export default AdminPage;