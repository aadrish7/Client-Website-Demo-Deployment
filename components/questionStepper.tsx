import React from 'react';
import { BsFillPatchCheckFill } from 'react-icons/bs';

interface StepperProps {
  steps: string[];
  currentStep: number;
}

const Stepper: React.FC<StepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          {/* Completed and current step */}
          <div className="flex items-center">
            {index < currentStep ? (
              <BsFillPatchCheckFill className="text-blue-600" />
            ) : (
              <span
                className={`w-4 h-4 rounded-full ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-400'
                }`}
              />
            )}
            <span className={`ml-2 text-sm ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
              {step}
            </span>
          </div>

          {/* Line separator */}
          {index < steps.length - 1 && (
            <div
              className={`flex-auto mx-2 w-10 border-t-2 ${
                index < currentStep ? 'border-blue-600' : 'border-gray-300'
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Stepper;
