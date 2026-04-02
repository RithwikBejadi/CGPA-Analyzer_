import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSun, FiBell, FiTrash2, FiShield, FiMail } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useModal } from '../../hooks/useModal';

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const deleteModal = useModal();
  const changePasswordModal = useModal();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    twoFactor: false
  });
  
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  
  // Change password state
  const [passwordStep, setPasswordStep] = useState(1); // 1: Enter current password, 2: Enter code + new password
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for code expiration
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      setDeleteError('');
      
      // Validate password is entered
      if (!deletePassword) {
        setDeleteError('Please enter your password to confirm');
        setDeleteLoading(false);
        return;
      }
      
      const response = await fetch('/api/users/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          password: deletePassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      // Logout and redirect to home
      await logout();
      navigate('/');
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSendVerificationCode = async (e) => {
    e.preventDefault();
    
    setPasswordError('');
    
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    
    try {
      setPasswordLoading(true);
      
      const response = await fetch('/api/users/request-password-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setCodeSent(true);
      setPasswordStep(2);
      setCountdown(300); // 5 minutes = 300 seconds
      
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    setPasswordError('');
    setPasswordSuccess(false);
    
    // Validation
    if (!passwordData.verificationCode || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    
    if (passwordData.verificationCode.length !== 6) {
      setPasswordError('Verification code must be 6 digits');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    try {
      setPasswordLoading(true);
      
      const response = await fetch('/api/users/change-password-verified', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          verificationCode: passwordData.verificationCode,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordSuccess(true);
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        handleClosePasswordModal();
      }, 1500);
      
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClosePasswordModal = () => {
    changePasswordModal.close();
    setPasswordStep(1);
    setCodeSent(false);
    setCountdown(0);
    setPasswordData({
      currentPassword: '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setPasswordSuccess(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const Section = ({ title, icon, children }) => (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
        <div className="p-2 bg-white rounded-lg shadow-sm text-gray-600">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6 space-y-6">
        {children}
      </div>
    </div>
  );

  const Toggle = ({ label, description, checked, onChange }) => (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-900">{label}</h3>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your application preferences and account settings</p>
        </div>

        <Section title="Appearance" icon={<FiSun className="w-5 h-5" />}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Theme</h3>
              <p className="text-xs text-gray-500 mt-1">This application uses a clean light theme</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
              <FiSun className="w-4 h-4" /> Light
            </div>
          </div>
        </Section>

        <Section title="Privacy & Security" icon={<FiShield className="w-5 h-5" />}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
              <p className="text-xs text-gray-500 mt-1">Update your account password</p>
            </div>
            <button 
              onClick={changePasswordModal.open}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Update
            </button>
          </div>
        </Section>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="bg-red-50 rounded-xl p-6 border border-red-100">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 rounded-lg text-red-600">
                <FiTrash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-900">Delete Account</h3>
                <p className="text-sm text-red-700 mt-1">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button 
                  onClick={deleteModal.open}
                  className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Change Password Modal */}
      <Modal
        isOpen={changePasswordModal.isOpen}
        onClose={handleClosePasswordModal}
        title={passwordStep === 1 ? "Verify Your Identity" : "Change Password"}
        size="md"
      >
        {passwordError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
            {passwordError}
          </div>
        )}
        
        {passwordSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">
            Password changed successfully!
          </div>
        )}

        {passwordStep === 1 ? (
          <form onSubmit={handleSendVerificationCode} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <FiMail className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Email verification required</p>
                <p className="text-xs mt-1">We'll send a 6-digit code to <strong>{user?.email}</strong> to verify it's really you.</p>
              </div>
            </div>

            <Input
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="Enter your current password"
              required
              autoFocus
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClosePasswordModal}
                disabled={passwordLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={passwordLoading}
                disabled={passwordLoading}
                className="flex-1"
              >
                {passwordLoading ? 'Sending...' : 'Send Code'}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
              <p className="font-medium">✓ Verification code sent!</p>
              <p className="text-xs mt-1">Check your email at <strong>{user?.email}</strong></p>
              {countdown > 0 && (
                <p className="text-xs mt-1">Code expires in: <strong>{formatTime(countdown)}</strong></p>
              )}
            </div>

            <Input
              label="Verification Code"
              type="text"
              value={passwordData.verificationCode}
              onChange={(e) => setPasswordData(prev => ({ ...prev, verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
              placeholder="Enter 6-digit code"
              required
              autoFocus
              maxLength={6}
            />

            <Input
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Enter new password (min 6 characters)"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirm new password"
              required
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setPasswordStep(1);
                  setCodeSent(false);
                  setPasswordData(prev => ({ ...prev, verificationCode: '', newPassword: '', confirmPassword: '' }));
                  setPasswordError('');
                }}
                disabled={passwordLoading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                type="submit"
                loading={passwordLoading}
                disabled={passwordLoading || passwordSuccess}
                className="flex-1"
              >
                {passwordLoading ? 'Updating...' : 'Change Password'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Account Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => {
          deleteModal.close();
          setDeletePassword('');
          setDeleteError('');
        }}
        title="Delete Account"
        size="md"
      >
        <div className="space-y-4">
          {deleteError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {deleteError}
            </div>
          )}
          
          <div className="space-y-3">
            <p className="text-gray-900 font-medium">Are you absolutely sure?</p>
            <p className="text-sm text-gray-600">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers including:
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 ml-2">
              <li>All your semester records</li>
              <li>Subject grades and CGPA history</li>
              <li>Profile information</li>
              <li>Account credentials</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">⚠️ Verification Required</p>
            <p className="text-xs text-yellow-700 mt-1">Enter your password to confirm account deletion</p>
          </div>

          <Input
            label="Password"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            placeholder="Enter your password to confirm"
            required
            autoFocus
          />

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                deleteModal.close();
                setDeletePassword('');
                setDeleteError('');
              }}
              disabled={deleteLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteLoading || !deletePassword}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
