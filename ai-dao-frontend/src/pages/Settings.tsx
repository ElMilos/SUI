import React, { useState } from "react";
import { User, ShieldCheck, Bell, Lock, Edit2 } from "lucide-react";
import { Switch } from "@headlessui/react";

const Settings: React.FC = () => {
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

  return (
    <div className="space-y-8 p-6">
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
        Settings
      </h2>

      {/* Account Section */}
      <section className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
        <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-gray-100">
          <User className="w-5 h-5 mr-2" /> Account
        </h3>
        <div className="space-y-2 text-gray-600 dark:text-gray-300">
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
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
          </button>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Change Password
          </button>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
        <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-gray-100">
          <Lock className="w-5 h-5 mr-2" /> Security
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">
            Two-Factor Authentication
          </span>
          <Switch
            checked={twoFA}
            onChange={setTwoFA}
            className={`${
              twoFA ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
            } relative inline-flex h-5 w-10 rounded-full transition-colors focus:outline-none`}
          >
            <span
              className={`${
                twoFA ? "translate-x-5" : "translate-x-0"
              } inline-block h-5 w-5 transform bg-white rounded-full shadow transition-transform`}
            />
          </Switch>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
        <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-gray-100">
          <Bell className="w-5 h-5 mr-2" /> Notifications
        </h3>
        {[
          {
            label: "Email Notifications",
            state: emailNotifications,
            setter: setEmailNotifications,
          },
          {
            label: "Push Notifications",
            state: pushNotifications,
            setter: setPushNotifications,
          },
        ].map(({ label, state, setter }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">{label}</span>
            <Switch
              checked={state}
              onChange={setter}
              className={`${
                state ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
              } relative inline-flex h-5 w-10 rounded-full transition-colors focus:outline-none`}
            >
              <span
                className={`${
                  state ? "translate-x-5" : "translate-x-0"
                } inline-block h-5 w-5 transform bg-white rounded-full shadow transition-transform`}
              />
            </Switch>
          </div>
        ))}
      </section>

      {/* Appearance Section */}
      <section className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 space-y-4">
        <h3 className="flex items-center text-lg font-medium text-gray-900 dark:text-gray-100">
          <ShieldCheck className="w-5 h-5 mr-2" /> Appearance
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
        </div>
      </section>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-96">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Edit Profile
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <input
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="mt-1 block w-full p-2 border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="mt-1 block w-full p-2 border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleEditProfile}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
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
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-96">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Change Password
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1 block w-full p-2 border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full p-2 border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full p-2 border rounded dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
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
