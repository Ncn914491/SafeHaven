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
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200 ${getColorClasses(color)}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${getIconBgClass(color)}`}>
            {icon}
          </div>
        </div>
        <div className="ml-5 flex-1">
          <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
          <div className="text-sm font-semibold text-gray-700">{title}</div>
          <div className="text-xs text-gray-500 mt-1">{description}</div>
        </div>
      </div>
    </div>
  );

  const getColorClasses = (color) => {
    switch (color) {
      case 'red':
        return 'border-l-4 border-red-500';
      case 'orange':
        return 'border-l-4 border-orange-500';
      case 'blue':
        return 'border-l-4 border-blue-500';
      case 'green':
        return 'border-l-4 border-green-500';
      default:
        return 'border-l-4 border-gray-500';
    }
  };

  const getIconBgClass = (color) => {
    switch (color) {
      case 'red':
        return 'bg-red-100 text-red-600';
      case 'orange':
        return 'bg-orange-100 text-orange-600';
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Emergency Management Overview</h1>
              <p className="mt-2 text-sm text-gray-600 flex items-center">
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                System Active • Last updated: {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="hidden sm:flex items-center space-x-2">
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✅ All Systems Operational
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Alerts"
            value={stats.activeAlerts}
            icon="🚨"
            color="red"
            description="Current emergency alerts"
          />
          <StatCard
            title="SOS Messages"
            value={stats.sosMessages}
            icon="🆘"
            color="orange"
            description="Pending emergency requests"
          />
          <StatCard
            title="Total Reports"
            value={stats.totalReports}
            icon="📋"
            color="blue"
            description="Incident reports filed"
          />
          <StatCard
            title="Active Shelters"
            value={stats.activeShelters}
            icon="🏠"
            color="green"
            description="Emergency shelters available"
          />
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Live</span>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
                          {activity.type === 'alert' ? '🚨' : '📋'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {activity.severity && (
                        <div className={`px-3 py-1 text-xs font-semibold rounded-full ${getSeverityBadgeClass(activity.severity)}`}>
                          {activity.severity.toUpperCase()}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">📋</div>
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <button className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-sm hover:shadow-md">
                  <span className="mr-2">🚨</span>
                  Create Emergency Alert
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md">
                  <span className="mr-2">📋</span>
                  View All Reports
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 border border-gray-200 text-sm font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md">
                  <span className="mr-2">🏠</span>
                  Manage Shelters
                </button>
              </div>
            </div>
          </div>
        </div>
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
