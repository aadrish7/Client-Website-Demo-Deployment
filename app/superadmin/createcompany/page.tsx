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

interface CreateCompanyPageProps {
  onClose: () => void; // Define onClose prop type
}

const CreateCompanyPage: React.FC<CreateCompanyPageProps> = ({ onClose }) => {
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
      onClose(); // Close the modal after successful creation
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-10">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold mb-7">Create a New Company</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-6 mt-4">
            <label className="text-sm block font-medium mb-2">Company Name</label>
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
            <label className="text-sm block font-medium mb-2">Admin Email</label>
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
            <label className="text-sm block font-medium mb-2">Admin First Name</label>
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
            <label className="text-sm block font-medium mb-2">Admin Last Name</label>
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
            <label className="text-sm block font-medium mb-2">Admin Job Title</label>
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
              {loading ? 'Creating Company...' : 'Create Company'}
            </button>
          </div>
        </form>
        {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
        {successMessage && <p className="text-black mt-4">{successMessage}</p>}
      </div>
    </div>
  );
};

export default CreateCompanyPage;
