import React, { useState } from "react";
import { User, ShieldCheck, Bell, Lock, Edit2 } from "lucide-react";
import { Switch } from "@headlessui/react";
import { useTheme } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const { darkMode } = useTheme();

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  // Security
  const [twoFA, setTwoFA] = useState(false);

  // Modals
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Profile fields
  const [username, setUsername] = useState("acme_user");
  const [email, setEmail] = useState("user@example.com");
  const [editUsername, setEditUsername] = useState(username);
  const [editEmail, setEditEmail] = useState(email);

  const handlePasswordChange = () => {
    // TODO: API call for password change
    console.log({ currentPassword, newPassword, confirmPassword });
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleEditProfile = () => {
    // TODO: API call for profile update
    setUsername(editUsername);
    setEmail(editEmail);
    setShowEditModal(false);
  };

  const sectionBg = darkMode ? 'bg-gray-900' : 'bg-white';
  const sectionText = darkMode ? 'text-gray-100' : 'text-gray-900';
  const sectionBorder = darkMode ? 'border border-gray-700' : '';
  const labelText = darkMode ? 'text-gray-300' : 'text-gray-700';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-gray-50';
  const inputBorder = darkMode ? 'border-gray-600' : 'border-gray-300';

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-3xl font-semibold transition-colors duration-200">
        <span className={sectionText}>Settings</span>
      </h2>

      {/* Account Section */}
      <section className={`${sectionBg} ${sectionBorder} rounded-lg shadow p-6 space-y-4 transition-colors duration-200`}>
        <h3 className={`flex items-center text-lg font-medium transition-colors duration-200 ${sectionText}`}>
          <User className="w-5 h-5 mr-2" /> Account
        </h3>
        <div className={`space-y-2 transition-colors duration-200 ${labelText}`}>
          <p>
            <span className="font-medium">Username:</span> {username}
          </p>
          <p>
            <span className="font-medium">Email:</span> {email}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setEditUsername(username);
              setEditEmail(email);
              setShowEditModal(true);
            }}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors duration-200"
          >
            <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
          </button>
          <button
            onClick={() => setShowPasswordModal(true)}
            className={`px-4 py-2 rounded transition-colors duration-200 ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            Change Password
          </button>
        </div>
      </section>

      {/* Security Section */}
      <section className={`${sectionBg} ${sectionBorder} rounded-lg shadow p-6 space-y-4 transition-colors duration-200`}>
        <h3 className={`flex items-center text-lg font-medium transition-colors duration-200 ${sectionText}`}>
          <Lock className="w-5 h-5 mr-2" /> Security
        </h3>
        <div className="flex items-center justify-between">
          <span className={labelText}>Two-Factor Authentication</span>
          <Switch
            checked={twoFA}
            onChange={setTwoFA}
            className={`${twoFA ? 'bg-indigo-600' : darkMode ? 'bg-gray-700' : 'bg-gray-200'} relative inline-flex h-5 w-10 rounded-full transition-colors duration-200 focus:outline-none`}
          >
            <span
              className={`${twoFA ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform bg-white rounded-full shadow transition-transform duration-200`}
            />
          </Switch>
        </div>
      </section>

      {/* Notifications Section */}
      <section className={`${sectionBg} ${sectionBorder} rounded-lg shadow p-6 space-y-4 transition-colors duration-200`}>
        <h3 className={`flex items-center text-lg font-medium transition-colors duration-200 ${sectionText}`}>
          <Bell className="w-5 h-5 mr-2" /> Notifications
        </h3>
        {[
          { label: 'Email Notifications', state: emailNotifications, setter: setEmailNotifications },
          { label: 'Push Notifications', state: pushNotifications, setter: setPushNotifications },
        ].map(({ label, state, setter }) => (
          <div key={label} className="flex items-center justify-between">
            <span className={labelText}>{label}</span>
            <Switch
              checked={state}
              onChange={setter}
              className={`${state ? 'bg-indigo-600' : darkMode ? 'bg-gray-700' : 'bg-gray-200'} relative inline-flex h-5 w-10 rounded-full transition-colors duration-200 focus:outline-none`}
            >
              <span
                className={`${state ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform bg-white rounded-full shadow transition-transform duration-200`}
              />
            </Switch>
          </div>
        ))}
      </section>

      {/* Appearance Section */}
      <section className={`${sectionBg} ${sectionBorder} rounded-lg shadow p-6 space-y-4 transition-colors duration-200`}>
        <h3 className={`flex items-center text-lg font-medium transition-colors duration-200 ${sectionText}`}>
          <ShieldCheck className="w-5 h-5 mr-2" /> Appearance
        </h3>
        <div className="flex items-center justify-between">
          <span className={labelText}>{ !darkMode ? "Light Mode" : "Dark Mode"}</span>
        </div>
      </section>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${sectionBg} ${sectionBorder} p-6 rounded-lg shadow-lg w-96 transition-colors duration-200`}>
            <h4 className={`text-lg font-semibold mb-4 transition-colors duration-200 ${sectionText}`}>Edit Profile</h4>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium transition-colors duration-200 ${labelText}`}>Username</label>
                <input
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className={`mt-1 block w-full p-2 rounded border transition-colors duration-200 ${inputBg} ${inputBorder}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium transition-colors duration-200 ${labelText}`}>Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className={`mt-1 block w-full p-2 rounded border transition-colors duration-200 ${inputBg} ${inputBorder}`}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowEditModal(false)}
                className={`px-4 py-2 rounded transition-colors duration-200 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleEditProfile}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${sectionBg} ${sectionBorder} p-6 rounded-lg shadow-lg w-96 transition-colors duration-200`}>
            <h4 className={`text-lg font-semibold mb-4 transition-colors duration-200 ${sectionText}`}>Change Password</h4>
            <div className="space-y-4">
              {[
                { label: 'Current Password', value: currentPassword, setter: setCurrentPassword, type: 'password' },
                { label: 'New Password', value: newPassword, setter: setNewPassword, type: 'password' },
                { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword, type: 'password' },
              ].map(({ label, value, setter, type }) => (
                <div key={label}>
                  <label className={`block text-sm font-medium transition-colors duration-200 ${labelText}`}>{label}</label>
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className={`mt-1 block w-full p-2 rounded border transition-colors duration-200 ${inputBg} ${inputBorder}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className={`px-4 py-2 rounded transition-colors duration-200 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
