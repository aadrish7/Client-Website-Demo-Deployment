import React from 'react';

interface CircleProps {
  color?: string;
  text: string; 
  size?: number; 
}

const Circle: React.FC<CircleProps> = ({ color = 'gray', text, size = 100 }) => {
  return (
    <div
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div
        className="rounded-full flex items-center justify-center"
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: color,
        }}
      >
        <span className="text-white font-medium">{text}</span>
      </div>
    </div>
  );
};

export default Circle;
