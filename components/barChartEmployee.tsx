'use client';

import React from 'react';
import Plot from 'react-plotly.js';

type BarChartProps = {
  data: {
    [key: string]: number;
  };
};

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  // Transform the data into the format required by Plotly
  const sortedNames = Object.keys(data).sort((a, b) => data[b] - data[a]);
  const scores = sortedNames.map(name => data[name]);
  const remainingScores = sortedNames.map(name => 5 - data[name]);
  const colors = ['#FF7F7F', '#4D9FFF', '#90EE90', '#40E0D0', '#FFD700'];
  const lightColors = ['#FFE5E5', '#E5F2FF', '#E5FFE5', '#E5FFFF', '#FFFDE5'];

  // Ensure colors and lightColors arrays match the number of categories
  const colorMap = sortedNames.reduce((acc, name, index) => {
    acc[name] = colors[index % colors.length];
    return acc;
  }, {} as { [key: string]: string });

  const lightColorMap = sortedNames.reduce((acc, name, index) => {
    acc[name] = lightColors[index % lightColors.length];
    return acc;
  }, {} as { [key: string]: string });

  const chartColors = sortedNames.map(name => colorMap[name]);
  const chartLightColors = sortedNames.map(name => lightColorMap[name]);

  return (
    <Plot
      data={[
        {
          x: sortedNames,
          y: scores,
          type: 'bar',
          name: 'Score',
          marker: { color: chartColors },
          text: scores.map(score => score.toFixed(2)),
          textposition: 'auto',
          showlegend: false,  // Hide legend for this trace
        },
        {
          x: sortedNames,
          y: remainingScores,
          type: 'bar',
          name: 'Remaining',
          marker: { color: chartLightColors },
          hoverinfo: 'none',
          showlegend: false,  // Hide legend for this trace
        },
      ]}
      layout={{
        barmode: 'stack',
        title: 'Score Bar Chart',
        yaxis: {
          title: 'Score',
          range: [0, 5],
        },
        xaxis: {
          title: 'Factors',
          automargin: true,  // Prevents title overlap with tick labels
        },
        margin: {
          b: 100, // Increase bottom margin to prevent collision
        },
        showlegend: false, // Hide the entire legend
      }}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default BarChart;
