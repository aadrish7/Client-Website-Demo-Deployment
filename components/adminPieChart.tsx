import React from 'react';
import Plot from 'react-plotly.js';

interface PieChartProps {
  data: { [key: string]: number }; // Object with label as key and value as its value
}

// Light color mapping for the factors
const colorMapping: { [key: string]: string } = {
  "Psychological Safety": '#0971CE',
  "Growth Satisfaction": '#6ED34A',
  "Purpose": '#FEC229',
  "Advocacy": '#FF5E57',
  "Flexibility": '#16CAC3',
};

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  // Convert object into an array of entries, sort by values in descending order
  const sortedData = Object.entries(data).sort(([, valueA], [, valueB]) => valueB - valueA);

  // Separate labels and values
  const labels = sortedData.map(([label]) => label);
  const values = sortedData.map(([, value]) => value);

  // Map colors based on the labels using the lightColorMapping
  const colors = labels.map(label => colorMapping[label] || '#D3D3D3'); // Default to grey if no color is found

  return (
    <>
      <Plot
        data={[
          {
            values: values,
            labels: labels,
            type: 'pie',
            hole: 0.4, // Doughnut chart
            marker: {
              colors: colors, // Use the dynamically assigned colors
              line: {
                color: 'white', // White lines between the slices
                width: 2, // Adjust the thickness of the lines
              },
            },
            textinfo: 'percent',
            hoverinfo: 'label+percent',
            textposition: 'inside',
            insidetextorientation: 'auto',
            textfont: {
              family: 'Arial', // Font family
              size: 14, // Font size
              color: 'white', // Font color
            },
            automargin: true,
          },
        ]}
        layout={{
          showlegend: true,
          legend: {
            orientation: 'v', // Vertical legend
            x: 1, // Positioned to the right
            y: 0.5, // Centered vertically
            xanchor: 'left',
            font: {
              family: 'Arial', // Font family for the legend
              size: 12, // Font size for the legend
              color: '#000000', // Font color for the legend
            },
            itemsizing: 'constant', // Ensure legend items are equally sized
            traceorder: 'normal',
          },
          margin: {
            l: 0,
            r: 150, // Space for the legend
            t: 0,
            b: 0,
          },
          height: 300,
          width: 400,
        }}
        style={{ width: '100%', height: '100%' }}
      />
    </>
  );
};

export default PieChart;
