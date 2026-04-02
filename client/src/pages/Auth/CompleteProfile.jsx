import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../../assets/Logo.png'

const CompleteProfile = () => {
  const [colleges, setColleges] = useState([])
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAddCollege, setShowAddCollege] = useState(false)
  const [newCollegeName, setNewCollegeName] = useState('')
  const navigate = useNavigate()

  const handleAddCollege = async (e) => {
    e.preventDefault();
    setError(null);
    if (!newCollegeName.trim()) {
      setError('College name is required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCollegeName.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          // College already exists, we can use it
          setSelected(data.college.id);
          setShowAddCollege(false);
        } else {
          setError(data.error || 'Failed to add college');
        }
        return;
      }
      // Add the new college to the list and select it
      setColleges(prev => [...prev, data.college]);
      setSelected(data.college.id);
      setShowAddCollege(false);
      setNewCollegeName('');
    } catch (err) {
      console.error('Failed to add college:', err);
      setError('Failed to add college. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/colleges')
        const text = await res.text()
        const data = text ? JSON.parse(text) : null
        if (data?.colleges) setColleges(data.colleges)
      } catch (err) {
        console.error('Failed to load colleges', err)
      }
    })()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!selected) {
      setError('Please choose your college')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/users/me/college', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ collegeId: selected })
      })
      const text = await res.text()
      const data = text ? JSON.parse(text) : null
      if (!res.ok) {
        setError(data?.error || 'Unable to update college')
        setLoading(false)
        return
      }
      navigate('/')
    } catch (err) {
      console.error(err)
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8 sm:py-12 w-full transition-colors duration-200">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-transparent">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-6 gap-3">
            <img src={Logo} alt="CGPA Calculator" className="h-10 w-10 sm:h-12 sm:w-12" />
            <h1 className="text-xl sm:text-2xl font-semibold text-center text-gray-900">Complete your profile</h1>
          </div>

          {error && <div className="text-red-600 text-sm mb-4 text-center bg-red-50/20 border border-red-200 rounded-lg p-2">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">College</label>
              {!showAddCollege ? (
                <div className="space-y-2">
                  <select 
                    value={selected} 
                    onChange={e => setSelected(e.target.value)} 
                    required 
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base bg-white text-gray-900"
                  >
                    <option value="">Select your college</option>
                    {colleges.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowAddCollege(true)}
                    className="text-sm text-gray-600 hover:text-gray-900:text-white font-medium mt-1 block"
                  >
                    Can't find your college? Add it here
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCollegeName}
                      onChange={(e) => setNewCollegeName(e.target.value)}
                      placeholder="Enter college name"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base bg-white text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={handleAddCollege}
                      disabled={loading}
                      className="px-4 py-2.5 bg-white text-black rounded-lg text-sm sm:text-base font-medium hover:bg-gray-100:bg-gray-200 transition disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCollege(false);
                      setNewCollegeName('');
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900:text-white font-medium"
                  >
                    ← Back to college selection
                  </button>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full bg-white text-black py-2.5 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-100:bg-gray-200 transition disabled:opacity-50">
              {loading ? 'Saving...' : 'Save and continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CompleteProfile
