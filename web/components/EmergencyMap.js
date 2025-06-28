import React, { useState, useEffect } from 'react';
import GoogleMapReact from 'google-map-react';
import { getDatabase, ref, onValue } from 'firebase/database';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { database, firestore } from '../../src/config/firebase';
import MapMarker from './MapMarker';

const EmergencyMap = ({
  center = { lat: 37.7749, lng: -122.4194 },
  zoom = 10,
  showAlerts = true,
  showShelters = true,
  showSOSMessages = true,
  height = '400px',
  onMarkerClick = null
}) => {
  const [alerts, setAlerts] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [sosMessages, setSOSMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapCenter, setMapCenter] = useState(center);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadMapData();
    getUserLocation();
  }, [showAlerts, showShelters, showSOSMessages]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          setMapCenter(userPos);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          // Fallback to default center
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    }
  };

  const loadMapData = async () => {
    try {
      setLoading(true);
      
      const promises = [];
      
      if (showAlerts) {
        promises.push(loadAlerts());
      }
      
      if (showShelters) {
        promises.push(loadShelters());
      }
      
      if (showSOSMessages) {
        promises.push(loadSOSMessages());
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error loading map data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = () => {
    return new Promise((resolve) => {
      const alertsRef = ref(database, 'alerts');
      onValue(alertsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const alertsArray = Object.entries(data)
            .map(([id, alert]) => ({ id, ...alert }))
            .filter(alert => alert.isActive && alert.location);
          setAlerts(alertsArray);
        } else {
          setAlerts([]);
        }
        resolve();
      });
    });
  };

  const loadShelters = async () => {
    try {
      const sheltersQuery = query(
        collection(firestore, 'shelters'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(sheltersQuery);
      const sheltersData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(shelter => shelter.location);
      setShelters(sheltersData);
    } catch (error) {
      console.error('Error loading shelters:', error);
      setShelters([]);
    }
  };

  const loadSOSMessages = async () => {
    try {
      const sosQuery = query(
        collection(firestore, 'sosMessages'),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(sosQuery);
      const sosData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(sos => sos.location);
      setSOSMessages(sosData);
    } catch (error) {
      console.error('Error loading SOS messages:', error);
      setSOSMessages([]);
    }
  };

  const handleMarkerClick = (marker, type) => {
    setSelectedMarker({ ...marker, type });
    if (onMarkerClick) {
      onMarkerClick(marker, type);
    }
  };

  const renderInfoWindow = () => {
    if (!selectedMarker) return null;

    const { type, title, description, name, address, severity, status } = selectedMarker;

    return (
      <div className="map-info-window">
        <div className="info-header">
          <h4>{title || name}</h4>
          <button 
            className="close-button"
            onClick={() => setSelectedMarker(null)}
          >
            ✕
          </button>
        </div>
        <div className="info-content">
          {description && <p>{description}</p>}
          {address && <p><strong>Address:</strong> {address}</p>}
          {severity && (
            <span className={`severity-badge ${severity.toLowerCase()}`}>
              {severity.toUpperCase()}
            </span>
          )}
          {status && (
            <span className={`status-badge ${status.toLowerCase()}`}>
              {status.toUpperCase()}
            </span>
          )}
        </div>
      </div>
    );
  };

  const mapOptions = {
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ],
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: true
  };

  if (!process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="map-error" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>
        <div className="error-content">
          <p>Google Maps API key not configured</p>
          <small>Please set EXPO_PUBLIC_GOOGLE_MAPS_API_KEY in your environment</small>
        </div>
      </div>
    );
  }

  return (
    <div className="emergency-map" style={{ height, position: 'relative' }}>
      {loading && (
        <div className="map-loading">
          <div className="loading-spinner">Loading map data...</div>
        </div>
      )}
      
      <GoogleMapReact
        bootstrapURLKeys={{
          key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
          libraries: ['places']
        }}
        center={mapCenter}
        zoom={zoom}
        options={mapOptions}
      >
        {/* Render Alert Markers */}
        {showAlerts && alerts.map((alert) => (
          <MapMarker
            key={`alert-${alert.id}`}
            lat={alert.location.latitude}
            lng={alert.location.longitude}
            type="alert"
            title={alert.title}
            onClick={() => handleMarkerClick(alert, 'alert')}
          />
        ))}

        {/* Render Shelter Markers */}
        {showShelters && shelters.map((shelter) => (
          <MapMarker
            key={`shelter-${shelter.id}`}
            lat={shelter.location.latitude}
            lng={shelter.location.longitude}
            type="shelter"
            title={shelter.name}
            onClick={() => handleMarkerClick(shelter, 'shelter')}
          />
        ))}

        {/* Render SOS Message Markers */}
        {showSOSMessages && sosMessages.map((sos) => (
          <MapMarker
            key={`sos-${sos.id}`}
            lat={sos.location.latitude}
            lng={sos.location.longitude}
            type="sos"
            title="SOS Request"
            onClick={() => handleMarkerClick(sos, 'sos')}
          />
        ))}

        {/* Render User Location Marker */}
        {userLocation && (
          <MapMarker
            key="user-location"
            lat={userLocation.lat}
            lng={userLocation.lng}
            type="user"
            title="Your Location"
          />
        )}
      </GoogleMapReact>

      {/* Info Window */}
      {selectedMarker && (
        <div className="map-overlay">
          {renderInfoWindow()}
        </div>
      )}

      {/* Map Controls */}
      <div className="map-controls">
        <button
          className="map-control-button"
          onClick={getUserLocation}
          title="Center on my location"
        >
          📍
        </button>
      </div>

      {/* Map Legend */}
      <div className="map-legend">
        <h5>Legend</h5>
        {showAlerts && (
          <div className="legend-item">
            <span className="legend-icon">🚨</span>
            <span>Active Alerts ({alerts.length})</span>
          </div>
        )}
        {showShelters && (
          <div className="legend-item">
            <span className="legend-icon">🏠</span>
            <span>Emergency Shelters ({shelters.length})</span>
          </div>
        )}
        {showSOSMessages && (
          <div className="legend-item">
            <span className="legend-icon">🆘</span>
            <span>SOS Requests ({sosMessages.length})</span>
          </div>
        )}
        {userLocation && (
          <div className="legend-item">
            <span className="legend-icon">📍</span>
            <span>Your Location</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyMap;
