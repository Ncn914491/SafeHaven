import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../src/config/firebase';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const reportsQuery = query(
        collection(firestore, 'reports'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(reportsQuery);
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setReports(reportsData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      const reportRef = doc(firestore, 'reports', reportId);
      await updateDoc(reportRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus, updatedAt: new Date().toISOString() }
          : report
      ));
      
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      alert('Failed to update report status');
    }
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'investigating': return 'blue';
      case 'resolved': return 'green';
      case 'dismissed': return 'gray';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const ReportModal = ({ report, onClose, onStatusUpdate }) => {
    if (!report) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Report Details</h3>
            <button className="close-button" onClick={onClose}>✕</button>
          </div>
          
          <div className="modal-body">
            <div className="report-detail-section">
              <h4>Report Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Type:</span>
                  <span className="value">{report.type}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Status:</span>
                  <span className={`value status-badge ${getStatusColor(report.status)}`}>
                    {report.status?.toUpperCase()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Created:</span>
                  <span className="value">{formatDate(report.createdAt)}</span>
                </div>
                {report.updatedAt && (
                  <div className="detail-item">
                    <span className="label">Updated:</span>
                    <span className="value">{formatDate(report.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="report-detail-section">
              <h4>Description</h4>
              <p className="report-description">{report.description}</p>
            </div>

            {report.location && (
              <div className="report-detail-section">
                <h4>Location</h4>
                <div className="location-info">
                  <span className="location-icon">📍</span>
                  <span>{report.location.address || `${report.location.latitude}, ${report.location.longitude}`}</span>
                </div>
              </div>
            )}

            {report.contactInfo && (
              <div className="report-detail-section">
                <h4>Contact Information</h4>
                <div className="contact-info">
                  {report.contactInfo.name && <p><strong>Name:</strong> {report.contactInfo.name}</p>}
                  {report.contactInfo.phone && <p><strong>Phone:</strong> {report.contactInfo.phone}</p>}
                  {report.contactInfo.email && <p><strong>Email:</strong> {report.contactInfo.email}</p>}
                </div>
              </div>
            )}

            <div className="report-detail-section">
              <h4>Update Status</h4>
              <div className="status-buttons">
                <button 
                  className="status-button pending"
                  onClick={() => onStatusUpdate(report.id, 'pending')}
                  disabled={report.status === 'pending'}
                >
                  Pending
                </button>
                <button 
                  className="status-button investigating"
                  onClick={() => onStatusUpdate(report.id, 'investigating')}
                  disabled={report.status === 'investigating'}
                >
                  Investigating
                </button>
                <button 
                  className="status-button resolved"
                  onClick={() => onStatusUpdate(report.id, 'resolved')}
                  disabled={report.status === 'resolved'}
                >
                  Resolved
                </button>
                <button 
                  className="status-button dismissed"
                  onClick={() => onStatusUpdate(report.id, 'dismissed')}
                  disabled={report.status === 'dismissed'}
                >
                  Dismissed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="reports-page loading">
        <div className="loading-spinner">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="page-header">
        <h2>Incident Reports</h2>
        <div className="page-actions">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Reports ({reports.length})</option>
            <option value="pending">Pending ({reports.filter(r => r.status === 'pending').length})</option>
            <option value="investigating">Investigating ({reports.filter(r => r.status === 'investigating').length})</option>
            <option value="resolved">Resolved ({reports.filter(r => r.status === 'resolved').length})</option>
            <option value="dismissed">Dismissed ({reports.filter(r => r.status === 'dismissed').length})</option>
          </select>
        </div>
      </div>

      <div className="reports-list">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div key={report.id} className="report-card" onClick={() => setSelectedReport(report)}>
              <div className="report-header">
                <div className="report-title-section">
                  <h3 className="report-type">{report.type}</h3>
                  <span className={`status-badge ${getStatusColor(report.status)}`}>
                    {report.status?.toUpperCase()}
                  </span>
                </div>
                <div className="report-date">
                  {formatDate(report.createdAt)}
                </div>
              </div>
              
              <div className="report-content">
                <p className="report-description">
                  {report.description.length > 150 
                    ? `${report.description.substring(0, 150)}...` 
                    : report.description}
                </p>
                
                {report.location && (
                  <div className="report-location">
                    <span className="location-icon">📍</span>
                    <span className="location-text">
                      {report.location.address || 'Location provided'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-reports">
            <div className="no-reports-icon">📋</div>
            <h3>No reports found</h3>
            <p>
              {filter === 'all' 
                ? 'No incident reports have been submitted yet.' 
                : `No ${filter} reports found.`}
            </p>
          </div>
        )}
      </div>

      {selectedReport && (
        <ReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default Reports;
