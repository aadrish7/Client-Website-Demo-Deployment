import React, { useState } from 'react';
import Link from 'next/link';

interface NavItem {
  label: string;
  active: boolean;
  href?: string;
  subItems?: NavItem[]; // Used for dropdown items
}

interface SidebarProps {
  navItems: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ navItems }) => {
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

  const handleDropdownClick = (index: number) => {
    setOpenDropdownIndex(openDropdownIndex === index ? null : index);
  };

  return (
    <div className="w-1/5 bg-white p-6">
      <ul className="space-y-6 text-gray-800">
        {navItems.map((item, index) => (
          <li key={index}>
            {item.subItems ? (
              <div>
                {/* Handle dropdown toggle */}
                <button
                  onClick={() => handleDropdownClick(index)}
                  className={`flex items-center justify-between w-full ${item.active ? 'font-bold text-blue-600' : ''}`}
                >
                  {item.label}
                  {/* Show dropdown or dropup icon */}
                  <span className="ml-2">
                    {openDropdownIndex === index ? '^' : 'v'}
                  </span>
                </button>
                {/* Show sub-items only if this dropdown is open */}
                {openDropdownIndex === index && (
                  <ul className="pl-4 m-4 space-y-3">
                    {item.subItems.map((subItem, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          href={subItem.href || '#'}
                          className={subItem.active ? 'font-bold text-blue-600' : 'hover:text-blue-600'}
                        >
                          {subItem.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              // Render the main category items
              <Link href={item.href || '#'} className={item.active ? 'font-bold text-blue-600' : 'hover:text-blue-600'}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
