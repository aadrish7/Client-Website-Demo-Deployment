'use client';
import React from 'react';
import Plot from 'react-plotly.js';

interface PieChartProps {
  data: { [key: string]: number }; // Object with label as key and value as its value
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  // Convert object into an array of entries, sort by values in descending order
  const sortedData = Object.entries(data).sort(([, valueA], [, valueB]) => valueB - valueA);

  // Separate labels and values
  const labels = sortedData.map(([label]) => label);
  const values = sortedData.map(([, value]) => value);

  return (
    <>
      <Plot
        data={[
          {
            values: values,
            labels: labels,
            type: 'pie',
            hole: 0.4, // To make it a doughnut chart
            marker: {
              colors: ['#3366CC', '#99CC00', '#66CCCC', '#FFCC33', '#FF6666'], // Corresponding colors
            },
            textinfo: 'percent',
            hoverinfo: 'label',
            textposition: 'inside',
            // textfont: {
            //   color: 'white', // Set text color to white
            // },
          },
        ]}
        layout={{
          title: 'Employee Satisfaction Breakdown',
          showlegend: true,
          legend: {
            orientation: 'v', // Vertical orientation
            x: 1, // Move legend to the right
            y: 0.5, // Center the legend vertically
            xanchor: 'left', // Align to the left of x=1 (right side of the chart)
          },
          margin: {
            l: 0,
            r: 150, // Adds space on the right side for the legend
            t: 0,
            b: 0,
          },
        }}
        style={{ width: '85%', height: '85%' }}
      />
    </>
  );
};

export default PieChart;
