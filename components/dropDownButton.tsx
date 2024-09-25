'use client';
import React, { useState } from 'react';
interface DropdownButtonProps {
    selectedFactor: string; // Selected factor from parent
    setSelectedFactor: (factor: string) => void; // Function to update selected factor in parent
  }
  
  const DropdownButton: React.FC<DropdownButtonProps> = ({
    selectedFactor,
    setSelectedFactor,
  }) =>  {
  const [isOpen, setIsOpen] = useState(false); // State to control dropdown visibility
  // List of options
  const factors = [
    'Psychological Safety',
    'Growth Satisfaction',
    'Flexibility',
    'Purpose',
    'Advocacy',
  ];

  // Toggle dropdown visibility
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Handle selection of an option
  const handleSelect = (factor: string) => {
    setSelectedFactor(factor);
    setIsOpen(false); // Close the dropdown
  };

  return (
    <div className="relative inline-block text-left">
      {/* Button to trigger dropdown */}
      <button
        onClick={toggleDropdown}
        className="bg-white border-2 rounded-lg text-sm text-black p-2 flex items-center space-x-1" // Flex to align text and icon
        style={{ width: 'auto', display: 'inline-flex' }} // Auto-width to fit text and icon
      >
        <span>{selectedFactor}</span>
        <span className="ml-1">▼</span> {/* The 'v' icon */}
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute mt-2 z-10 w-auto bg-white shadow-lg rounded-md border-2 ring-1 ring-black ring-opacity-5"
          style={{ minWidth: 'max-content' }} // Prevents shrinking, adjusts to text
        >
          {factors.map((factor, index) => (
            <button
              key={index}
              onClick={() => handleSelect(factor)}
              className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-blue-200"
            >
              {factor}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownButton;
