import { IoIosList } from "react-icons/io";
import { IconType } from 'react-icons'; // Ensure correct typing
import { RiMessage2Fill } from "react-icons/ri";
import { HiBriefcase } from "react-icons/hi2";
import { FaFileContract } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import { IoIosPeople } from "react-icons/io";

export interface NavItem {
  label: string;
  href?: string;
  subItems?: NavItem[]; // Used for dropdown items
  icon?: IconType; // Icon type from react-icons
}

export const navItems: NavItem[] = [
  { label: 'Overview', href: '/admin/overview', icon: IoGrid },
  { label: 'Analytics', href: '/admin/analytics', icon: FaFileContract },
  { label: 'Employees', href: '/admin/employees', icon: IoIosPeople },
];
