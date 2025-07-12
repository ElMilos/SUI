import { Bell, Sun, Moon, Menu } from 'lucide-react';
import WalletConnect from './WalletConnect';
import { useTheme } from '../contexts/ThemeContext';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { darkMode, toggle } = useTheme();

  return (
    <header
      className={`w-full h-16 p-4 flex items-center justify-between shadow-lg transition-colors duration-200 ${
        darkMode ? 'bg-gray-900' : 'bg-white'
      }`}
    >
      <div className="flex items-center space-x-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-md bg-gray-800 dark:hover:bg-gray-800 transition-colors duration-200"
        >
          <Menu className={`w-6 h-6 ${darkMode ? 'text-white' : 'text-gray-800'}`} />
        </button>
        {/* Logo or nav items here (show in desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Put logo/text here */}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          className={`relative p-2 rounded-full transition-colors duration-200 ${
            darkMode
              ? 'hover:bg-gray-700 bg-gray-800'
              : 'hover:bg-gray-200 bg-gray-100'
          }`}
        >
          <Bell
            className={`w-5 h-5 drop-shadow-lg ${
              darkMode ? 'text-white' : 'text-gray-800'
            }`}
          />
          <span
            className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-md"
          />
        </button>

        <button
          onClick={toggle}
          aria-label="Toggle dark mode"
          className={`p-2 rounded-full transition-colors duration-200 ${
            darkMode
              ? 'hover:bg-gray-700 bg-gray-800'
              : 'hover:bg-gray-200 bg-gray-100'
          }`}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 drop-shadow-lg text-white" />
          ) : (
            <Moon className="w-5 h-5 drop-shadow-lg text-gray-800" />
          )}
        </button>

        <WalletConnect />
      </div>
    </header>
  );
}
