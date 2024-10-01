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
};

const TextSnippetDisplay: React.FC<Props> = ({
  factors,
  arrOfTextSnippetsId,
  selectedMetric,
}) => {
  const [snippets, setSnippets] = useState<any>([]);
  const [matchingSnippets, setMatchingSnippets] = useState<any>([]);

  const isScoreInRange = (score: number, range: Number): boolean => {
    const rangeValue = range.valueOf();
    const min = rangeValue - 0.49;
    const max = rangeValue + 0.5;
    return score >= min && score <= max;
  };

  useEffect(() => {
    const fetchTextSnippets = async () => {
      try {
        let snippets = [];
        for (const snippetId of arrOfTextSnippetsId) {
          const snippet = await client.models.TextSnippet.get({
            id: snippetId,
          });
          snippets.push(snippet);
        }
        setSnippets(snippets);
      } catch (error) {
        console.error("Failed to fetch text snippets:", error);
      }
    };

    fetchTextSnippets();
  }, []);

  useEffect(() => {
    if (snippets.length > 0) {
      const matchedSnippets = snippets.filter((snippet: any) => {
        const factorScore = factors[snippet.data.factor];
        return factorScore && isScoreInRange(factorScore, snippet.data.score);
      });
      setMatchingSnippets(matchedSnippets);
    }
  }, [snippets, factors]);

  return (
    <>
      {matchingSnippets.length > 0 ? (
        <p className="text-sm text-gray-700 leading-relaxed">
          {matchingSnippets
            .filter((snippet: any) => snippet.data.factor === selectedMetric)
            .map((snippet: any, index: any) => (
              <span key={index}>{snippet.data.snippetText} </span>
            ))}
        </p>
      ) : null}
    </>
  );
};

export default TextSnippetDisplay;
