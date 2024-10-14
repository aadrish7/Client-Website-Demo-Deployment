'use client';

import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import {
  createPaginatedFetchFunctionForQuestion,
} from "@/constants/pagination";
import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { Schema } from "@/amplify/data/resource";

type BarChartProps = {
  data: {
    [key: string]: number;
  };
  factor: string;
};

Amplify.configure(outputs);
const client = generateClient<Schema>();

const colorMapping: { [key: string]: string } = {
  "Psychological Safety": '#0971CE',
  "Growth Satisfaction": '#6ED34A',
  "Purpose": '#FEC229',
  "Advocacy": '#FF5E57',
  "Flexibility": '#16CAC3',
};

const lightColorMapping: { [key: string]: string } = {
  "Psychological Safety": '#E0F0FC',
  "Growth Satisfaction": '#EAFCD9',
  "Purpose": '#FFF5D9',
  "Advocacy": '#FFE5E4',
  "Flexibility": '#D8F9F8',
};

const AdminBarChart: React.FC<BarChartProps> = ({ data, factor }) => {
  const [questionTexts, setQuestionTexts] = useState<{ [key: string]: string }>({});

  // Fetch question texts based on the question IDs
  useEffect(() => {
    const fetchQuestionTexts = async () => {
      const questionIds = Object.keys(data);

      const fetchPromises = questionIds.map(async (id) => {
        const filterForQuestions = {
          id: {
            eq: id,
          },
        };
        const questionText = await createPaginatedFetchFunctionForQuestion(client, filterForQuestions)();
        return { id, text: questionText[0]?.questionText || 'No text available' };
      });

      const results = await Promise.all(fetchPromises);

      const questionTextsMap: { [key: string]: string } = {};
      results.forEach(({ id, text }) => {
        questionTextsMap[id] = text;
      });

      setQuestionTexts(questionTextsMap);
    };

    fetchQuestionTexts();
  }, [data]);

  const sortedNames = Object.keys(data).sort((a, b) => data[b] - data[a]).slice(0, 3);
  const scores = sortedNames.map(name => data[name]);
  const remainingScores = sortedNames.map(name => 5 - data[name]);

  // Generate names based on the factor
  const generateNames = (factor: string, count: number) => {
    switch (factor) {
      case 'Psychological Safety':
        return sortedNames.map((_, index) => `SAFE${index + 1}`);
      case 'Flexibility':
        return sortedNames.map((_, index) => `FLEX${index + 1}`);
      case 'Purpose':
        return sortedNames.map((_, index) => `PURP${index + 1}`);
      case 'Growth Satisfaction':
        return sortedNames.map((_, index) => `GROW${index + 1}`);
      case 'Advocacy':
        return sortedNames.map((_, index) => `ADVO${index + 1}`);
      default:
        return sortedNames; // Default to the original names if the factor is not recognized
    }
  };

  const names = generateNames(factor, sortedNames.length);

  // Set colors dynamically based on the factor names (sortedNames)
  const colors = sortedNames.map(name => colorMapping[factor] || '#4D9FFF'); // Default to blue if not found
  const lightColors = sortedNames.map(name => lightColorMapping[factor] || '#E5F2FF'); // Default to light blue

  // Update hoverinfo to show question text on hover and score on the bar graph
  return (
    <Plot
      data={[
        {
          x: names,
          y: scores,
          type: 'bar',
          name: 'Score',
          marker: { color: colors },
          text: scores.map(score => score.toFixed(2)), // Show score on the bars
          hovertext: sortedNames.map(name => questionTexts[name] || 'Loading...'), // Show question text on hover
          hoverinfo: 'text', // Display both score and question text on hover
          showlegend: false,
        },
        {
          x: names,
          y: remainingScores,
          type: 'bar',
          name: 'Remaining',
          marker: { color: lightColors },
          hoverinfo: 'none', // Disable hover interaction for this trace
          showlegend: false,
        },
      ]}
      layout={{
        barmode: 'stack',
        yaxis: {
          range: [0, 5],
        },
        xaxis: {
          automargin: true,
        },
        margin: {
          b: 100,
        },
        showlegend: false,
        hovermode: 'closest', // Enable hover for the bars
        autosize: true, // Enable autosizing based on the container
      }}
      config={{
        displaylogo: false, // Removes the "Made with Plotly" logo
        modeBarButtonsToRemove: ['toImage'], // Removes the "Download plot as PNG" button
        displayModeBar: false, // Removes the mode bar with zoom and pan options
        responsive: true, // Enables responsiveness to container resizing
      }}
      style={{ width: '100%', height: '100%', cursor: 'pointer' }} // Ensure it uses 100% of the parent container's width and height
    />
  );
};

export default AdminBarChart;
