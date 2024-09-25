import React from 'react';
import Image from "@/public/logo.jpg"


interface HeaderProps {
  userName: string;
  userEmail: string;
}

const AdminHeader: React.FC<HeaderProps> = ({ userName, userEmail }) => {
  return (
    <div className="w-full bg-white shadow-md p-6 h-16 flex justify-between items-center border-2 border-gray-100">
    <img src={Image.src} alt="Logo" className="mr-4" width={60} height={60}/>
    <div className="flex flex-col items-end text-gray-600 space-y-2 flex-grow">
      <span className="font-bold">{userName}</span>
      <span>{userEmail}</span>
    </div>
  </div>
  
  );
};

export default AdminHeader;
