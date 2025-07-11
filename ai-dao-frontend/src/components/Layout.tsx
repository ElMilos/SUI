import React, { type ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-800">
      {/* Sidebar + Topbar */}
      <Navbar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Render passed children */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
