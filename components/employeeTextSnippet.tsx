'use client';
import React, { useEffect, useState } from 'react';
import { generateClient } from 'aws-amplify/data';
import { Schema } from '@/amplify/data/resource';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';

Amplify.configure(outputs);
const client = generateClient<Schema>();

type Props = {
  factors: Record<string, number>;
};

type TextSnippet = {
  factor: string;
  scoreRange: string;
  snippetText: string;
};

const TextSnippetDisplay: React.FC<Props> = ({ factors }) => {
  const [snippets, setSnippets] = useState<TextSnippet[]>([]);
  const [matchingSnippets, setMatchingSnippets] = useState<TextSnippet[]>([]);

  // Helper function to check if a score is within a range
  const isScoreInRange = (score: number, range: string) => {
    const [min, max] = range.split('-').map(Number);
    return score >= min && score <= max;
  };

  useEffect(() => {
    const fetchTextSnippets = async () => {
      try {
        const { data: snippetList } = await client.models.TextSnippet.list({});
        setSnippets(snippetList);
      } catch (error) {
        console.error('Failed to fetch text snippets:', error);
      }
    };

    fetchTextSnippets();
  }, []);

  useEffect(() => {
    if (snippets.length > 0) {
      // Find matching snippets based on the factor and score
      const matchedSnippets = snippets.filter((snippet) => {
        const factorScore = factors[snippet.factor];
        if (factorScore && isScoreInRange(factorScore, snippet.scoreRange)) {
          return true;
        }
        return false;
      });
      setMatchingSnippets(matchedSnippets);
    }
  }, [snippets, factors]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Matching Text Snippets</h1>
      {matchingSnippets.length > 0 ? (
        <div className="space-y-4">
          {matchingSnippets.map((snippet, index) => (
            <div key={index} className="p-4 border rounded-md shadow-sm">
              <h2 className="text-lg font-medium">{snippet.factor}</h2>
              <p className="text-gray-600">{snippet.snippetText}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No matching text snippets found for the provided scores.</p>
      )}
    </div>
  );
};

export default TextSnippetDisplay;
