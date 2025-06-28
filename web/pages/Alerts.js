import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update, remove } from 'firebase/database';
import { database } from '../../src/config/firebase';
import LocationFilter from '../components/LocationFilter';
import { filterAlertsByLocation } from '../../src/services/locationFilter';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  useEffect(() => {
    const alertsRef = ref(database, 'alerts');

    const unsubscribe = onValue(alertsRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const alertsArray = Object.entries(data).map(([id, alert]) => ({
            id,
            ...alert
          })).sort((a, b) => b.createdAt - a.createdAt);

          setAlerts(alertsArray);
          setError('');
        } else {
          setAlerts([]);
        }
      } catch (err) {
        console.error('Error loading alerts:', err);
        setError('Failed to load alerts. Please try again.');
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error('Firebase error:', err);
      setError('Failed to connect to database. Please check your connection.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Apply filters whenever alerts, location filters, or status filter changes
  useEffect(() => {
    let filtered = alerts;

    // Apply location filter
    if (selectedState || selectedDistrict) {
      filtered = filterAlertsByLocation(filtered, {
        state: selectedState,
        district: selectedDistrict
      });
    }

    // Apply status filter
    if (filter === 'active') {
      filtered = filtered.filter(alert => alert.isActive);
    } else if (filter === 'inactive') {
      filtered = filtered.filter(alert => !alert.isActive);
    }

    setFilteredAlerts(filtered);
  }, [alerts, selectedState, selectedDistrict, filter]);

  const handleLocationChange = (state, district) => {
    setSelectedState(state);
    setSelectedDistrict(district);
  };

  const handleToggleAlert = async (alertId, currentStatus) => {
    try {
      const alertRef = ref(database, `alerts/${alertId}`);
      await update(alertRef, {
        isActive: !currentStatus,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error('Error toggling alert:', error);
      alert('Failed to update alert status');
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (window.confirm('Are you sure you want to delete this alert? This action cannot be undone.')) {
      try {
        const alertRef = ref(database, `alerts/${alertId}`);
        await remove(alertRef);
      } catch (error) {
        console.error('Error deleting alert:', error);
        alert('Failed to delete alert');
      }
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'natural_disaster': return '🌪️';
      case 'fire': return '🔥';
      case 'medical': return '🏥';
      case 'security': return '🚨';
      case 'infrastructure': return '🏗️';
      default: return '⚠️';
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Emergency Alerts</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor emergency alerts across India
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <LocationFilter
          onLocationChange={handleLocationChange}
          selectedState={selectedState}
          selectedDistrict={selectedDistrict}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Alerts ({alerts.length})</option>
          <option value="active">Active ({alerts.filter(a => a.isActive).length})</option>
          <option value="inactive">Inactive ({alerts.filter(a => !a.isActive).length})</option>
        </select>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {!error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-blue-800">
              Showing {filteredAlerts.length} of {alerts.length} alerts
              {(selectedState || selectedDistrict) && (
                <span className="ml-1">
                  for {selectedDistrict ? `${selectedDistrict}, ` : ''}{selectedState || 'All India'}
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div key={alert.id} className={`bg-white rounded-lg shadow-sm border-l-4 ${
              alert.isActive ? 'border-green-500' : 'border-gray-300'
            } hover:shadow-md transition-shadow`}>
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(alert.type)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity?.toUpperCase() || 'UNKNOWN'}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {alert.type?.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        alert.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.isActive ? '🟢 ACTIVE' : '⚫ INACTIVE'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleAlert(alert.id, alert.isActive)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        alert.isActive
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {alert.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="px-3 py-1.5 text-sm font-medium text-red-800 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-700 mb-3">{alert.description}</p>

                  {alert.location && (
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <span className="mr-2">📍</span>
                      <span>
                        {alert.location.address ||
                         `${alert.location.state || ''} ${alert.location.district || ''} (${alert.location.latitude}, ${alert.location.longitude})`}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Created:</span>
                      <span className="ml-1">{formatDate(alert.createdAt)}</span>
                    </div>
                    {alert.updatedAt && (
                      <div>
                        <span className="font-medium">Updated:</span>
                        <span className="ml-1">{formatDate(alert.updatedAt)}</span>
                      </div>
                    )}
                    {alert.expiresAt && (
                      <div>
                        <span className="font-medium">Expires:</span>
                        <span className="ml-1">{formatDate(alert.expiresAt)}</span>
                      </div>
                    )}
                    {alert.radius && (
                      <div>
                        <span className="font-medium">Radius:</span>
                        <span className="ml-1">{alert.radius} km</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚨</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-500">
              {filter === 'active'
                ? 'No active alerts at this time.'
                : filter === 'inactive'
                ? 'No inactive alerts found.'
                : (selectedState || selectedDistrict)
                ? `No alerts found for ${selectedDistrict ? `${selectedDistrict}, ` : ''}${selectedState || 'selected location'}.`
                : 'No alerts have been created yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
