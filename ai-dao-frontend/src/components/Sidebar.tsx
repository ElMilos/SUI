import { Home, Settings, LifeBuoy } from "lucide-react";
import Logo from "../assets/logo.svg"

const navItems = [
  { label: "Dashboard", icon: Home, href: "/" },
  { label: "Settings", icon: Settings, href: "/settings" },
  { label: "Support", icon: LifeBuoy, href: "/support" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 h-full bg-gradient-to-b bg-gray-900 p-6 flex flex-col space-y-4">
      {/* Logo and Title */}
      <div className="flex flex-col items-center mb-6 space-x-3">
        <img src={Logo} alt="VoteSentry Logo" className="w-20 h-20" />
        <h1 className="text-2xl font-extrabold text-white tracking-wider">
          VoteSentry
        </h1>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex flex-col space-y-2">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center px-4 py-2 rounded-lg transition-all duration-200 ease-in-out font-medium text-white  focus:outline-none focus:ring-2 "
          >
            <item.icon className="w-5 h-5 mr-3 drop-shadow-lg" />
            <span className="hover:ml-1 transition-all duration-200">
              {item.label}
            </span>
          </a>
        ))}
      </nav>

      {/* Footer Copyright */}
      <div className="mt-auto text-center">
        <span className="text-xs text-blue-300">© 2025 VoteSentry</span>
      </div>
    </aside>
  );
}
