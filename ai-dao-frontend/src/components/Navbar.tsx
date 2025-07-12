import { useState } from "react";
import { Bell, Sun, Moon } from "lucide-react";
import WalletConnect from "./WalletConnect";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <header className="w-full h-16 bg-gradient-to-r bg-gray-900 p-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center space-x-4"></div>

      <div className="flex items-center space-x-6">
        <button className="relative p-2 rounded-full dark:bg-gray-800 hover:bg-gray-700 hover:border-gray-700 transition-colors duration-200 neon-icon">
          <Bell className="w-5 h-5 text-white drop-shadow-lg" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-md" />
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full dark:bg-gray-800 hover:bg-gray-700 hover:border-gray-700 duration-200 neon-icon"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-white drop-shadow-lg" />
          ) : (
            <Moon className="w-5 h-5 text-white drop-shadow-lg" />
          )}
        </button>
        <WalletConnect />
      </div>
    </header>
  );
}
