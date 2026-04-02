import React from 'react'
import { Link } from 'react-router-dom'

const FooterLanding = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='bg-gray-900 text-white w-full transition-colors duration-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-12'>
          <div className='text-center sm:text-left'>
            <h3 className='text-xl sm:text-2xl font-bold mb-3 sm:mb-4'>CGPA Calculator</h3>
            <p className='text-gray-400 text-sm leading-relaxed mb-4 sm:mb-6 max-w-xs mx-auto sm:mx-0'>
              A simple and effective tool to help students track their academic progress and achieve their goals.
            </p>
          </div>

          <div className='text-center sm:text-left'>
            <h4 className='font-semibold text-base sm:text-lg mb-3 sm:mb-4'>Quick Links</h4>
            <ul className='space-y-2 sm:space-y-3'>
              <li>
                <a href='#home' className='text-gray-400 hover:text-white transition-colors text-sm'>
                  Home
                </a>
              </li>
              <li>
                <a href='#features' className='text-gray-400 hover:text-white transition-colors text-sm'>
                  Features
                </a>
              </li>
              <li>
                <Link to='/login' className='text-gray-400 hover:text-white transition-colors text-sm'>
                  Login
                </Link>
              </li>
              <li>
                <Link to='/signup' className='text-gray-400 hover:text-white transition-colors text-sm'>
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          <div className='text-center sm:text-left sm:col-span-2 lg:col-span-1'>
            <h4 className='font-semibold text-base sm:text-lg mb-3 sm:mb-4'>Support</h4>
            <ul className='space-y-2 sm:space-y-3'>
              <li>
                <a href='mailto:support@cgpacalculator.com' className='text-gray-400 hover:text-white transition-colors text-sm'>
                  Contact Us
                </a>
              </li>
              <li>
                <a href='#' className='text-gray-400 hover:text-white transition-colors text-sm'>
                  Help Center
                </a>
              </li>
              <li>
                <a href='#' className='text-gray-400 hover:text-white transition-colors text-sm'>
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href='#' className='text-gray-400 hover:text-white transition-colors text-sm'>
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className='border-t border-gray-800 pt-6 sm:pt-8'>
          <div className='text-center'>
            <p className='text-xs sm:text-sm text-gray-400'>
              &copy; {currentYear} CGPA Calculator. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default FooterLanding