import React, { useState, useEffect } from 'react';
import { UserRole } from '../../src/config/firebase';

const Header = ({ user, userProfile, onLogout, onMenuClick }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const isAdmin = userProfile?.role === UserRole.ADMIN;

  return (
    <header className="bg-white shadow-md border-b border-gray-200 px-4 sm:px-6 py-3.5 flex-shrink-0 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left Section: Menu Toggle and Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-150"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>

          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold text-gray-800">Dashboard Overview</h1>
            <p className="text-xs text-gray-500">{formatTime(currentTime)}</p>
          </div>
        </div>

        {/* Right Section: Status, User Info, Logout */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          <div className="hidden sm:flex items-center px-3 py-1.5 bg-success-50 text-success-700 rounded-full text-xs font-semibold border border-success-200 shadow-sm">
            <span className="w-2 h-2 bg-success-500 rounded-full mr-2 animate-pulse"></span>
            System Status: <span className="ml-1 font-bold">Operational</span>
          </div>

          {/* User Avatar and Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-indigo-500 flex items-center justify-center text-white font-semibold shadow-sm ring-2 ring-white">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : (user?.email ? user.email.charAt(0).toUpperCase() : 'U')}
            </div>
            <div className="hidden md:block text-sm">
              <p className="font-semibold text-gray-800 truncate max-w-32">
                {userProfile?.displayName || user?.displayName || 'Valued User'}
              </p>
              <p className="text-xs text-gray-500">
                {isAdmin ? 'Administrator' : 'Team Member'}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-3.5 py-2.5 text-sm font-medium text-gray-600 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-danger-500 group"
            title="Logout"
          >
            <svg className="w-5 h-5 transition-transform duration-150 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
