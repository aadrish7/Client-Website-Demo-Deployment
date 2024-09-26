'use client'
import React, { useState } from 'react';
import Header from "@/components/superadminHeader"

const categories = [
  'Psychological Safety',
  'Growth Satisfaction',
  'Purpose',
  'Advocacy',
  'Alignment',
];

interface SelectionState {
  [key: string]: number | null;
}

const SurveyComponent: React.FC = () => {
  const [selectedValues, setSelectedValues] = useState<SelectionState>({
    'Psychological Safety': null,
    'Growth Satisfaction': null,
    'Purpose': null,
    'Advocacy': null,
    'Alignment': null,
  });

  const handleSelection = (category: string, value: number) => {
    // Create a new state object and remove the previous selection for the selected value
    const newSelectedValues = Object.fromEntries(
      Object.entries(selectedValues).map(([key, selectedValue]) => [
        key,
        selectedValue === value ? null : selectedValue,
      ])
    );

    // Set the new selection for the current category
    setSelectedValues({
      ...newSelectedValues,
      [category]: value,
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-white flex justify-between items-center mb-10 px-7 py-3">
        <img src="/api/placeholder/40/40" alt="Logo" className="w-10 h-10" />
        <div className="text-right">
          <h2 className="text-lg font-semibold">Neil Sims</h2>
          <p className="text-sm text-gray-600">neilsims@example.com</p>
        </div>
      </header>

      <div className="mx-auto w-3/5 bg-white rounded-lg shadow-md p-8">
        <h2 className="text-xl font-semibold mb-6">
          Please rate each of the following categories from 1 to 5:
        </h2>

        {categories.map((category) => (
          <div key={category} className="mb-6">
            <h3 className="font-semibold mb-2">{category}</h3>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <label key={value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={category}
                    value={value}
                    checked={selectedValues[category] === value}
                    onChange={() => handleSelection(category, value)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurveyComponent;
