import React from 'react';

interface HeaderProps {
  userName: string;
  userEmail: string;
}

const AdminHeader: React.FC<HeaderProps> = ({ userName, userEmail }) => {
  return (
    <div className="w-full bg-white shadow-md p-6">
      <div className="flex flex-col items-end text-gray-600 space-y-2">
        <span className="font-bold">{userName}</span>
        <span>{userEmail}</span>
      </div>
    </div>
  );
};

export default AdminHeader;
