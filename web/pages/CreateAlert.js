import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { ref, push, set } from 'firebase/database';
import { database } from '../../src/config/firebase';
import { AlertType, AlertSeverity } from '../../src/services/alerts';
import GoogleMapReact from 'google-map-react';
import MapMarker from '../components/MapMarker';

const CreateAlert = ({ onNavigate }) => {
  const auth = getAuth();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState(AlertType.NATURAL_DISASTER);
  const [severity, setSeverity] = useState(AlertSeverity.MEDIUM);
  const [expiryHours, setExpiryHours] = useState(24);
  const [location, setLocation] = useState({
    latitude: 37.7749, // Default to San Francisco
    longitude: -122.4194
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleMapClick = ({ lat, lng }) => {
    setLocation({
      latitude: lat,
      longitude: lng
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('You must be logged in to create an alert');
      }
      
      const now = Date.now();
      const expiryTime = now + (expiryHours * 60 * 60 * 1000);
      
      const alertData = {
        title,
        description,
        type,
        severity,
        location,
        createdAt: now,
        expiresAt: expiryTime,
        createdBy: currentUser.uid,
        isActive: true
      };
      
      // Create a new alert in the database
      const alertsRef = ref(database, 'alerts');
      const newAlertRef = push(alertsRef);
      await set(newAlertRef, {
        ...alertData,
        id: newAlertRef.key
      });
      
      // Navigate back to alerts page
      if (onNavigate) onNavigate('alerts');
    } catch (error) {
      console.error('Error creating alert:', error);
      setError('Failed to create alert: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const MapMarker = () => (
    <div className="map-marker">
      <div className="map-marker-pin"></div>
    </div>
  );
  
  // Simple Map Marker Component - can be enhanced
  const StyledMapMarker = () => (
    <div className="w-8 h-8 -translate-x-1/2 -translate-y-full">
      <span className="absolute inset-0 flex items-center justify-center text-3xl text-red-500 animate-pulse">📍</span>
    </div>
  );

  return (
    <div className="space-y-8 p-0">
      {/* Page Header */}
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create New Emergency Alert</h1>
            <p className="mt-1.5 text-sm text-gray-600">Fill in the details below to issue a new alert.</p>
          </div>
          <button
            onClick={() => onNavigate && onNavigate('alerts')}
            className="mt-4 sm:mt-0 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 transition-colors"
          >
            Cancel & View Alerts
          </button>
        </div>
      </div>
      
      {/* Form Section */}
      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-6 sm:p-8 border border-gray-200 space-y-6">
        {error && (
          <div className="bg-danger-50 border-l-4 border-danger-500 text-danger-700 p-4 rounded-md shadow">
            <div className="flex">
              <div className="py-1">
                <svg className="fill-current h-6 w-6 text-danger-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/></svg>
              </div>
              <div>
                <p className="font-bold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Alert Title and Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Alert Title*</label>
            <input
              type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required
              placeholder="E.g., Severe Thunderstorm Warning"
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Alert Type*</label>
            <select
              id="type" value={type} onChange={(e) => setType(e.target.value)} required
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
            >
              {Object.values(AlertType).map(value => (
                <option key={value} value={value}>{value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Severity and Expiry */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">Severity*</label>
            <select
              id="severity" value={severity} onChange={(e) => setSeverity(e.target.value)} required
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
            >
              {Object.values(AlertSeverity).map(value => (
                <option key={value} value={value}>{value.charAt(0).toUpperCase() + value.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">Expires After (hours)*</label>
            <input
              type="number" id="expiry" value={expiryHours} onChange={(e) => setExpiryHours(Number(e.target.value))}
              min="1" max="168" required
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
            />
          </div>
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
          <textarea
            id="description" value={description} onChange={(e) => setDescription(e.target.value)}
            rows="5" required placeholder="Provide detailed information about the alert, affected areas, and recommended actions..."
            className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
          ></textarea>
        </div>
        
        {/* Map Location Picker */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location (Click on map to set)*</label>
          <div className="h-72 md:h-96 w-full rounded-lg overflow-hidden shadow-sm border border-gray-300 relative">
            {process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ? (
              <GoogleMapReact
                bootstrapURLKeys={{ key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY }}
                center={{ lat: location.latitude, lng: location.longitude }} // Control center through state
                zoom={10} // Consistent zoom level
                onClick={handleMapClick}
                options={{ gestureHandling: 'greedy', disableDoubleClickZoom: true }}
              >
                <StyledMapMarker lat={location.latitude} lng={location.longitude} />
              </GoogleMapReact>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 p-4">
                Google Maps API Key is missing. Please configure EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.
              </div>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded-md border border-gray-200">
            Selected Coordinates: Latitude: <span className="font-semibold">{location.latitude.toFixed(6)}</span>, Longitude: <span className="font-semibold">{location.longitude.toFixed(6)}</span>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('alerts')}
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>}
            {loading ? 'Creating Alert...' : 'Create Alert'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAlert;
