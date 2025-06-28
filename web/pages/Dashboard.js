import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { firestore, database } from '../../src/config/firebase';

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeAlerts: 0,
    sosMessages: 0,
    totalReports: 0,
    activeShelters: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load stats from Firebase
        await Promise.all([
          loadActiveAlerts(),
          loadSOSMessages(),
          loadReports(),
          loadShelters(),
          loadRecentActivity()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const loadActiveAlerts = async () => {
    const alertsRef = ref(database, 'alerts');
    onValue(alertsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const activeCount = Object.values(data).filter(alert => alert.isActive).length;
        setStats(prev => ({ ...prev, activeAlerts: activeCount }));
      }
    });
  };

  const loadSOSMessages = async () => {
    try {
      const sosQuery = query(
        collection(firestore, 'sosMessages'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(sosQuery);
      setStats(prev => ({ ...prev, sosMessages: snapshot.size }));
    } catch (error) {
      console.error('Error loading SOS messages:', error);
    }
  };

  const loadReports = async () => {
    try {
      const reportsQuery = query(
        collection(firestore, 'reports'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(reportsQuery);
      setStats(prev => ({ ...prev, totalReports: snapshot.size }));
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadShelters = async () => {
    try {
      const sheltersQuery = query(
        collection(firestore, 'shelters'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(sheltersQuery);
      setStats(prev => ({ ...prev, activeShelters: snapshot.size }));
    } catch (error) {
      console.error('Error loading shelters:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const activities = [];
      
      // Get recent alerts
      const alertsRef = ref(database, 'alerts');
      onValue(alertsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const recentAlerts = Object.entries(data)
            .map(([id, alert]) => ({
              id,
              type: 'alert',
              title: alert.title,
              timestamp: alert.createdAt,
              severity: alert.severity
            }))
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5);
          
          setRecentActivity(recentAlerts);
        }
      });
    } catch (error) {
      console.error('Error loading recent activity:', error);
    }
  };

  const StatCard = ({ title, value, icon, color, description }) => (
    <div className={`bg-white rounded-2xl shadow-lg border-l-4 p-6 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 ${getBorderColorClass(color)}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg ${getIconBgClass(color)} ${getIconTextColorClass(color)}`}>
            {icon}
          </div>
        </div>
        <div className="ml-5 flex-1">
          <p className="text-4xl font-extrabold text-gray-800 mb-0.5">{value}</p>
          <p className="text-md font-semibold text-gray-700">{title}</p>
          <p className="text-xs text-gray-500 mt-1 tracking-wide">{description}</p>
        </div>
      </div>
    </div>
  );

  // Renamed from getColorClasses to avoid confusion
  const getBorderColorClass = (color) => {
    switch (color) {
      case 'red':
        return 'border-danger-500';
      case 'orange':
        return 'border-warning-500';
      case 'blue':
        return 'border-primary-500';
      case 'green':
        return 'border-success-500';
      default:
        return 'border-gray-500';
    }
  };

  const getIconBgClass = (color) => {
    switch (color) {
      case 'red':
        return 'bg-gradient-to-br from-danger-500 to-red-600';
      case 'orange':
        return 'bg-gradient-to-br from-warning-500 to-orange-600';
      case 'blue':
        return 'bg-gradient-to-br from-primary-500 to-indigo-600';
      case 'green':
        return 'bg-gradient-to-br from-success-500 to-emerald-600';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  };

  const getIconTextColorClass = (_color) => {
    // All icon backgrounds are dark gradients, so white text works well.
    return 'text-white';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen"> {/* Changed to h-screen for full page loading */}
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-6 text-lg font-semibold text-gray-700">Loading Dashboard Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 min-h-full"> {/* Updated page background to gray-100 */}
      <div className="px-4 sm:px-6 lg:px-8 py-8"> {/* Increased py */}
        {/* Dashboard Header */}
        <div className="mb-10"> {/* Increased mb */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Emergency Overview</h1>
              <p className="mt-1.5 text-sm text-gray-600 flex items-center">
                <span className="inline-block w-2.5 h-2.5 bg-success-500 rounded-full mr-2.5 animate-pulse"></span>
                System Active • Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <div className="px-4 py-2 bg-success-100 text-success-800 rounded-lg text-sm font-semibold border border-success-200 shadow-sm flex items-center">
                <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"></path></svg>
                All Systems Operational
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10"> {/* Responsive gap */}
          <StatCard
            title="Active Alerts"
            value={stats.activeAlerts}
            icon="🚨"
            color="red"
            description="Critical ongoing incidents"
          />
          <StatCard
            title="SOS Messages"
            value={stats.sosMessages}
            icon="🆘"
            color="orange"
            description="Urgent help requests"
          />
          <StatCard
            title="Total Reports"
            value={stats.totalReports}
            icon="📋"
            color="blue"
            description="Logged incidents & updates"
          />
          <StatCard
            title="Active Shelters"
            value={stats.activeShelters}
            icon="🏠"
            color="green"
            description="Available safe locations"
          />
        </div>

        {/* Dashboard Content - Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-800">Recent Activity Feed</h3>
                <span className="text-xs text-primary-700 bg-primary-100 px-3 py-1 rounded-full font-semibold tracking-wider uppercase">Live</span>
              </div>
            </div>
            <div className="p-6 max-h-[32rem] overflow-y-auto custom-scrollbar"> {/* Added custom-scrollbar if defined */}
              <div className="space-y-5">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ease-in-out hover:border-primary-300">
                      <div className="flex-shrink-0 mt-0.5">
                        <div className={`w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-md ${getIconBgClass(activity.type === 'alert' ? 'red' : 'blue')} ${getIconTextColorClass(activity.type === 'alert' ? 'red' : 'blue')}`}>
                          {activity.type === 'alert' ? '🚨' : '📋'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-md font-semibold text-gray-800 truncate">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {new Date(activity.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                        </p>
                      </div>
                      {activity.severity && (
                        <div className={`self-start mt-1 px-3 py-1 text-xs font-bold tracking-wider uppercase rounded-full shadow-sm ${getSeverityBadgeClass(activity.severity)}`}>
                          {activity.severity}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16"> {/* Increased padding */}
                    <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-800">No Recent Activity</h3>
                    <p className="mt-1 text-sm text-gray-500">New alerts and reports will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-xl shadow-xl border border-gray-200">
            <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-800">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-3.5">
                {[
                  { label: 'Create Emergency Alert', icon: '🚨', color: 'danger' },
                  { label: 'View All Reports', icon: '📋', color: 'primary' },
                  { label: 'Manage Shelters', icon: '🏠', color: 'primary' },
                  { label: 'View Live Map', icon: '🗺️', color: 'primary' }
                ].map((action) => (
                  <button
                    key={action.label}
                    className={`w-full flex items-center justify-center px-5 py-3.5 border text-base font-semibold rounded-lg transition-all duration-200 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2
                      ${action.color === 'danger'
                        ? 'border-transparent text-white bg-gradient-to-r from-danger-500 to-red-600 hover:from-danger-600 hover:to-red-700 focus:ring-danger-500'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-100 focus:ring-primary-500'}`}
                  >
                    <span className="mr-2.5 text-xl">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Footer within the padded page area */}
        <footer className="mt-12 text-center">
          <p className="text-xs text-gray-500">
            SafeHaven Emergency Management Platform &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
};

const getSeverityBadgeClass = (severity) => {
  switch (severity.toLowerCase()) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default Dashboard;
