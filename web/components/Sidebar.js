import React from 'react';
import { UserRole } from '../../src/config/firebase';

const Sidebar = ({ currentPage, onNavigate, isAdmin, userProfile }) => {

  const allMenuItems = [
    {
      page: 'dashboard',
      icon: '📊',
      label: 'Dashboard',
      description: 'Overview & Statistics',
      roles: [UserRole.ADMIN, UserRole.USER]
    },
    {
      page: 'alerts',
      icon: '🚨',
      label: 'Active Alerts',
      description: 'View Disaster Alerts',
      roles: [UserRole.ADMIN, UserRole.USER]
    },
    {
      page: 'sos-messages',
      icon: '🆘',
      label: 'SOS Messages',
      description: 'Emergency Requests',
      roles: [UserRole.ADMIN, UserRole.USER]
    },
    {
      page: 'reports',
      icon: '📋',
      label: 'Reports',
      description: 'Incident Reports',
      roles: [UserRole.ADMIN, UserRole.USER]
    },
    {
      page: 'shelters',
      icon: '🏠',
      label: 'Shelters',
      description: 'Emergency Shelters',
      roles: [UserRole.ADMIN, UserRole.USER]
    },
    {
      page: 'maps',
      icon: '🗺️',
      label: 'Maps',
      description: 'Emergency Response Map',
      roles: [UserRole.ADMIN, UserRole.USER]
    },
    {
      page: 'create-alert',
      icon: '➕',
      label: 'Create Alert',
      description: 'New Emergency Alert',
      roles: [UserRole.ADMIN] // Admin only
    }
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item =>
    item.roles.includes(userProfile?.role || UserRole.USER)
  );

  return (
    <div className="w-72 bg-white shadow-xl h-full flex flex-col border-r border-gray-200">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <span className="text-white text-2xl">🛡️</span> {/* Shield Icon */}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 group-hover:text-primary-700 transition-colors">SafeHaven</h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide">Emergency Platform</p>
          </div>
        </div>

        {/* User Role Badge */}
        <div className="mt-5">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm ${
            isAdmin
              ? 'bg-danger-100 text-danger-700 border border-danger-200'
              : 'bg-primary-100 text-primary-700 border border-primary-200'
          }`}>
            {isAdmin ? '👑 Adminstrator' : '👤 Standard User'}
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl text-left transition-all duration-200 ease-in-out group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 ${
              currentPage === item.page
                ? 'bg-gradient-to-r from-primary-500 to-indigo-600 text-white shadow-lg scale-105'
                : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700 hover:shadow-sm'
            }`}
            title={item.label}
          >
            <span className={`text-2xl flex-shrink-0 transition-transform duration-200 ${currentPage === item.page ? '' : 'group-hover:scale-110'}`}>{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${currentPage === item.page ? 'text-white' : 'text-gray-800 group-hover:text-primary-700'}`}>{item.label}</p>
              <p className={`text-xs truncate ${currentPage === item.page ? 'text-primary-100' : 'text-gray-500 group-hover:text-primary-600'}`}>{item.description}</p>
            </div>
            {currentPage === item.page && (
              <span className="w-2 h-2 bg-white rounded-full opacity-75 animate-pulse"></span>
            )}
          </button>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-5 border-t border-gray-200 flex-shrink-0 bg-gray-50">
        {userProfile && (
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 bg-gray-300 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600 ring-2 ring-white shadow">
              {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : (userProfile.email ? userProfile.email.charAt(0).toUpperCase() : 'U')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">{userProfile.displayName || userProfile.email || 'Authenticated User'}</p>
              <p className="text-xs text-gray-500">Status: Online</p>
            </div>
          </div>
        )}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${'bg-success-500'}`}></div>
          <span>System Operational</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
