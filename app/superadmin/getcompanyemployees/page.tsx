"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { Amplify } from "aws-amplify";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import Employee from "../../employee/page";
import Header from "@/components/superadminHeader";
import Sidebar from "@/components/superadminSidebar";
import Table from "@/components/table";

Amplify.configure(outputs);
const client = generateClient<Schema>();

interface Employee {
  firstName: string;
  lastName: string;
  email: string;
  dob: Date;
}

interface NavItem {
  label: string;
  active: boolean;
}

function GetEmployeesOfCompanyPage() {
  const searchParams = useSearchParams();
  const [id, setId] = useState<string | null>(null);
  const [questions, setEmployees] = useState<Employee[]>([]);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const router = useRouter();
  const navItems: NavItem[] = [
    { label: "Question Bank", active: false },
    { label: "Collections", active: true },
    { label: "Company", active: false },
    { label: "Analytics", active: false },
    { label: "Help", active: false },
  ];

  useEffect(() => {
    const getEmployees = async (id: string) => {
      const { data: companies } = await client.models.Company.list({
        filter: {
          companyName: { eq: id },
        },
      });

      const company = companies[0];
      const { data: allemployees } = await client.models.User.list({
        filter : {
          companyName : {eq : searchParams.get("id") || undefined }
        }
      });
      console.log("all employees ", allemployees)
      setEmployees(
        allemployees.map((employee: any) => ({
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          dob: new Date(employee.dob),
        }))
      );
      setTableHeaders(["firstName", "lastName", "email", "dob"]);
      setTableData(
        allemployees.map((question: any) => ({
          firstName: question.firstName,
          lastName: question.lastName,
          email: question.email,
          dob: question.dob,
        }))
      );
    };

    const idFromUrl = searchParams.get("id");
    setId(idFromUrl);
    if (idFromUrl) {
      getEmployees(idFromUrl);
    }
  }, [searchParams]);



  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar navItems={navItems} />
        <div className="w-4/5 p-8">
          <h1 className="text-2xl font-semibold mb-6">Employees</h1>

          <div className="border p-4">
            <div className="flex items-center mb-4 justify-end">
              <div className="flex space-x-4">
                <button
                  onClick={() => { router.push(`/superadmin/createemployee?id=${searchParams.get("id")}`) }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-1"
                >
                  <span>Add Employee CSV</span>
                  <span className="text-xl font-bold">+</span>
                </button>
                {/* <button
                  onClick={goToCSVCreation}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-1"
                >
                  Add Employee CSV
                </button> */}
              </div>
            </div>

            {tableData && tableHeaders ? (
              <Table headers={tableHeaders} data={tableData} underlineColumn="" handleClick={()=>{}} />
            ) : (
              <p>Loading Table...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function () {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GetEmployeesOfCompanyPage />
    </Suspense>
  );
}
