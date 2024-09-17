"use client";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import outputs from "@/amplify_outputs.json";
import { Amplify } from "aws-amplify";
import Papa from "papaparse";
import { useSearchParams } from "next/navigation";
import { useRouter } from 'next/navigation';
import { Suspense } from "react";

Amplify.configure(outputs);
const client = generateClient<Schema>();
interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  dob?: string;
  hireDate?: string;
  gender?: string;
  ethnicity?: string;
  manager?: string;
  location?: string;
  veteranStatus?: string;
  disabilityStatus?: string;
  jobLevel?: string;
  department?: string;
  companyName: string;
  companyId: string;
}

const EmployeesCsvUploader: React.FC = () => {
  const searchParams = useSearchParams();
  const [id, setId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter()


  useLayoutEffect(()=>{
    async function getIDofCompany(){
        const idFromUrl = searchParams.get("id");
        setId(idFromUrl);
        if (idFromUrl) {
            const {data : companies} = await client.models.Company.list({
                filter: { companyName: { eq: idFromUrl } }
            });
            const company = companies[0]
            setCompanyId(company.id)
        }
    }
    getIDofCompany()
  }, [searchParams])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        const parsedData: UserData[] = results.data.map((row: any) => ({
          firstName: row["First Name"],
          lastName: row["Last Name"],
          email: row["Email"],
          dob: row["DOB"],
          hireDate: row["Hire Date"],
          gender: row["Gender"],
          ethnicity: row["Ethnicity"],
          manager: row["Manager/Supervisor"],
          location: row["Location"],
          veteranStatus: row["Veteran Status"],
          disabilityStatus: row["Disability Status"],
          jobLevel: row["Job Level"],
          department: row["Department"],
          companyName: id || "",
          companyId: companyId || "", 
        }));
        setUsers(parsedData);
      },
      error: function (error) {
        setErrorMessage("Error parsing CSV file: " + error.message);
      },
    });
  };

  const createUserCollections = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      for (const user of users) {
        await client.models.User.create({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          dob: user.dob,
          hireDate: user.hireDate,
          gender: user.gender,
          ethnicity: user.ethnicity,
          manager: user.manager,
          location: user.location,
          veteranStatus: user.veteranStatus,
          disabilityStatus: user.disabilityStatus,
          jobLevel: user.jobLevel,
          department: user.department,
          companyName: user.companyName,
          companyId: user.companyId,
          role: "employee",
        });
      }
      setSuccessMessage("Users successfully created!");
      router.push(`/superadmin/getcompanyemployees?id=${searchParams.get("id")}`)
    
    } catch (error: any) {
      setErrorMessage("Error creating users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Upload User CSV</h1>
      <div className="mb-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="w-full px-4 py-2 border rounded-lg"
        />
      </div>
      {users.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">Parsed Users</h2>
          <ul className="list-disc ml-5">
            {users.map((user, index) => (
              <li key={index} className="mb-4 border-b pb-2">
                <div>
                  <strong>First Name:</strong> {user.firstName}
                </div>
                <div>
                  <strong>Last Name:</strong> {user.lastName}
                </div>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>Date of Birth:</strong> {user.dob || "N/A"}
                </div>
                <div>
                  <strong>Hire Date:</strong> {user.hireDate || "N/A"}
                </div>
                <div>
                  <strong>Gender:</strong> {user.gender || "N/A"}
                </div>
                <div>
                  <strong>Ethnicity:</strong> {user.ethnicity || "N/A"}
                </div>
                <div>
                  <strong>Manager/Supervisor:</strong> {user.manager || "N/A"}
                </div>
                <div>
                  <strong>Location:</strong> {user.location || "N/A"}
                </div>
                <div>
                  <strong>Veteran Status:</strong> {user.veteranStatus || "N/A"}
                </div>
                <div>
                  <strong>Disability Status:</strong>{" "}
                  {user.disabilityStatus || "N/A"}
                </div>
                <div>
                  <strong>Job Level:</strong> {user.jobLevel || "N/A"}
                </div>
                <div>
                  <strong>Department:</strong> {user.department || "N/A"}
                </div>
                <div>
                  <strong>Company Name:</strong> {user.companyName}
                </div>
                <div>
                  <strong>Company ID:</strong> {user.companyId}
                </div>
              </li>
            ))}
          </ul>

          <button
            onClick={createUserCollections}
            className="mt-4 bg-indigo-500 text-white py-2 px-4 rounded-lg hover:bg-indigo-600 transition duration-200"
            disabled={loading}
          >
            {loading ? "Creating Collection..." : "Create User Collections"}
          </button>
        </div>
      )}

      {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
      {successMessage && (
        <p className="text-green-500 mt-4">{successMessage}</p>
      )}
    </div>
  );
};

export default function () {
    return (
      <Suspense fallback={<div>Loading...</div>}>
        < EmployeesCsvUploader/>
      </Suspense>
    );
  }
