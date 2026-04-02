import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../index.css'
import NavbarLanding from './NavbarLanding'
import Body1 from './Body1'
import FooterLanding from './FooterLanding'
import { useAuth } from '../../contexts/AuthContext'

const Landing = () => {
  const navigate = useNavigate()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-white w-full overflow-x-hidden transition-colors duration-200'>
      <NavbarLanding/>
      <Body1/>
      <FooterLanding/>
    </div>
  )
}

export default Landing