import React, { useState } from "react";
import Circle from "./circle";
import TextSnippetDisplay from "./employeeTextSnippet";

interface MetricsBreakdownProps {
  averages: Record<string, number>;
  arrOfTextSnippetsId: string[];
  snippets : any[],
}

type CategoryColors = {
  [key: string]: string;
};

const MetricsBreakdown: React.FC<MetricsBreakdownProps> = ({
  averages,
  arrOfTextSnippetsId,
  snippets,
}) => {
  const metricNames = Object.keys(averages);
  const [selectedMetric, setSelectedMetric] = useState(metricNames[0]); // Default to the first metric

  const categoryColors: CategoryColors = {
    "Psychological Safety": "#0971CE",
    "Growth Satisfaction": "#6ED34A",
    Flexibility: "#16CAC3",
    Purpose: "#FEC229",
    Advocacy: "#FF5E57",
  };

  return (
    <>
      <h2 className="text-lg mt-6 font-semibold text-gray-800 mb-4">
        Metrics Breakdown
      </h2>
      <div className="flex mb-6 border">
        {metricNames.map((metric) => (
          <button
            key={metric}
            className={`flex-grow py-2 font-sm text-[12px] text-center ${
              selectedMetric === metric
                ? "text-gray-900 font-semibold bg-gray-100"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setSelectedMetric(metric)}
          >
            <div className="flex items-center ml-2">
              <Circle color={categoryColors[metric]} text="" size={12} />
              <span className="ml-[4px]">{metric}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Metric Display */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div className="relative w-[85%] h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                width: `${(averages[selectedMetric] / 5) * 100}%`,
                backgroundColor: categoryColors[selectedMetric],
              }}
            ></div>
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {averages[selectedMetric].toFixed(2)} / 5
          </span>
        </div>
      </div>

      {/* Description Area */}
      <div className="text-sm text-gray-700 leading-relaxed">
        <TextSnippetDisplay
          factors={averages}
          arrOfTextSnippetsId={arrOfTextSnippetsId}
          selectedMetric={selectedMetric}
          snippets={snippets}
        />

        {/* 
        Psychological Safety refers to an environment where employees feel safe
        to take risks, express their thoughts, and share their ideas without
        fear of negative consequences. A score of 3.33 indicates that while the
        company is doing a fairly good job at providing this sense of safety,
        there is still room for improvement. Employees recognize the importance
        of psychological safety, as shown by the 34% who rated it as the most
        important factor, but the score suggests that there may be some
        inconsistencies in how this is being experienced across the
        organization. */}
      </div>
    </>
  );
};

export default MetricsBreakdown;
