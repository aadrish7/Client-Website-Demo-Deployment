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

  // Define specific colors for each factor
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

  // Assign colors based on the factor name
  const chartColors = sortedNames.map(name => colorMapping[name] || '#D3D3D3'); 
  const chartLightColors = sortedNames.map(name => lightColorMapping[name] || '#F5F5F5');

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
          showlegend: false,  
        },
        {
          x: sortedNames,
          y: remainingScores,
          type: 'bar',
          name: 'Remaining',
          marker: { color: chartLightColors },
          hoverinfo: 'none',
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
          tickangle: -45,  // Rotate x-axis labels 45 degrees to the left
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

export default BarChart;
