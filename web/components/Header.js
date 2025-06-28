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
    <header className="bg-white shadow-sm border-b border-gray-100 px-4 sm:px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Emergency Management Dashboard</h1>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <div className="flex items-center mr-4">
                <span className="mr-2">🕐</span>
                <span>{formatTime(currentTime)}</span>
              </div>
              <div className="hidden sm:flex items-center">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                <span className="text-xs text-green-600 font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-6">
          {/* Emergency Status */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className="flex items-center px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <span className="mr-1">✅</span>
              <span className="hidden md:inline">Normal Operations</span>
              <span className="md:hidden">Normal</span>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm">👤</span>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                  {userProfile?.displayName || user?.displayName || user?.email || 'User'}
                </div>
                <div className="text-xs text-gray-500">
                  {isAdmin ? 'Emergency Coordinator' : 'Emergency Observer'}
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
