"use client";
import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import { useRouter } from "next/navigation";
import outputs from "@/amplify_outputs.json";
import Header from "@/components/superadminHeader";
import Sidebar from "@/components/superadminSidebar";
import Table from "@/components/table";

Amplify.configure(outputs);
const client = generateClient<Schema>();

interface CompanyForm {
  companyName: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminJobTitle: string;
}

interface CreateCompanyPageProps {
  onClose: () => void; // Define onClose prop type
}

const CreateCompanyPage: React.FC<CreateCompanyPageProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<CompanyForm>({
    companyName: "",
    adminEmail: "",
    adminFirstName: "",
    adminLastName: "",
    adminJobTitle: "",
  });

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      companyName,
      adminEmail,
      adminFirstName,
      adminLastName,
      adminJobTitle,
    } = formData;
    if (
      !companyName ||
      !adminEmail ||
      !adminFirstName ||
      !adminLastName ||
      !adminJobTitle
    ) {
      setErrorMessage("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const { data: company } = await client.models.Company.create({
        companyName,
        adminEmail,
        adminFirstName,
        adminLastName,
        adminJobTitle,
      });
      console.log("Company created:");
      const {data : usercreated } = await client.models.User.create({
        firstName : adminFirstName || "",
        lastName : adminLastName || "",
        email : adminEmail || "",
        companyId : company?.id || "",
        surveyId : "",
        role : "admin",
      })
      console.log("User created");

      setSuccessMessage("Company created successfully!");
      setErrorMessage("");
      clearForm();
      router.push("/superadmin");
      onClose(); // Close the modal after successful creation
    } catch (error) {
      setErrorMessage("An error occurred while creating the company.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      companyName: "",
      adminEmail: "",
      adminFirstName: "",
      adminLastName: "",
      adminJobTitle: "",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-10">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-7">Add a company</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-6 mt-4">
            <label className="text-sm block font-medium mb-2">
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2 w-full bg-gray-100 text-sm text-black"
              required
            />
          </div>
          <div className="mb-6 mt-4">
            <label className="text-sm block font-medium mb-2">
              Primary Admin Email
            </label>
            <input
              type="email"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2 w-full bg-gray-100 text-sm text-black"
              required
            />
          </div>
          <div className="mb-6 mt-4">
            <label className="text-sm block font-medium mb-2">
              Primary Admin First name
            </label>
            <input
              type="text"
              name="adminFirstName"
              value={formData.adminFirstName}
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2 w-full bg-gray-100 text-sm text-black"
              required
            />
          </div>
          <div className="mb-6 mt-4">
            <label className="text-sm block font-medium mb-2">
              Primary Admin Last name
            </label>
            <input
              type="text"
              name="adminLastName"
              value={formData.adminLastName}
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2 w-full bg-gray-100 text-sm text-black"
              required
            />
          </div>
          <div className="mb-6 mt-4">
            <label className="text-sm block font-medium mb-2">
              Primary Admin Job Title
            </label>
            <input
              type="text"
              name="adminJobTitle"
              value={formData.adminJobTitle}
              onChange={handleInputChange}
              className="border border-gray-300 rounded p-2 w-full bg-gray-100 text-sm text-black"
              required
            />
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onClose} // Use onClose here
              className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
              disabled={loading}
            >
              {loading ? "Creating Company..." : "Create Company"}
            </button>
          </div>
        </form>
        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
        {successMessage && <p className="text-black mt-4">{successMessage}</p>}
      </div>
    </div>
  );
};

const SuperAdminMainPage: React.FC = () => {
  const [popUp, setPopUp] = useState<boolean>(false);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const router = useRouter();

  const handleIdClick = (id: string) => {
    router.push(`superadmin/surveys?companyName=${id}`);
  };

  const fetchCompanies = async () => {
    try {
      const { data: companyList } = await client.models.Company.list({});
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

    { label: "🏢 Company", active: true, href: "/superadmin" },
    { label: "📊 Analytics", active: false, href: "/analytics" },
  ].filter((item) => item !== undefined);

  const handleClosePopUp = () => {
    setPopUp(false);
    fetchCompanies();
  };

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
                  onClick={() => {
                    setPopUp(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-1"
                >
                  <span>Add Company</span>
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
      {popUp && <CreateCompanyPage onClose={handleClosePopUp} />}
    </div>
  );
};

export default SuperAdminMainPage;
