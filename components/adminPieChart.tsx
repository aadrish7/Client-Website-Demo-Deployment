import React from 'react';
import Plot from 'react-plotly.js';

interface PieChartProps {
  data: { [key: string]: number }; // Object with label as key and value as its value
}

const colorMapping: { [key: string]: string } = {
  "Psychological Safety": '#0971CE',
  "Growth Satisfaction": '#6ED34A',
  "Purpose": '#FEC229',
  "Advocacy": '#FF5E57',
  "Flexibility": '#16CAC3',
};

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  // Sort data by values in descending order
  const sortedData = Object.entries(data).sort(([, valueA], [, valueB]) => valueB - valueA);

  // Separate labels and values
  const labels = sortedData.map(([label]) => label);
  const values = sortedData.map(([, value]) => value);

  // Map colors based on labels
  const colors = labels.map(label => colorMapping[label] || '#D3D3D3'); // Default to grey if no color is found

  return (
    <Plot
      data={[
        {
          values: values,
          labels: labels,
          type: 'pie',
          hole: 0.4, // Doughnut chart
          marker: {
            colors: colors,
            line: {
              color: 'white',
              width: 2,
            },
          },
          textinfo: 'percent',
          hoverinfo: 'none', // Disable hover interaction for the chart
          textposition: 'inside',
          insidetextorientation: 'auto',
          textfont: {
            family: 'Arial',
            size: 14,
            color: 'white',
          },
          automargin: true,
        },
      ]}
      layout={{
        showlegend: true,
        hovermode: false, // Disable hover interaction for the plot
        legend: {
          orientation: 'v',
          x: 1,
          y: 0.5,
          xanchor: 'left',
          font: {
            family: 'Arial',
            size: 12,
            color: '#000000',
          },
          itemsizing: 'constant',
          traceorder: 'normal',
          // Disable legend hover
          itemclick: false,
          itemdoubleclick: false,
        },
        margin: {
          l: 0,
          r: 150,
          t: 0,
          b: 0,
        },
        height: 300,
        width: 400,
      }}
      config={{
        displaylogo: false, // Removes "Made with Plotly" logo
        modeBarButtonsToRemove: ['toImage'], // Removes the "Download plot as PNG" button
      }}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default PieChart;
