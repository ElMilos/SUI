/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, Fragment } from 'react';
import { LifeBuoy, ChevronDown, Send } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { useTheme } from '../contexts/ThemeContext';

const FAQ_ITEMS = [
  { q: 'How to connect my wallet?', a: 'Go to the Wallet section and click "Connect Wallet". Choose your provider and approve the connection.' },
  { q: 'How to vote on proposals?', a: 'Navigate to the Proposals tab, select a proposal, and click Vote. Confirm the transaction in your wallet.' },
  { q: 'Where to check transaction status?', a: 'Visit the Transactions page in your profile, or check on a block explorer via the tx hash link.' },
];

const Support: React.FC = () => {
  const { darkMode } = useTheme();
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
    console.log('Support message:', formData);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', message: '' });
  };

  const containerClass = `space-y-6 p-6 transition-colors duration-200 ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`;
  const cardClass = `rounded-lg shadow p-6 transition-colors duration-200 ${darkMode ? 'bg-gray-900' : 'bg-white'}`;
  const titleClass = `text-lg font-semibold mb-4 transition-colors duration-200 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`;
  const inputClass = `w-full mb-4 px-3 py-2 border rounded transition-colors duration-200 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`;
  const faqButtonClass = `w-full flex justify-between items-center text-left p-2 rounded transition-colors duration-200 ${darkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`;
  const faqTextClass = `mt-2 transition-colors duration-200 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`;
  const contactTextClass = `mb-4 transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`;
  const discordLinkClass = `transition-colors duration-200 ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`;
  const modalBgClass = `p-6 rounded-lg shadow-lg w-full max-w-md transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`;
  const labelClass = `block text-sm font-medium mb-1 transition-colors duration-200 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`;
  const fieldClass = `mt-1 block w-full p-2 border rounded transition-colors duration-200 ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-gray-50 border-gray-300 text-gray-900'}`;
  const buttonPrimary = `flex items-center px-4 py-2 rounded transition-colors duration-200 bg-indigo-600 text-white hover:bg-indigo-700`;
  const buttonSecondary = `px-4 py-2 rounded transition-colors duration-200 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-100' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`;

  return (
    <div className={containerClass}>
      <div className="flex items-center justify-between">
        <h2 className={titleClass}>Support</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* FAQ Card */}
        <div className={cardClass}>
          <h3 className={titleClass}>FAQ</h3>
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={inputClass}
          />
          <ul className="divide-y transition-colors duration-200" style={{ borderColor: darkMode ? '#4B5563' : '#E5E7EB' }}>
            {filteredFAQs.map((item, idx) => (
              <li key={idx} className="py-2">
                <button
                  onClick={() => toggleFAQ(idx)}
                  className={faqButtonClass}
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
                  <p className={faqTextClass}>{item.a}</p>
                </Transition>
              </li>
            ))}
            {filteredFAQs.length === 0 && (
              <li className={faqTextClass}>No FAQs found.</li>
            )}
          </ul>
        </div>

        {/* Contact Card */}
        <div className={`${cardClass} flex flex-col justify-between`}>          
          <h3 className={titleClass}>Get Help</h3>
          <p className={contactTextClass}>
            Need assistance? Join our <a href="https://discord.gg/example" target="_blank" rel="noopener" className={discordLinkClass}>Discord</a> or open a support ticket.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className={buttonPrimary}
          >
            <LifeBuoy className="w-5 h-5 mr-2" /> Contact Support
          </button>
        </div>
      </div>

      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      >
        <Dialog.Panel className={modalBgClass}>
          <Dialog.Title className={`text-lg font-medium mb-4 transition-colors duration-200 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Submit a Support Ticket
          </Dialog.Title>
          <form onSubmit={handleSubmit} className="space-y-4">
            {['name', 'email', 'message'].map((field, idx) => (
              <div key={field}>
                <label className={labelClass}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                {field === 'message' ? (
                  <textarea
                    name={field}
                    value={(formData as any)[field]}
                    onChange={handleInputChange}
                    rows={4}
                    required
                    className={fieldClass}
                  />
                ) : (
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    name={field}
                    value={(formData as any)[field]}
                    onChange={handleInputChange}
                    required
                    className={fieldClass}
                  />
                )}
              </div>
            ))}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={buttonSecondary}
              >
                Cancel
              </button>
              <button type="submit" className={buttonPrimary}>
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
