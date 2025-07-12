import React, { type ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen bg-gray-50 dark:bg-gray-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content wrapper */}
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
