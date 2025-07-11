import React, { useState } from 'react';
import { Sun, Moon, User, ShieldCheck } from 'lucide-react';

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setDarkMode(!darkMode);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Settings</h2>
      </div>

      {/* Account Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <User className="w-5 h-5 mr-2" /> Account
        </h3>
        <div className="space-y-2 text-gray-600 dark:text-gray-300">
          <p>Username: <strong>acme_user</strong></p>
          <p>Email: <strong>user@example.com</strong></p>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
            Edit Profile
n        </button>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
          <ShieldCheck className="w-5 h-5 mr-2" /> Appearance
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;