import React from 'react';
import Image from "@/public/logo.jpg"
import useUserStore from "@/store/userStore";


interface HeaderProps {
  userName: string;
  userEmail: string;
}

const AdminHeader: React.FC<HeaderProps> = ({ userName, userEmail }) => {
  const userRole = useUserStore((state) => state.userRole);
  const email = useUserStore((state) => state.userEmail);

  userName = userRole || "";
  userEmail = email || "";
  return (
    <div className="w-full bg-white p-6 h-16 flex justify-between items-center border">
    <img src={Image.src} alt="Logo" className="mr-4" width={60} height={60}/>
    <div className="flex flex-col items-end text-gray-600 space-y-2 flex-grow">
      <span className="font-bold">{userName}</span>
      <span>{userEmail}</span>
    </div>
  </div>
  
  );
};

export default AdminHeader;
