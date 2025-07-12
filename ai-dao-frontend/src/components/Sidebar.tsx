import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  ShoppingCart,
  LifeBuoy,
  Settings as SettingsIcon,
} from "lucide-react";

// Individual menu link
interface MenuItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
}
const MenuItem: React.FC<MenuItemProps> = ({ to, label, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors mb-1 ${
        isActive
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      }`}
    >
      <span className="mr-2">{icon}</span>
      {label}
    </Link>
  );
};

// Collapsible section
interface MenuSectionProps {
  title: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}
const MenuSection: React.FC<MenuSectionProps> = ({ title, icon, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-semibold rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <span className="flex items-center text-gray-700 dark:text-gray-200">
          <span className="mr-2">{icon}</span>
          {title}
        </span>
        {children &&
          (open ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ))}
      </button>
      {open && children && <div className="mt-1 ml-6">{children}</div>}
    </div>
  );
};

const Sidebar: React.FC = () => (
  <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r dark:border-gray-700 flex flex-col justify-between">
    <div>
      <div className="h-16 flex items-center px-6">
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          YourLogo
        </Link>
      </div>
      <nav className="px-4">
        <MenuSection title="Dashboard" icon={<LayoutDashboard className="w-5 h-5" />}>
          <MenuItem to="/" label="Dashboard" icon={<LayoutDashboard className="w-4 h-4" />} />
          <MenuItem to="/statistics" label="Analytics" icon={<ShoppingCart className="w-4 h-4" />} />
          <MenuItem to="/support" label="Support" icon={<LifeBuoy className="w-4 h-4" />} />
          <MenuItem to="/settings" label="Settings" icon={<SettingsIcon className="w-4 h-4" />} />
        </MenuSection>
      </nav>
    </div>
    <div className="px-4 py-6">
      <button className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <SettingsIcon className="w-4 h-4 mr-2" /> Settings
      </button>
      <button className="flex items-center mt-2 w-full px-3 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <LifeBuoy className="w-4 h-4 mr-2" /> Support
      </button>
    </div>
  </aside>
);

export default Sidebar;
