"use client";
import React, { useState, useEffect, Suspense } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import { useRouter } from "next/navigation";
import outputs from "@/amplify_outputs.json";
import Header from "@/components/superadminHeader";
import Sidebar from "@/components/superadminSidebar";
import Table from "@/components/table";
import Breadcrumb from "@/components/breadCrumb";

Amplify.configure(outputs);
const client = generateClient<Schema>();

const Analytics = () => {

    const [popUp, setPopUp] = useState<boolean>(false);
    const [tableHeaders, setTableHeaders] = useState<string[]>([]);
    const [tableData, setTableData] = useState<Record<string, string>[]>([]);
    const [companies, setCompanies] = useState<any>([]);
    const router = useRouter();
  
    const handleIdClick = async (id: string) => {


      for (const company of companies) {
        if (company.companyName === id) {
            id  =  company.id;
            break;
        }
        }
      router.push(`analytics/listofsurveys?companyId=${id}`);
    };
  
    const fetchCompanies = async () => {
      try {
        const { data: companyList } = await client.models.Company.list({});
        setCompanies(()=>companyList);
        setTableHeaders(() => ["company name", "admin email"]);
        setTableData(
          companyList.map((collection: any) => ({
            "company name" : collection.companyName,
            "admin email": collection.adminEmail,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch collections");
        console.error("Error:", error);
      }
    };
  
    useEffect(() => {
      fetchCompanies();
    }, []);
  
    const navItems = [
      {
        label: "📦 Collections",
        active: false,
        subItems: [
          {
            label: "📋 Question Bank",
            active: false,
            href: "/superadmin/collections/questionbank",
          },
          {
            label: "📦 Collection",
            active: false,
            href: "/superadmin/collections/collection",
          },
        ],
      },
      {
        label: "📦 Snippets",
        active: false,
        subItems: [
          {
            label: "📋 Snippet Bank",
            active: false,
            href: "/superadmin/snippets",
          },
          {
            label: "📦 Snippet Set",
            active: false,
            href: "/superadmin/snippets/snippetset",
          },
        ],
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
  
      { label: "🏢 Company", active: false, href: "/superadmin" },
      { label: "📊 Analytics", active: true, href: "/superadmin/analytics" },
    ].filter((item) => item !== undefined);
  
    const handleClosePopUp = () => {
      setPopUp(false);
      fetchCompanies();
    };
  
    return (
      <div className="h-screen flex flex-col">
        <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
        <div className="flex flex-1">
          <Sidebar activePath="/superadmin/analytics" />
          <div className="w-4/5 p-8">
            <Breadcrumb />
            <h1 className="text-2xl font-semibold mb-6">Companies</h1>
            <div className="border p-4">
              <div className="flex items-center mb-4 justify-end">
                <div className="flex space-x-4">
                </div>
              </div>
  
              {/* Generalized Table */}
              {tableData && tableHeaders ? (
                <Table
                  headers={tableHeaders}
                  data={tableData}
                  handleClick={handleIdClick}
                  underlineColumn="company name"
                />
              ) : (
                <p>Loading Table...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
}


export default function(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Analytics />
    </Suspense>
  )
}