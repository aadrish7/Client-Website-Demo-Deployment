import { IoIosList } from "react-icons/io";
import { IconType } from 'react-icons'; // Ensure correct typing
import { RiMessage2Fill } from "react-icons/ri";
import { HiBriefcase } from "react-icons/hi2";
import { FaFileContract } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import { IoIosPeople } from "react-icons/io";
import useUserStore from "@/store/userStore";
import { useMemo } from "react";

export interface NavItem {
  label: string;
  href?: string;
  subItems?: NavItem[]; // Used for dropdown items
  icon?: IconType; // Icon type from react-icons
}

// Move the creation of navItems inside a component or a function
export const useNavItems = () => {
  const surveyId = useUserStore((state) => state.surveyId);

  const navItems: NavItem[] = useMemo(() => [
    { label: 'Overview', href: `/admin/overview?surveyId=${surveyId}`, icon: IoGrid },
    { label: 'Analytics', href: `/admin/analytics?surveyId=${surveyId}`, icon: FaFileContract },
    { label: 'Employees', href: `/admin/employees?surveyId=${surveyId}`, icon: IoIosPeople },
  ], [surveyId]); // Ensure that navItems updates when surveyId changes

  return navItems;
};
