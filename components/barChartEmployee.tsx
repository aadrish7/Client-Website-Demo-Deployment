import React from 'react';
import Plot from 'react-plotly.js';

type BarChartProps = {
  data: {
    [key: string]: number;
  };
};

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const sortedNames = Object.keys(data).sort((a, b) => data[b] - data[a]);
  const scores = sortedNames.map(name => data[name]);
  const remainingScores = sortedNames.map(name => 5 - data[name]);

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

  const chartColors = sortedNames.map(name => colorMapping[name] || '#D3D3D3'); 
  const chartLightColors = sortedNames.map(name => lightColorMapping[name] || '#F5F5F5');

  const coloredTickText = sortedNames.map(
    name => `<span style="color:${colorMapping[name] || '#000'}">${name}</span>`
  );

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
          textfont: {
            color: 'white',
          },
          hoverinfo: 'none', // Disable hover information for the 'Score' bars
          showlegend: false,  
        },
        {
          x: sortedNames,
          y: remainingScores,
          type: 'bar',
          name: 'Remaining',
          marker: { color: chartLightColors },
          hoverinfo: 'none', // Disable hover information for the 'Remaining' bars
          showlegend: false,  
        },
      ]}
      layout={{
        barmode: 'stack',
        yaxis: {
          range: [0, 5],
          title: undefined, 
        },
        xaxis: {
          automargin: true,
          title: undefined,
          tickvals: sortedNames,
          ticktext: coloredTickText,
          tickangle: -45,  
        },
        margin: {
          b: 100, 
        },
        showlegend: false,
        autosize: true, // Enable auto-sizing to the container
      }}
      config={{
        displayModeBar: false,  // Removes the "Download plot as PNG" button
        responsive: true,       // Make the chart responsive to container size changes
      }}
      style={{ width: '100%', height: '100%' }} // Takes full width and height of the parent container
    />
  );
};

export default BarChart;
