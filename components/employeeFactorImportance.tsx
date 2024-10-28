import React, { useEffect, useState } from "react";
import QuestionStepper from "@/components/questionStepper";
import Header from "@/components/superadminHeader";
import ProgressBar from "@/components/progressBar";



const categoriesQuestions = {
  "Psychological Safety":
    "Feeling safe to share my ideas at my job is important to me.",
  "Growth Satisfaction":
    "Having opportunities for career growth at my job is important to me.",
  Purpose: "Having a sense of purpose at my job is important to me.",
  Advocacy: "Acknowledgement of my achievements at my job is important to me.",
  Flexibility:
    "Flexibility to be able to have a good work/life balance at my job is important to me.",
};

interface SurveyComponentProps {
  selectedValues: {
    [key: string]: number | null;
  };
  factorImportanceBool: boolean;
  onSelectionChange: (category: string, value: number) => void;
  onButtonClick: () => void;
  currentQuestionNumber: number;
  totalQuestions: number;
}

const steps = ["Create Account", "Assessment", "Survey Results"];
const currentStep = 1;

const SurveyComponent: React.FC<SurveyComponentProps> = ({
  selectedValues,
  onSelectionChange,
  factorImportanceBool,
  onButtonClick,
  currentQuestionNumber,
  totalQuestions,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [allValuesSelected, setAllValuesSelected] = useState(false);

  useEffect(() => {
    // Get the selected values and filter out any nulls
    const selectedRanks = Object.values(selectedValues).filter(
      (value) => value !== null
    );

    const hasDuplicates = selectedRanks.length !== new Set(selectedRanks).size;

    // Check if all values are selected
    console.log("selectedValues", selectedValues);
    const allSelected = Object.values(selectedValues).every(
      (value) => value !== null
    );
    console.log("allSelected", allSelected);

    // If duplicates exist, show error message
    if (hasDuplicates) {
      setError("Values 1-5 can only be selected once");
    } else if (!allSelected) {
      setError("");
    } else {
      setError(null);
    }

    // Set state to track whether all values are selected and there are no duplicates
    setAllValuesSelected(allSelected && !hasDuplicates);
  }, [selectedValues]);

  const handleSelectionChange = (category: string, value: number) => {
    // Update the selected value without checking for duplicates
    onSelectionChange(category, value);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
  {/* Header component */}
  <Header userName="" userEmail="" />

  {/* Stepper component */}
  <div className="m-4">
    <QuestionStepper steps={steps} currentStep={currentStep} />
  </div>

  {/* Survey form */}
  <div className="mx-auto w-3/5 bg-white rounded-lg shadow-md p-8 relative">
    <ProgressBar
      currentQuestion={currentQuestionNumber}
      totalQuestions={totalQuestions}
    />
    <p className="text-xl font-semibold mb-1">
      Question {currentQuestionNumber + 1} of {totalQuestions}:
    </p>
    <p className="text-gray-700">
      Rank the importance of each of these statements from 1-5 (5 = Very
      Important, 1 = Not Very Important)
    </p>
    <h2 className="text-gray-700 italic mb-5">Each ranking position can only be selected once. Be sure to assign a unique number to each option</h2>

      {/* Error message for duplicate rankings */}
      {error && (
      <div className="text-[#e22c13] font-semibold text-center mt-4">
        {error}
      </div>
    )}

    {/* Loop over categories and display their corresponding questions */}
    {Object.entries(categoriesQuestions).map(([category, question]) => (
      <div key={category} className="mb-6 text-gray-700">
        <div className="grid grid-cols-2 gap-2 border-b pb-2 min-h-[64px] items-center">
          {/* Left side: the question */}
          <p className="break-words">{question}</p>
          {/* Right side: the dropdown for ranking */}
          <div className="flex justify-end items-center gap-4">
            <select
              value={selectedValues[category] ?? ""}
              onChange={(e) =>
                handleSelectionChange(category, Number(e.target.value))
              }
              className="block w-32 p-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-indigo-200 focus:border-indigo-300"
            >
              <option value="" disabled>
                Rank
              </option>
              {[1, 2, 3, 4, 5].map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    ))}

  

    {/* Submit button aligned to bottom-right of the form */}
    <div className="flex justify-end absolute w-full left-0 bottom-[-4rem]">
      <button
        onClick={onButtonClick}
        className={`text-white px-4 py-2 rounded transition duration-300 ${
          allValuesSelected
            ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
            : "bg-blue-200 cursor-not-allowed"
        }`}
        disabled={!allValuesSelected}
      >
        Finish
      </button>
    </div>
  </div>
</div>

  );
};

export default SurveyComponent;
