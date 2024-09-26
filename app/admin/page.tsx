"use client";

import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import { useRouter } from "next/navigation";
import outputs from "@/amplify_outputs.json";
import Header from "@/components/superadminHeader";
import { fetchUserAttributes } from "aws-amplify/auth";
import { data } from "../../amplify/data/resource";
import  Table  from "@/components/table";

Amplify.configure(outputs);
const client = generateClient<Schema>();

const AdminPage: React.FC = () => {
  const router = useRouter();
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [surveyId, setSurveyId] = useState<string>("");

  const fetchData = async () => {
    const userAttributes = await fetchUserAttributes();
    const { data: usersdata } = await client.models.User.list({
      filter: {
        email: {
          eq: userAttributes.email,
        },
      },
    });
    if (usersdata.length === 0) {
      console.error("No user found with email:", userAttributes.email);
      return;
    }
    const companyId = usersdata[0].companyId;
    const { data: surveys } = await client.models.Survey.list({
      filter: {
        companyId: {
          eq: companyId,
        },
      },
    });
    if (surveys.length === 0) {
      console.error("No surveys found for company:", companyId);
      return;
    }
    
    console.log("surveys", surveys);
    setTableHeaders(["surveyName", "start"]);
    setTableData(
      surveys.map((survey) => ({
        surveyName: survey?.surveyName || "",
        start: survey?.start === true ? "started" : "ended",
      }))
    );    
  };

  useEffect(() => {
    fetchData();
  }, []);

  const categories = [
    "Psychological Safety",
    "Growth Satisfaction",
    "Purpose",
    "Advocacy",
    "Alignment",
  ];
  const handleTableClick = async (surveyName: string) => {
    const {data : surveyData} = await client.models.Survey.list({
      filter: {
        surveyName: {
          eq: surveyName,
        },
      },
    });
    router.push(`/admin/analytics?surveyId=${surveyData[0].id}`);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        
        <div className="w-full p-8 bg-gray-50">
          <h1 className="text-2xl font-semibold mb-6">Select Survey</h1>
          <div className="border p-4">
            <Table headers={tableHeaders} data={tableData} underlineColumn="surveyName" handleClick={handleTableClick}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
