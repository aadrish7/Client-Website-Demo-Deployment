import React from 'react';

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentQuestion, totalQuestions }) => {
  const percentage = Math.round((currentQuestion / totalQuestions) * 100);

  return (
    <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <div style={{ flexGrow: 1, height: '10px', backgroundColor: '#e5e7eb', borderRadius: '5px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${percentage}%`,
            backgroundColor: '#2563eb', // Blue color
            height: '100%',
            borderRadius: '5px',
          }}
        />
      </div>
      <span style={{ marginLeft: '10px', fontSize: '14px', color: '#6b7280' }}>{`${percentage}%`}</span>
    </div>
  );
};

export default ProgressBar;
