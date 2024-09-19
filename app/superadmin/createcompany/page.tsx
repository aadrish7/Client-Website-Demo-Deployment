"use client";

import React, { useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '@/amplify/data/resource';
import outputs from '@/amplify_outputs.json';
import { Amplify } from 'aws-amplify';
import { useRouter } from 'next/navigation';

Amplify.configure(outputs);
const client = generateClient<Schema>();

interface CompanyForm {
  companyName: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminJobTitle: string;
}

const CreateCompanyPage: React.FC = () => {
  const [formData, setFormData] = useState<CompanyForm>({
    companyName: '',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
    adminJobTitle: '',
  });

  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); 
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { companyName, adminEmail, adminFirstName, adminLastName, adminJobTitle } = formData;
    if (!companyName || !adminEmail || !adminFirstName || !adminLastName || !adminJobTitle) {
      setErrorMessage('All fields are required.');
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

      setSuccessMessage('Company created successfully!');
      setErrorMessage('');
      clearForm();
      router.push('/superadmin');
    } catch (error) {
      setErrorMessage('An error occurred while creating the company.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({
      companyName: '',
      adminEmail: '',
      adminFirstName: '',
      adminLastName: '',
      adminJobTitle: '',
    });
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Create a New Company</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Company Name:</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Admin Email:</label>
            <input
              type="email"
              name="adminEmail"
              value={formData.adminEmail}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Admin First Name:</label>
            <input
              type="text"
              name="adminFirstName"
              value={formData.adminFirstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Admin Last Name:</label>
            <input
              type="text"
              name="adminLastName"
              value={formData.adminLastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
              required
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Admin Job Title:</label>
            <input
              type="text"
              name="adminJobTitle"
              value={formData.adminJobTitle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300"
            disabled={loading}
          >
            {loading ? 'Creating Company...' : 'Create Company'}
          </button>
        </form>
        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 mt-4">{successMessage}</p>}
      </div>
    </div>
  );
};

export default CreateCompanyPage;