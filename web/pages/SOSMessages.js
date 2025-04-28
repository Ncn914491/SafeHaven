import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../src/config/firebase';
import { SOSStatus } from '../../src/services/sos';

const SOSMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    const sosQuery = query(
      collection(firestore, 'sos_messages'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(sosQuery, (snapshot) => {
      const messagesList = [];
      snapshot.forEach((doc) => {
        messagesList.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate()
        });
      });
      setMessages(messagesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      await updateDoc(doc(firestore, 'sos_messages', messageId), {
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating message status:', error);
      alert('Failed to update message status');
    }
  };

  const handleMessageSelect = (message) => {
    setSelectedMessage(message);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case SOSStatus.PENDING:
        return 'badge-warning';
      case SOSStatus.ACKNOWLEDGED:
        return 'badge-info';
      case SOSStatus.RESOLVED:
        return 'badge-success';
      default:
        return 'badge-secondary';
    }
  };

  return (
    <div className="sos-messages-container">
      <div className="page-header">
        <h1>SOS Messages</h1>
        <div className="header-actions">
          <div className="badge badge-danger">
            {messages.filter(m => m.status === SOSStatus.PENDING).length} Pending
          </div>
        </div>
      </div>

      <div className="sos-content">
        <div className="sos-list">
          {loading ? (
            <div className="loading-indicator">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <p>No SOS messages found</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>User</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr 
                    key={message.id} 
                    className={message.status === SOSStatus.PENDING ? 'row-highlight' : ''}
                    onClick={() => handleMessageSelect(message)}
                  >
                    <td>{message.timestamp.toLocaleString()}</td>
                    <td>{message.userName || message.phoneNumber || 'Anonymous'}</td>
                    <td>{message.message}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(message.status)}`}>
                        {message.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {message.status === SOSStatus.PENDING && (
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(message.id, SOSStatus.ACKNOWLEDGED);
                            }}
                          >
                            Acknowledge
                          </button>
                        )}
                        {message.status !== SOSStatus.RESOLVED && (
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusChange(message.id, SOSStatus.RESOLVED);
                            }}
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedMessage && (
          <div className="sos-details">
            <div className="details-header">
              <h2>SOS Details</h2>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={() => setSelectedMessage(null)}
              >
                Close
              </button>
            </div>

            <div className="details-content">
              <div className="detail-group">
                <label>Status:</label>
                <span className={`badge ${getStatusBadgeClass(selectedMessage.status)}`}>
                  {selectedMessage.status}
                </span>
              </div>

              <div className="detail-group">
                <label>Time:</label>
                <span>{selectedMessage.timestamp.toLocaleString()}</span>
              </div>

              <div className="detail-group">
                <label>User:</label>
                <span>{selectedMessage.userName || selectedMessage.phoneNumber || 'Anonymous'}</span>
              </div>

              <div className="detail-group">
                <label>Phone:</label>
                <span>{selectedMessage.phoneNumber || 'Not available'}</span>
              </div>

              <div className="detail-group">
                <label>Message:</label>
                <p>{selectedMessage.message}</p>
              </div>

              {selectedMessage.location && (
                <div className="detail-group">
                  <label>Location:</label>
                  <div className="location-details">
                    <p>
                      Latitude: {selectedMessage.location.latitude.toFixed(6)}<br />
                      Longitude: {selectedMessage.location.longitude.toFixed(6)}
                    </p>
                    <a 
                      href={`https://www.google.com/maps?q=${selectedMessage.location.latitude},${selectedMessage.location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-primary"
                    >
                      View on Map
                    </a>
                  </div>
                </div>
              )}

              <div className="detail-actions">
                {selectedMessage.status === SOSStatus.PENDING && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleStatusChange(selectedMessage.id, SOSStatus.ACKNOWLEDGED)}
                  >
                    Acknowledge
                  </button>
                )}
                {selectedMessage.status !== SOSStatus.RESOLVED && (
                  <button 
                    className="btn btn-success"
                    onClick={() => handleStatusChange(selectedMessage.id, SOSStatus.RESOLVED)}
                  >
                    Resolve
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SOSMessages;
