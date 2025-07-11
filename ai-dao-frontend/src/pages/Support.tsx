import React from 'react';
import { LifeBuoy } from 'lucide-react';

const Support: React.FC = () => (
  <div className="space-y-6">
    {/* Page Header */}
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Support</h2>
    </div>

    {/* Content Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* FAQ Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">FAQ</h3>
        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
          <li><a href="#" className="hover:underline">How to connect my wallet?</a></li>
          <li><a href="#" className="hover:underline">How to vote on proposals?</a></li>
          <li><a href="#" className="hover:underline">Where to check transaction status?</a></li>
        </ul>
      </div>

      {/* Contact Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Get Help</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Need assistance? Join our Discord or open a support ticket.
        </p>
        <button className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          <LifeBuoy className="w-5 h-5 mr-2" /> Contact Support
        </button>
      </div>
    </div>
  </div>
);

export default Support;
