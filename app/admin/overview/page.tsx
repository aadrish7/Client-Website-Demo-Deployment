"use client";
import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import Header from "@/components/superadminHeader";
import Sidebar from "@/components/superadminSidebar";
import DropdownButton from "@/components/dropDownButton";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AdminEmployeeComponent from "@/components/adminEmployeeComponent";

const PieChart = dynamic(() => import("@/components/adminPieChart"), {
  ssr: false,
  loading: () => <div className="text-center py-4">Loading Graph...</div>,
});

const BarChart = dynamic(() => import("@/components/barChartEmployee"), {
  ssr: false,
  loading: () => <div className="text-center py-4">Loading Graph...</div>,
});

Amplify.configure(outputs);
const client = generateClient<Schema>();

const OverviewPage: React.FC = () => {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams.has("surveyId")) {
      //   fetchData();
    }
  });

  const navItems = [
    {
      label: "📦 Overview",
      active: true,
      href: `/admin/overview?surveyId=${searchParams.get("surveyId")}`,
    },
    {
      label: "📊 Analytics",
      active: false,
      href: `/admin/analytics?surveyId=${searchParams.get("surveyId")}`,
    },
    {
      label: "🏢 Employees",
      active: false,
      href: `/admin/employees?surveyId=${searchParams.get("surveyId")}`,
    },
  ].filter((item) => item !== undefined);

  const employeeSatisfactionData = {
    "Very Satisfied": 40,
    Satisfied: 30,
    Neutral: 15,
    Dissatisfied: 10,
    "Very Dissatisfied": 5,
  };
  const performanceData = {
    Teamwork: 4.5,
    Communication: 3.8,
    "Problem-Solving": 4.2,
    Leadership: 4.0,
    Creativity: 3.5,
  };
  return (
    <div className="h-screen flex flex-col">
  <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
  <div className="flex flex-1">
    <Sidebar navItems={navItems} />
    <div className="w-4/5 p-3 bg-gray-50 flex flex-col">
      
      {/* Section with charts and summary paragraph */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h1 className="text-[20px] font-bold mb-6">
          Hi <span className="text-blue-500">Company A</span>! Here is your company survey summary.
        </h1>

        <div className="flex mb-6">
          {/* Pie Chart Section */}
          <div className="w-full md:w-1/2 pr-4 border-b border-r">
            <h2 className="text-sm font-semibold mb-2 flex items-center">
              % of employees rated each factor as the most important
              <span className="ml-1 text-gray-400">ⓘ</span>
            </h2>
            <div className="w-full h-96 pl-5 pt-6">
              <PieChart data={employeeSatisfactionData} />
            </div>
          </div>

          {/* Bar Chart Section */}
          <div className="w-full md:w-1/2 pl-4 border-b">
            <h2 className="text-sm font-semibold mb-2 flex items-center">
              Average score for each factor
              <span className="ml-1 text-gray-400">ⓘ</span>
            </h2>
            <div className="w-full h-96">
              <BarChart data={performanceData} />
            </div>
          </div>
        </div>

        {/* Paragraph Summary */}
        <div className="text-gray-600 text-sm">
          <p>
            Your company seems to be excelling in fostering Advocacy and Psychological Safety among employees, with Psychological Safety being the top priority for 34% of employees and Advocacy receiving the highest average score of 3.4. 
            However, despite this, Purpose has the lowest average score of 2.67, indicating a potential area for improvement. Growth Satisfaction and Alignment, both rated as most important by 20% of employees, received an average score of 3, 
            suggesting these factors are important but may need more attention to fully align with employee expectations. The company could benefit from focusing more on Purpose, Growth Satisfaction, and Alignment to better meet the overall needs and values of their workforce.
          </p>
        </div>
      </div>

      {/* Section with AdminEmployeeComponent */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <AdminEmployeeComponent />
      </div>
    </div>
  </div>
</div>

  );
};

export default OverviewPage;
