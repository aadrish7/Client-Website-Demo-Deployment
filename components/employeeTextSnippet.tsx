"use client";
import React, { useEffect, useState } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);
const client = generateClient<Schema>();

type Props = {
  factors: Record<string, number>;
  arrOfTextSnippetsId: string[];
  selectedMetric: string;
  snippets: any[];
};

const TextSnippetDisplay: React.FC<Props> = ({
  factors,
  arrOfTextSnippetsId,
  selectedMetric,
  snippets,
}) => {
  const [matchingSnippets, setMatchingSnippets] = useState<any>([]);

  const isScoreInRange = (score: number, range: Number): boolean => {
    const rangeValue = range.valueOf();
    const min = rangeValue - 0.49;
    const max = rangeValue + 0.5;
    return score >= min && score <= max;
  };

  useEffect(() => {
    if (snippets.length > 0) {
      const matchedSnippets = snippets.filter((snippet: any) => {
        const factorScore = factors[snippet[0].factor];
        return factorScore && isScoreInRange(factorScore, snippet[0].score);
      });
      setMatchingSnippets(matchedSnippets);
    }
  }, [snippets, factors]);

  return (
    <>
      {matchingSnippets.length > 0 ? (
        <p className="text-sm text-gray-700 leading-relaxed">
          {matchingSnippets
            .filter(
              (snippet: any) =>
                snippet[0].type === "normal" &&
                snippet[0].factor === selectedMetric
            )
            .map((snippet: any, index: any) => (
              <span key={index}>{snippet[0].snippetText} </span>
            ))}
        </p>
      ) : null}
    </>
  );
};

export default TextSnippetDisplay;
