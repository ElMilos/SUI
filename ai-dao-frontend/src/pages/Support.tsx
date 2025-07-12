import React, { useState } from 'react';
import { LifeBuoy, ChevronDown, Send } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const FAQ_ITEMS = [
  { q: 'How to connect my wallet?', a: 'Go to the Wallet section and click "Connect Wallet". Choose your provider and approve the connection.' },
  { q: 'How to vote on proposals?', a: 'Navigate to the Proposals tab, select a proposal, and click Vote. Confirm the transaction in your wallet.' },
  { q: 'Where to check transaction status?', a: 'Visit the Transactions page in your profile, or check on a block explorer via the tx hash link.' },
];

const Support: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndices, setOpenIndices] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const filteredFAQs = FAQ_ITEMS.filter(item =>
    item.q.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFAQ = (index: number) => {
    setOpenIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: integrate with support ticket API
    console.log('Support message:', formData);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">Support</h2>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* FAQ Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">FAQ</h3>
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full mb-4 px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-700"
          />
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredFAQs.map((item, idx) => (
              <li key={idx} className="py-2">
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex justify-between items-center text-left bg-gray-700 dark:text-gray-300"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 transform transition-transform ${openIndices.includes(idx) ? 'rotate-180' : ''}`}
                  />
                </button>
                <Transition
                  as={Fragment}
                  show={openIndices.includes(idx)}
                  enter="transition-max-height duration-300 ease-in"
                  enterFrom="max-h-0 overflow-hidden"
                  enterTo="max-h-screen overflow-hidden"
                  leave="transition-max-height duration-200 ease-out"
                  leaveFrom="max-h-screen overflow-hidden"
                  leaveTo="max-h-0 overflow-hidden"
                >
                  <p className="mt-2 text-gray-600 dark:text-gray-400">{item.a}</p>
                </Transition>
              </li>
            ))}
            {filteredFAQs.length === 0 && (
              <li className="py-2 text-gray-500 dark:text-gray-500">No FAQs found.</li>
            )}
          </ul>
        </div>

        {/* Contact Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 flex flex-col justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Get Help</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Need assistance? Join our <a href="https://discord.gg/example" target="_blank" rel="noopener" className="text-indigo-600 hover:underline">Discord</a> or open a support ticket.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <LifeBuoy className="w-5 h-5 mr-2" /> Contact Support
          </button>
        </div>
      </div>

      {/* Support Ticket Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      >
        <Dialog.Panel className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
          <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Submit a Support Ticket
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={4}
                required
                className="mt-1 block w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                <Send className="w-4 h-4 mr-2" /> Send
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
};

export default Support;