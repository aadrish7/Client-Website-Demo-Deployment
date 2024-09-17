import React from 'react';

interface ButtonProps {
  onClick: () => void;
  label: string;
  className: string; 
}

const CustomButton: React.FC<ButtonProps> = ({ onClick, label, className }) => {
  return (
    <button onClick={onClick} className={className}>
      {label}
    </button>
  );
};

export default CustomButton;
