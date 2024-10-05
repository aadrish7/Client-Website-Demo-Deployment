import { IoIosList } from "react-icons/io";
import { IconType } from 'react-icons'; // Ensure correct typing
import { RiMessage2Fill } from "react-icons/ri";
import { HiBriefcase } from "react-icons/hi2";
import { FaFileContract } from "react-icons/fa";

export interface NavItem {
  label: string;
  href?: string;
  subItems?: NavItem[]; // Used for dropdown items
  icon?: IconType; // Icon type from react-icons
}

export const navItems: NavItem[] = [
  {
    label: 'Collections',
    icon: IoIosList, // Import icons here
    subItems: [
      { label: 'Question Bank', href: '/superadmin/collections/questionbank' },
      { label: 'Collection', href: '/superadmin/collections/collection' },
    ]
  },
  {
    label: 'Snippets',
    icon: RiMessage2Fill,
    subItems: [
      { label: 'Snippet Bank', href: '/superadmin/snippets' },
      { label: 'Snippet Set', href: '/superadmin/snippets/snippetset' }
    ]
  },
  { label: 'Company', href: '/superadmin', icon: HiBriefcase },
  { label: 'Analytics', href: '/superadmin/analytics', icon: FaFileContract },
];
