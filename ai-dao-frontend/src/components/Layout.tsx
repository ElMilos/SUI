import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useTheme } from '../contexts/ThemeContext';
import { AnimatePresence, motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { darkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(open => !open);

  return (
    <div className={`flex flex-col h-screen w-screen transition-colors duration-200 ${
      darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
    }`}>
      {/* Navbar full width */}
      <Navbar onMenuClick={toggleSidebar} />

      {/* Content area: Sidebar + Main content */}
      <div className="flex flex-1 min-h-0 relative">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex">
          <Sidebar />
        </aside>

        {/* Mobile sidebar overlay with animation */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              className="fixed inset-0 z-50 flex"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.aside
                className="w-64 h-full bg-white dark:bg-gray-900 shadow-lg p-6"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
              >
                <Sidebar />
              </motion.aside>
              <motion.div
                className="flex-1"
                onClick={toggleSidebar}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;