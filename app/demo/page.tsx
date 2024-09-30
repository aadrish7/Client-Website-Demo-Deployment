'use client'
import React, { useState } from 'react';
import Circle from '@/components/circle';

function EmployeeComponent() {
    const [color, setColor] = useState('red');

    return (
      <div className="flex items-center"> 
      <Circle color="#4CAF50" text="" size={14} />
      <span className='ml-2'>Growth Satisfaction</span>
    </div>
    
    );
}

export default EmployeeComponent;