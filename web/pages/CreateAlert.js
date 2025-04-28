import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { ref, push, set } from 'firebase/database';
import { database } from '../../src/config/firebase';
import { AlertType, AlertSeverity } from '../../src/services/alerts';
import GoogleMapReact from 'google-map-react';

const CreateAlert = () => {
  const navigate = useNavigate();
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
      navigate('/alerts');
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
  
  return (
    <div className="create-alert-container">
      <div className="page-header">
        <h1>Create New Alert</h1>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/alerts')}
          >
            Cancel
          </button>
        </div>
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit} className="create-alert-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Alert Title*</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="E.g., Flash Flood Warning"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="type">Alert Type*</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            >
              <option value={AlertType.NATURAL_DISASTER}>Natural Disaster</option>
              <option value={AlertType.FIRE}>Fire</option>
              <option value={AlertType.MEDICAL}>Medical</option>
              <option value={AlertType.SECURITY}>Security</option>
              <option value={AlertType.INFRASTRUCTURE}>Infrastructure</option>
              <option value={AlertType.OTHER}>Other</option>
            </select>
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="severity">Severity*</label>
            <select
              id="severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              required
            >
              <option value={AlertSeverity.LOW}>Low</option>
              <option value={AlertSeverity.MEDIUM}>Medium</option>
              <option value={AlertSeverity.HIGH}>High</option>
              <option value={AlertSeverity.CRITICAL}>Critical</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="expiry">Expires After (hours)*</label>
            <input
              type="number"
              id="expiry"
              value={expiryHours}
              onChange={(e) => setExpiryHours(Number(e.target.value))}
              min="1"
              max="168"
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description*</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            required
            placeholder="Provide detailed information about the alert..."
          ></textarea>
        </div>
        
        <div className="form-group">
          <label>Location (Click on map to set)*</label>
          <div className="map-container">
            <GoogleMapReact
              bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY }}
              defaultCenter={{
                lat: location.latitude,
                lng: location.longitude
              }}
              defaultZoom={12}
              onClick={handleMapClick}
            >
              <MapMarker
                lat={location.latitude}
                lng={location.longitude}
              />
            </GoogleMapReact>
          </div>
          <div className="location-coordinates">
            Latitude: {location.latitude.toFixed(6)}, Longitude: {location.longitude.toFixed(6)}
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/alerts')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Alert'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAlert;
