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
          automargin: true,
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
      }}
      config={{ displayModeBar: false }}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default StackedBarChart;
