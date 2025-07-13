import React from 'react';

interface AddViewModalProps {
  isOpen: boolean;
  name: string;
  onChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const AddViewModal: React.FC<AddViewModalProps> = ({ isOpen, name, onChange, onSave, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg w-80">
        <h3 className="text-xl font-semibold mb-4">Add New View</h3>
        <input
          type="text"
          placeholder="View name"
          value={name}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-2 border dark:border-gray-700 rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">Cancel</button>
          <button onClick={onSave} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
        </div>
      </div>
    </div>
  );
};