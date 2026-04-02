import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { FiMoon, FiSun } from 'react-icons/fi'
import { useTheme } from '../../contexts/ThemeContext'
import Logo from '../../assets/Logo.png'

const NavbarLanding = () => {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState(null)

  const handleLoginClick = () => {
    navigate('/login')
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const needsProfileCompletion = user && user.college && user.college.name === 'Default College'

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to fetch user', err);
        setUser(null);
      }
    })();
    return () => { mounted = false };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
    } catch (err) {
      console.error('Logout error', err);
    }
    setUser(null);
    navigate('/');
  };

  return (
    <nav className='sticky top-0 z-50 bg-white/80/80 backdrop-blur-md border-b border-gray-200 w-full transition-colors duration-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center cursor-pointer' onClick={() => navigate('/')}>
            <img src={Logo} alt="CGPA Calculator" className='h-8 w-8 sm:h-10 sm:w-10'/>
            <span className='ml-2 text-lg sm:text-xl font-semibold tracking-tight text-gray-900'>CGPA Calculator</span>
          </div>

          <div className='flex items-center gap-4 sm:gap-6 lg:gap-8'>
            <button 
              onClick={() => scrollToSection('home')}
              className='hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900:text-white transition-colors duration-200'
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('features')}
              className='hidden sm:block text-sm font-medium text-gray-600 hover:text-gray-900:text-white transition-colors duration-200'
            >
              Features
            </button>
            <a href="#about" className='hidden md:block text-sm font-medium text-gray-600 hover:text-gray-900:text-white transition-colors duration-200'>
              About
            </a>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200:bg-navy-600 transition-colors"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === 'dark' ? (
                <FiSun className="w-4 h-4" />
              ) : (
                <FiMoon className="w-4 h-4" />
              )}
            </button>
            
            {user ? (
              <button onClick={handleLogout} className='px-4 sm:px-5 py-2 bg-white text-black text-xs sm:text-sm font-medium rounded-full hover:bg-gray-100:bg-gray-200 hover:ring-2 hover:ring-gray-300:ring-white transition-all duration-300 transform hover:scale-105'>
                Logout
              </button>
            ) : (
              <Link to="/login" className='px-4 sm:px-5 py-2 bg-white text-black text-xs sm:text-sm font-medium rounded-full hover:bg-gray-100:bg-gray-200 hover:ring-2 hover:ring-gray-300:ring-white transition-all duration-300 transform hover:scale-105'>
                Login
              </Link>
            )}
          </div>
        </div>
        {needsProfileCompletion && (
          <div className='bg-yellow-50/20 border-t border-b border-yellow-200 text-yellow-900 py-3 px-4 sm:px-6 text-center text-sm'>
            It looks like you signed up with Google. Please <Link to="/complete-profile" className='underline font-medium'>complete your profile</Link> by choosing your college.
          </div>
        )}
      </div>
    </nav>
  )
}

export default NavbarLanding