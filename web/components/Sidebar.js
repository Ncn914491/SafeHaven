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
    <div className="w-64 bg-white shadow-lg h-full flex flex-col border-r border-gray-100">
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white text-xl">🛡️</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">SafeHaven</h1>
            <p className="text-sm text-gray-500 font-medium">Emergency Management</p>
          </div>
        </div>

        {/* User Role Badge */}
        <div className="mt-4">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
            isAdmin
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {isAdmin ? '👑 Admin' : '👤 User'}
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
              currentPage === item.page
                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span className="text-xl flex-shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.label}</p>
              <p className="text-xs text-gray-500 truncate">{item.description}</p>
            </div>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">System Online</span>
        </div>
        {userProfile && (
          <div className="text-xs text-gray-500 truncate">
            {userProfile.displayName || userProfile.email || 'User'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
