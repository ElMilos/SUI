import { Home, Settings, LifeBuoy } from 'lucide-react';
import Logo from '../assets/logo.svg';
import { useTheme } from '../contexts/ThemeContext';
import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: Home, href: '/' },
  { label: 'Settings', icon: Settings, href: '/settings' },
  { label: 'Support', icon: LifeBuoy, href: '/support' },
];

export default function Sidebar() {
  const { darkMode } = useTheme();

  const asideClass = `w-56 h-full p-6 flex flex-col space-y-4 shadow-lg transition-colors duration-200 ${
    darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
  }`;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-2 rounded-lg transition-all duration-200 ease-in-out font-medium focus:outline-none focus:ring-2 ${
      isActive
        ? darkMode
          ? 'bg-gray-700 text-white'
          : 'bg-indigo-100 text-indigo-700'
        : darkMode
        ? 'hover:bg-gray-800 text-gray-100'
        : 'hover:bg-gray-100 text-gray-900'
    }`;

  return (
    <aside className={asideClass}>
      {/* Logo and Title */}
      <div className="flex flex-col items-center mb-6">
        <img src={Logo} alt="VoteSentry Logo" className="w-20 h-20 mb-2" />
        <h1 className="text-2xl font-extrabold tracking-wider">VoteSentry</h1>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col space-y-2">
        {navItems.map((item) => (
          <NavLink key={item.href} to={item.href} className={linkClass}>
            <item.icon className="w-5 h-5 mr-3 drop-shadow-lg" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Copyright */}
      <div className="mt-auto text-center">
        <span className={darkMode ? 'text-gray-500' : 'text-blue-300'}>© 2025 VoteSentry</span>
      </div>
    </aside>
  );
}