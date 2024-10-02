import React from "react";
import QuestionStepper from "@/components/questionStepper";
import Header from "@/components/superadminHeader";
import ProgressBar from "@/components/progressBar";

// Update to include the questions for each category
const categoriesQuestions = {
  "Psychological Safety":
    "Feeling safe to share my ideas at my job is important to me.",
  "Growth Satisfaction":
    "Having opportunities for career growth at my job is important to me.",
  "Purpose":
    "Having a sense of purpose at my job is important to me.",
  "Advocacy":
    "Acknowledgement of my achievements at my job is important to me.",
  "Alignment":
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
  return (
    <div className="bg-gray-100 min-h-screen">
      <Header userName="" userEmail="" />

      <div className="m-4">
        <QuestionStepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="mx-auto w-3/5 bg-white rounded-lg shadow-md p-8">
        <ProgressBar
          currentQuestion={currentQuestionNumber}
          totalQuestions={totalQuestions}
        />
        <h2 className="text-xl font-semibold mb-2">
          Question {currentQuestionNumber + 1} of {totalQuestions}:
        </h2>
         <h2 className="text-gray-700 mb-6">
      Rank the importance of each of these statements from 1-5 (5 = Very Important, 1 = Not Very Important)
    </h2>

    {/* Loop over categories and display their corresponding questions */}
    {Object.entries(categoriesQuestions).map(([category, question]) => (
      <div key={category} className="mb-6 text-gray-700">
        <div className="grid grid-cols-2 gap-2 border-b">
          {/* Left side for the question */}
          <p className="mb-2 break-words">{question}</p>
          {/* Right side for the options */}
          <div className="flex justify-end gap-4">
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
      </div>
    ))}

  </div>
  <div className="flex justify-end">
  <button
    onClick={onButtonClick}
    className="bg-blue-600 mx-[260px] mb-6 text-white mt-3 px-4 py-2  rounded hover:bg-blue-600 transition duration-300"
  >
    Finish
  </button>
</div>

</div>

  );
};

export default SurveyComponent;
