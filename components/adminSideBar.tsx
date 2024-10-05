import React, { useState } from 'react';
import Link from 'next/link';
import { NavItem, navItems } from '@/constants/adminNavItems'; // Import your navItems from centralized file

interface SidebarProps {
  activePath: string; // Now we just pass the active path
}

const Sidebar: React.FC<SidebarProps> = ({ activePath }) => {
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

  const handleDropdownClick = (index: number) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  // Function to check if the current item or its subItems are active
  const isActive = (item: NavItem): boolean => {
    if (item.href === activePath) return true;
    if (item.subItems) {
      return item.subItems.some(subItem => subItem.href === activePath);
    }
    return false;
  };

  return (
    <div className="w-1/5 bg-white p-6">
      <ul className="space-y-6 text-gray-800">
        {navItems.map((item, index) => (
          <li key={index}>
            {item.subItems ? (
              <div>
                <button
                  onClick={() => handleDropdownClick(index)}
                  className={`flex items-center justify-between w-full ${isActive(item) ? 'font-bold text-blue-600' : ''}`}
                >
                  <span className="flex items-center">
                    {/* Render icon dynamically */}
                    {item.icon && <item.icon className="mr-2" />}
                    {item.label}
                  </span>
                  <span className="ml-2">
                    {openDropdownIndex === index ? '^' : 'v'}
                  </span>
                </button>
                {openDropdownIndex === index && (
                  <ul className="pl-4 m-4 space-y-3">
                    {item.subItems.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          href={subItem.href || '#'}
                          className={subItem.href === activePath ? 'font-bold text-blue-600' : 'hover:text-blue-600'}
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link href={item.href || '#'} className={isActive(item) ? 'font-bold text-blue-600' : 'hover:text-blue-600'}>
                <span className="flex items-center">
                  {item.icon && <item.icon className="mr-2" />}
                  {item.label}
                </span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
