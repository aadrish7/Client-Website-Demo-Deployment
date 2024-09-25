'use client'

'use client';

import React from 'react';
import Plot from 'react-plotly.js';

type BarChartProps = {
  data: {
    [key: string]: number;
  };
};

const adminBarChart: React.FC<BarChartProps> = ({ data }) => {
    const sortedNames = Object.keys(data).sort((a, b) => data[b] - data[a]).slice(0, 3);
    const scores = sortedNames.map(name => data[name]);
    const remainingScores = sortedNames.map(name => 5 - data[name]);
  
    // Map sorted names to SAFE1, SAFE2, SAFE3
    const safeNames = sortedNames.map((_, index) => `SAFE${index + 1}`);
    // Use only blue and light blue colors
    const colors = ['#4D9FFF', '#4D9FFF', '#4D9FFF']; // Blue
    const lightColors = ['#E5F2FF', '#E5F2FF', '#E5F2FF']; 
  return (
    <Plot
      data={[
        {
          x: safeNames,
          y: scores,
          type: 'bar',
          name: 'Score',
          marker: { color: colors },
          text: scores.map(score => score.toFixed(2)),
          textposition: 'auto',
          showlegend: false,
        },
        {
          x: safeNames,
          y: remainingScores,
          type: 'bar',
          name: 'Remaining',
          marker: { color: lightColors },
          hoverinfo: 'none',
          showlegend: false,
        },
      ]}
      layout={{
        barmode: 'stack',
        yaxis: {
          title: 'Score',
          range: [0, 5],
        },
        xaxis: {
          title: 'Factors',
          automargin: true,
        },
        margin: {
          b: 100,
        },
        showlegend: false,
      }}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default adminBarChart;
