import React from 'react';

const MapMarker = ({ lat, lng, type = 'alert', title, onClick }) => {
  const getMarkerIcon = () => {
    switch (type) {
      case 'alert':
        return '🚨';
      case 'shelter':
        return '🏠';
      case 'sos':
        return '🆘';
      case 'user':
        return '📍';
      default:
        return '📍';
    }
  };

  const getMarkerColor = () => {
    switch (type) {
      case 'alert':
        return '#ef4444';
      case 'shelter':
        return '#10b981';
      case 'sos':
        return '#f59e0b';
      case 'user':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <div 
      className="map-marker"
      onClick={onClick}
      title={title}
      style={{
        position: 'absolute',
        transform: 'translate(-50%, -100%)',
        cursor: 'pointer',
        zIndex: 10
      }}
    >
      <div 
        className="marker-icon"
        style={{
          fontSize: '24px',
          textAlign: 'center',
          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
        }}
      >
        {getMarkerIcon()}
      </div>
      {title && (
        <div 
          className="marker-tooltip"
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            marginBottom: '4px',
            display: 'none'
          }}
        >
          {title}
        </div>
      )}
      
      <style jsx>{`
        .map-marker:hover .marker-tooltip {
          display: block !important;
        }
      `}</style>
    </div>
  );
};

export default MapMarker;
