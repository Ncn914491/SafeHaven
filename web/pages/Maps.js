import React, { useState } from 'react';
import EmergencyMap from '../components/EmergencyMap';

const Maps = () => {
  const [mapSettings, setMapSettings] = useState({
    showAlerts: true,
    showShelters: true,
    showSOSMessages: true,
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 10
  });

  const [selectedMarkerInfo, setSelectedMarkerInfo] = useState(null);

  const handleMarkerClick = (marker, type) => {
    setSelectedMarkerInfo({ ...marker, type });
  };

  const handleSettingChange = (setting, value) => {
    setMapSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const closeMarkerInfo = () => {
    setSelectedMarkerInfo(null);
  };

  return (
    <div className="maps-page">
      <div className="page-header">
        <h2>Emergency Response Map</h2>
        <div className="page-actions">
          <div className="map-toggles">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={mapSettings.showAlerts}
                onChange={(e) => handleSettingChange('showAlerts', e.target.checked)}
              />
              <span>Show Alerts</span>
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={mapSettings.showShelters}
                onChange={(e) => handleSettingChange('showShelters', e.target.checked)}
              />
              <span>Show Shelters</span>
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={mapSettings.showSOSMessages}
                onChange={(e) => handleSettingChange('showSOSMessages', e.target.checked)}
              />
              <span>Show SOS Requests</span>
            </label>
          </div>
        </div>
      </div>

      <div className="map-section">
        <EmergencyMap
          center={mapSettings.center}
          zoom={mapSettings.zoom}
          showAlerts={mapSettings.showAlerts}
          showShelters={mapSettings.showShelters}
          showSOSMessages={mapSettings.showSOSMessages}
          height="600px"
          onMarkerClick={handleMarkerClick}
        />
      </div>

      {selectedMarkerInfo && (
        <div className="marker-details-panel">
          <div className="panel-header">
            <h3>
              {selectedMarkerInfo.type === 'alert' && '🚨 Alert Details'}
              {selectedMarkerInfo.type === 'shelter' && '🏠 Shelter Details'}
              {selectedMarkerInfo.type === 'sos' && '🆘 SOS Request Details'}
            </h3>
            <button className="close-button" onClick={closeMarkerInfo}>✕</button>
          </div>
          
          <div className="panel-content">
            {selectedMarkerInfo.type === 'alert' && (
              <div className="alert-details">
                <h4>{selectedMarkerInfo.title}</h4>
                <p>{selectedMarkerInfo.description}</p>
                <div className="detail-row">
                  <span className="label">Type:</span>
                  <span className="value">{selectedMarkerInfo.type}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Severity:</span>
                  <span className={`value severity-badge ${selectedMarkerInfo.severity?.toLowerCase()}`}>
                    {selectedMarkerInfo.severity}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Created:</span>
                  <span className="value">
                    {new Date(selectedMarkerInfo.createdAt).toLocaleString()}
                  </span>
                </div>
                {selectedMarkerInfo.expiresAt && (
                  <div className="detail-row">
                    <span className="label">Expires:</span>
                    <span className="value">
                      {new Date(selectedMarkerInfo.expiresAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            {selectedMarkerInfo.type === 'shelter' && (
              <div className="shelter-details">
                <h4>{selectedMarkerInfo.name}</h4>
                <div className="detail-row">
                  <span className="label">Address:</span>
                  <span className="value">{selectedMarkerInfo.address}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Capacity:</span>
                  <span className="value">
                    {selectedMarkerInfo.currentOccupancy || 0} / {selectedMarkerInfo.capacity}
                  </span>
                </div>
                {selectedMarkerInfo.contactPhone && (
                  <div className="detail-row">
                    <span className="label">Contact:</span>
                    <span className="value">{selectedMarkerInfo.contactPhone}</span>
                  </div>
                )}
                {selectedMarkerInfo.amenities && selectedMarkerInfo.amenities.length > 0 && (
                  <div className="detail-row">
                    <span className="label">Amenities:</span>
                    <div className="amenities-list">
                      {selectedMarkerInfo.amenities.map((amenity, index) => (
                        <span key={index} className="amenity-tag">{amenity}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedMarkerInfo.type === 'sos' && (
              <div className="sos-details">
                <h4>Emergency Request</h4>
                <div className="detail-row">
                  <span className="label">Status:</span>
                  <span className={`value status-badge ${selectedMarkerInfo.status?.toLowerCase()}`}>
                    {selectedMarkerInfo.status}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Requested:</span>
                  <span className="value">
                    {new Date(selectedMarkerInfo.createdAt).toLocaleString()}
                  </span>
                </div>
                {selectedMarkerInfo.message && (
                  <div className="detail-row">
                    <span className="label">Message:</span>
                    <span className="value">{selectedMarkerInfo.message}</span>
                  </div>
                )}
                {selectedMarkerInfo.contactInfo && (
                  <div className="contact-info">
                    <h5>Contact Information</h5>
                    {selectedMarkerInfo.contactInfo.name && (
                      <div className="detail-row">
                        <span className="label">Name:</span>
                        <span className="value">{selectedMarkerInfo.contactInfo.name}</span>
                      </div>
                    )}
                    {selectedMarkerInfo.contactInfo.phone && (
                      <div className="detail-row">
                        <span className="label">Phone:</span>
                        <span className="value">{selectedMarkerInfo.contactInfo.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="location-info">
              <h5>Location</h5>
              <div className="detail-row">
                <span className="label">Coordinates:</span>
                <span className="value">
                  {selectedMarkerInfo.location?.latitude?.toFixed(6)}, {selectedMarkerInfo.location?.longitude?.toFixed(6)}
                </span>
              </div>
              <a
                href={`https://www.google.com/maps?q=${selectedMarkerInfo.location?.latitude},${selectedMarkerInfo.location?.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="external-link"
              >
                View in Google Maps →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maps;
