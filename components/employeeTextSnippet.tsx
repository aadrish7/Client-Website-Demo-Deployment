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
  score: Number;
  snippetText: string;
};

const TextSnippetDisplay: React.FC<Props> = ({ factors }) => {
  const [snippets, setSnippets] = useState<TextSnippet[]>([]);
  const [matchingSnippets, setMatchingSnippets] = useState<TextSnippet[]>([]);


  const isScoreInRange = (score: number, range: Number): boolean => {
    // Convert the Number object to a primitive number
    const rangeValue = range.valueOf(); 
    
    // Calculate the min and max range based on the given range value
    const min = rangeValue - 0.49; // The minimum should be 0.49 less than the range
    const max = rangeValue + 0.5;  // The maximum should be 0.5 more than the range
    
    // Check if the score falls within the calculated min and max range
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
        if (factorScore && isScoreInRange(factorScore, snippet.score)) {
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
