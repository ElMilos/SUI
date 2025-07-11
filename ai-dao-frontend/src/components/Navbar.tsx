import React, { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  Bell,
  Search,
  Info,
  Sun,
  Moon,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  ShoppingCart,
  LifeBuoy,
  Settings as SettingsIcon
} from "lucide-react";
import { ConnectButton, useWallets } from "@mysten/dapp-kit";
import '@mysten/dapp-kit/dist/index.css';

// Theme toggle component
const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  const toggle = () => {
    if (theme === 'light') {
      document.documentElement.classList.add('dark');
      setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
      aria-label="Toggle dark mode"
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-gray-700" />
      ) : (
        <Sun className="w-5 h-5 text-yellow-500" />
      )}
    </button>
  );
};

// Wallet connection component
const WalletConnect: React.FC = () => {
  const wallets = useWallets();
  const current = wallets[0];
  const address = current?.accounts?.[0]?.address;

  return (
    <div className="flex items-center space-x-2">
      <ConnectButton />
      {address && (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
      )}
    </div>
  );
};

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
        {children && (open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />)}
      </button>
      {open && children && <div className="mt-1 ml-6">{children}</div>}
    </div>
  );
};

// Avatar dropdown menu
const AvatarMenu: React.FC = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <img
          src="/avatar.png"
          alt="User avatar"
          className="w-8 h-8 rounded-full border"
        />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Acme Inc.</span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10">
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Profile
          </Link>
          <Link
            to="/settings"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Settings
          </Link>
          <button
            onClick={() => { /* handle logout */ }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

// Main Navbar component
const Navbar: React.FC = () => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-700 flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center px-6">
            <Link to="/" className="text-2xl font-bold text-indigo-600">YourLogo</Link>
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

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between bg-white dark:bg-gray-900 border-b dark:border-gray-700 px-6">
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Search className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Info className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <ThemeToggle />
          </div>
          <div className="flex items-center space-x-4">
            <WalletConnect />
            <AvatarMenu />
          </div>
        </header>

        {/* Page content rendered here */}
        <main className="flex-1 bg-gray-50 dark:bg-gray-800 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Navbar;
