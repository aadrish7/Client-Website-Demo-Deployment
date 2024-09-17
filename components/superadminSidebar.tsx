import React from 'react';

interface NavItem {
  label: string;
  active: boolean;
}

interface SidebarProps {
  navItems: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ navItems }) => {
  return (
    <div className="w-1/5 bg-gray-50 p-6">
      <ul className="space-y-6 text-gray-800">
        {navItems.map((item, index) => (
          <li key={index} className={item.active ? 'font-bold text-blue-600' : ''}>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
