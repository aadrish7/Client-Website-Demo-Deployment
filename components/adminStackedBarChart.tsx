'use client';
import React from "react";
import Plot from "react-plotly.js";

interface StackedBarChartProps {
  ratings: {
    label: string;
    values: number[];
    color: string;
  }[];
  categories: string[];
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({ ratings, categories }) => {
  return (
    <Plot
      data={ratings.map(rating => ({
        x: rating.values,
        y: categories,
        name: rating.label,
        orientation: 'h',
        type: 'bar',
        hoverinfo: 'none',  // Disable hover interaction
        marker: { 
          color: rating.color,
          line: {
            color: 'white',  // White line separator
            width: 2         // Adjust width as needed
          }
        },
      }))}
      layout={{
        barmode: 'stack',
        xaxis: {
          title: '',
          range: [0, 100],
          showgrid: false,
          zeroline: false,
        },
        yaxis: {
          title: '',
          showgrid: false,
          zeroline: false,
          automargin: true, // Ensure labels don't get cut off
        },
        bargap: 0.5,  // Reduce gap between bars
        bargroupgap: 0.1, // Reduce gap between bar groups
        showlegend: true,
        legend: {
          orientation: 'h',
          x: 0.5,
          y: -0.2,
          xanchor: 'center',
          traceorder: 'normal',
        },
        margin: {
          l: 150, // Adjust the left margin for better alignment
          r: 30,
          t: 30,
          b: 80,
        },
        autosize: true,  // Automatically size the chart based on container
      }}
      config={{
        displayModeBar: false,  // Removes the "Download plot as PNG" button
        displaylogo: false,     // Removes the "Made with Plotly" logo
        modeBarButtonsToRemove: ['toImage'],  // Remove the download image button
        responsive: true,  // Ensure chart resizes with its container
        staticPlot: true,  // Make the chart non-interactive
      }}
      style={{ width: '100%', height: '100%' }}  // Chart takes full width and height of the container
    />
  );
};

export default StackedBarChart;
