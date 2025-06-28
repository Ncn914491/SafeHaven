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
    <div className="space-y-8 p-0"> {/* Removed default padding from parent, will add to sections */}
      {/* Header Section */}
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Emergency Alerts</h1>
            <p className="mt-1.5 text-sm text-gray-600">
              View, manage, and monitor all emergency alerts.
            </p>
          </div>
          {/* Can add a "Create New Alert" button here if needed, linking to CreateAlert page */}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Filter Alerts</h2>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-grow w-full md:w-auto">
            <LocationFilter
              onLocationChange={handleLocationChange}
              selectedState={selectedState}
              selectedDistrict={selectedDistrict}
            />
          </div>
          <div className="w-full md:w-auto md:min-w-[200px]">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
            >
              <option value="all">All Alerts ({alerts.length})</option>
              <option value="active">Active ({alerts.filter(a => a.isActive).length})</option>
              <option value="inactive">Inactive ({alerts.filter(a => !a.isActive).length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-danger-50 border-l-4 border-danger-500 text-danger-700 p-4 rounded-md shadow">
          <div className="flex">
            <div className="py-1">
              <svg className="fill-current h-6 w-6 text-danger-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/></svg>
            </div>
            <div>
              <p className="font-bold">Error Loading Alerts</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {!error && (
        <div className="bg-primary-50 border-l-4 border-primary-500 text-primary-700 p-4 rounded-md shadow">
           <div className="flex">
            <div className="py-1">
              <svg className="fill-current h-6 w-6 text-primary-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11 9V5H9v6h4v-2H11zM9 15v-2h2v2H9z"/></svg>
            </div>
            <div>
              <p className="font-bold">
                Displaying {filteredAlerts.length} of {alerts.length} total alerts.
              </p>
              {(selectedState || selectedDistrict) && (
                <p className="text-sm">
                  Filtered by location: {selectedDistrict ? `${selectedDistrict}, ` : ''}{selectedState || 'All India'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alerts List */}
      <div className="space-y-6">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div key={alert.id} className={`bg-white rounded-xl shadow-lg border-l-4 ${
              alert.isActive ? 'border-success-500' : 'border-gray-400' // Using success color for active
            } hover:shadow-2xl transition-shadow duration-300 ease-in-out`}>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between">
                  <div className="flex-1 mb-4 sm:mb-0">
                    <div className="flex items-center space-x-3.5 mb-2.5">
                      <span className="text-3xl">{getTypeIcon(alert.type)}</span>
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-primary-700 transition-colors">{alert.title}</h3>
                    </div>

                    <div className="flex flex-wrap gap-2.5 mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase shadow-sm border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity || 'UNKNOWN'}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase shadow-sm bg-primary-100 text-primary-700 border border-primary-200">
                        {alert.type?.replace('_', ' ') || 'GENERAL'}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase shadow-sm border ${
                        alert.isActive
                          ? 'bg-success-100 text-success-700 border-success-200'
                          : 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full mr-2 ${alert.isActive ? 'bg-success-500 animate-pulse' : 'bg-gray-500'}`}></span>
                        {alert.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2.5 self-start sm:self-center">
                    <button
                      onClick={() => handleToggleAlert(alert.id, alert.isActive)}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1
                        ${alert.isActive
                          ? 'bg-warning-500 hover:bg-warning-600 text-white focus:ring-warning-400'
                          : 'bg-success-500 hover:bg-success-600 text-white focus:ring-success-400'
                        }`}
                    >
                      {alert.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="px-4 py-2 text-sm font-semibold text-white bg-danger-500 hover:bg-danger-600 rounded-lg transition-all duration-150 ease-in-out shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-danger-400"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>

                <div className="mt-5 border-t border-gray-200 pt-5">
                  <p className="text-gray-700 mb-4 text-sm leading-relaxed">{alert.description}</p>

                  {alert.location && (
                    <div className="flex items-center text-sm text-gray-600 mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                      <span className="mr-2.5 text-lg">📍</span>
                      <span className="font-medium">Location: </span>
                      <span className="ml-1">
                        {alert.location.address ||
                         `${alert.location.state || ''}, ${alert.location.district || ''} (Lat: ${alert.location.latitude?.toFixed(4)}, Lon: ${alert.location.longitude?.toFixed(4)})`}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm text-gray-600">
                    <div>
                      <span className="font-semibold text-gray-700">Created:</span>
                      <span className="ml-1.5">{formatDate(alert.createdAt)}</span>
                    </div>
                    {alert.updatedAt && (
                      <div>
                        <span className="font-semibold text-gray-700">Updated:</span>
                        <span className="ml-1.5">{formatDate(alert.updatedAt)}</span>
                      </div>
                    )}
                    {alert.expiresAt && (
                      <div>
                        <span className="font-semibold text-gray-700">Expires:</span>
                        <span className="ml-1.5">{formatDate(alert.expiresAt)}</span>
                      </div>
                    )}
                    {alert.radius && (
                      <div>
                        <span className="font-semibold text-gray-700">Impact Radius:</span>
                        <span className="ml-1.5">{alert.radius} km</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
             <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            <h3 className="mt-5 text-xl font-semibold text-gray-800 mb-2">No Alerts Found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {filter === 'active'
                ? 'There are currently no active alerts matching your criteria.'
                : filter === 'inactive'
                ? 'No inactive alerts found with the current filters.'
                : (selectedState || selectedDistrict)
                ? `No alerts found for the selected location: ${selectedDistrict ? `${selectedDistrict}, ` : ''}${selectedState || 'All India'}. Try adjusting your filters.`
                : 'No alerts have been created yet, or none match your current filter settings.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
