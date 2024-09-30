"use client";

import React from "react";
import QuestionStepper from "@/components/questionStepper";
import Header from "@/components/superadminHeader";

const categories = [
  "Psychological Safety",
  "Growth Satisfaction",
  "Purpose",
  "Advocacy",
  "Alignment",
  // "Flexibility",
];

interface SurveyComponentProps {
  selectedValues: {
    [key: string]: number | null;
  };
  factorImportanceBool: boolean;
  onSelectionChange: (category: string, value: number) => void;
  onButtonClick: () => void;
}
const steps = [
  "Create Account",
  "Assessment",
  "Survey Results",
];
const currentStep = 1;
const SurveyComponent: React.FC<SurveyComponentProps> = ({
  selectedValues,
  onSelectionChange,
  factorImportanceBool,
  onButtonClick,
}) => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Header userName="" userEmail="" />
      <div className="m-4">
        <QuestionStepper steps={steps} currentStep={currentStep} />
      </div>
      <div className="mx-auto w-3/5 bg-white rounded-lg shadow-md p-8">
        <h2 className="text-xl font-semibold mb-4">
          Please rate each of the following categories from 1 to 5:
        </h2>

        {categories.map((category) => (
          <div key={category} className="mb-4">
            <h3 className="font-semibold mb-2">{category}</h3>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={category}
                    value={value}
                    checked={selectedValues[category] === value}
                    onChange={() => onSelectionChange(category, value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button
          onClick={onButtonClick}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300"
        >
          Move to Questions
        </button>
      </div>
    </div>
  );
};

export default SurveyComponent;
