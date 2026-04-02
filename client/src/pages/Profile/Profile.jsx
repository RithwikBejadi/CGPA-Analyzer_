import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiMail, FiBook, FiEdit2, FiSave, FiX, FiLock, FiChevronDown, FiSearch } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../config/axios';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    collegeId: user?.collegeId || '',
    collegeName: user?.college?.name || '',
  });
  const [colleges, setColleges] = useState([]);
  const [collegeSearch, setCollegeSearch] = useState('');
  const [collegeDropOpen, setCollegeDropOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const dropRef = useRef(null);

  // Fetch colleges list when editing starts
  useEffect(() => {
    if (isEditing && colleges.length === 0) {
      axios.get('/api/colleges')
        .then(r => setColleges(r.data.colleges || []))
        .catch(() => {});
    }
  }, [isEditing]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setCollegeDropOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredColleges = colleges.filter(c =>
    c.name.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const handleEdit = () => {
    setFormData({
      username: user?.username || '',
      collegeId: user?.collegeId || '',
      collegeName: user?.college?.name || '',
    });
    setCollegeSearch('');
    setError('');
    setSuccess('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    setCollegeDropOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const body = { username: formData.username };
      if (formData.collegeId && formData.collegeId !== user?.collegeId) {
        body.collegeId = formData.collegeId;
      }

      const response = await axios.patch('/api/users/me', body);

      updateUser(response.data);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-colors duration-200">
          {/* Header / Cover */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
            <div className="absolute -bottom-12 left-8">
              <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-lg">
                <div className="w-full h-full bg-white rounded-xl flex items-center justify-center text-black text-3xl font-bold border-2 border-gray-200">
                  {user?.username?.slice(0, 2).toUpperCase() || 'US'}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-16 pb-8 px-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
                <p className="text-gray-500">{user?.email}</p>
                {user?.college?.name && (
                  <p className="text-sm text-blue-600 mt-0.5 flex items-center gap-1">
                    <FiBook className="w-3.5 h-3.5" /> {user.college.name}
                  </p>
                )}
              </div>
              {!isEditing && (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                >
                  <FiEdit2 className="w-4 h-4" /> Edit Profile
                </button>
              )}
            </div>

            {success && !isEditing && (
              <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Username */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Username</label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={e => { setFormData(p => ({ ...p, username: e.target.value })); setError(''); }}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white text-gray-900"
                        placeholder="Enter username"
                      />
                    </div>
                  </div>

                  {/* Email — read-only */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      Email
                      <span className="flex items-center gap-0.5 text-xs text-gray-400 font-normal">
                        <FiLock className="w-3 h-3" /> cannot be changed
                      </span>
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-3 text-gray-300" />
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>

                  {/* University — searchable dropdown */}
                  <div className="space-y-2 md:col-span-2" ref={dropRef}>
                    <label className="text-sm font-medium text-gray-700">University</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => { setCollegeDropOpen(v => !v); setCollegeSearch(''); }}
                        className="w-full flex items-center justify-between pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-left focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white hover:border-gray-300"
                      >
                        <FiBook className="absolute left-3 top-3 text-gray-400" />
                        <span className={formData.collegeName ? 'text-gray-900' : 'text-gray-400'}>
                          {formData.collegeName || 'Select university…'}
                        </span>
                        <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${collegeDropOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <AnimatePresence>
                        {collegeDropOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
                          >
                            {/* Search box */}
                            <div className="p-2 border-b border-gray-100">
                              <div className="relative">
                                <FiSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                                <input
                                  type="text"
                                  autoFocus
                                  value={collegeSearch}
                                  onChange={e => setCollegeSearch(e.target.value)}
                                  placeholder="Search universities…"
                                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-gray-900"
                                />
                              </div>
                            </div>

                            {/* List */}
                            <ul className="max-h-52 overflow-y-auto">
                              {filteredColleges.length === 0 ? (
                                <li className="px-4 py-3 text-sm text-gray-400 text-center">No universities found</li>
                              ) : (
                                filteredColleges.map(c => (
                                  <li key={c.id}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFormData(p => ({ ...p, collegeId: c.id, collegeName: c.name }));
                                        setCollegeDropOpen(false);
                                        setCollegeSearch('');
                                      }}
                                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 hover:text-blue-700 ${
                                        formData.collegeId === c.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                                      }`}
                                    >
                                      {c.name}
                                    </button>
                                  </li>
                                ))
                              )}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2">
                    {error}
                  </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <FiX className="w-4 h-4" /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <FiSave className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Account Info</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <FiMail className="w-5 h-5 text-gray-400 shrink-0" />
                        <span>{user?.email}</span>
                      </div>
                      {user?.college?.name && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <FiBook className="w-5 h-5 text-gray-400 shrink-0" />
                          <span>{user.college.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Account Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[['—', 'Semesters'], ['—', 'Current CGPA'], ['—', 'Courses'], ['—', 'Credits']].map(([val, label]) => (
                      <div key={label} className="bg-white p-4 rounded-lg shadow-sm border border-transparent">
                        <div className="text-2xl font-bold text-gray-900">{val}</div>
                        <div className="text-xs text-gray-500 mt-1">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
