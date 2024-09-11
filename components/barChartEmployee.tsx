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
  const names = Object.keys(data);
  const scores = names.map(name => data[name]);
  const remainingScores = names.map(name => 5 - data[name]);
  const colors = ['#FF7F7F', '#4D9FFF', '#90EE90', '#40E0D0', '#FFD700'];
  const lightColors = ['#FFE5E5', '#E5F2FF', '#E5FFE5', '#E5FFFF', '#FFFDE5'];

  // Ensure colors and lightColors arrays match the number of categories
  const colorMap = names.reduce((acc, name, index) => {
    acc[name] = colors[index % colors.length];
    return acc;
  }, {} as { [key: string]: string });

  const lightColorMap = names.reduce((acc, name, index) => {
    acc[name] = lightColors[index % lightColors.length];
    return acc;
  }, {} as { [key: string]: string });

  const chartColors = names.map(name => colorMap[name]);
  const chartLightColors = names.map(name => lightColorMap[name]);

  return (
    <Plot
      data={[
        {
          x: names,
          y: scores,
          type: 'bar',
          name: 'Score',
          marker: { color: chartColors },
          text: scores.map(score => score.toFixed(2)),
          textposition: 'auto',
        },
        {
          x: names,
          y: remainingScores,
          type: 'bar',
          name: 'Remaining',
          marker: { color: chartLightColors },
          hoverinfo: 'none',
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
          title: '',
        },
      }}
      style={
        { width: '100%', height: '100%' }
      }
    />
  );
};

export default BarChart;
