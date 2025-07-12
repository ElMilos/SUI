import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { darkMode } = useTheme();

  return (
    <div className={`flex flex-col h-screen w-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
    }`}>
      {/* Navbar full width */}
      <Navbar />

      {/* Content area: Sidebar + Main content */}
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 min-h-0 overflow-y-auto p-6 transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
