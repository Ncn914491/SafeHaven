import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore'; // Removed unused Firestore imports
import { firestore } from '../../src/config/firebase';
import { subscribeToReports } from '../../src/services/reports'; // Import the subscription service

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(''); // For general page errors
  const [statusUpdateError, setStatusUpdateError] = useState(''); // For modal errors
  const [filter, setFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToReports(
      (reportsData) => {
        setReports(reportsData);
        setLoading(false);
        setError('');
      },
      (err) => {
        console.error('Error subscribing to reports:', err);
        setError('Failed to load reports in real-time. Please try refreshing.');
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (reportId, newStatus) => {
    setStatusUpdateError(''); // Clear previous modal error
    try {
      const reportRef = doc(firestore, 'reports', reportId);
      await updateDoc(reportRef, {
        status: newStatus,
        updatedAt: new Date().toISOString() // Keep ISO string for consistency if backend expects it
      });
      
      // Local state will be updated by the real-time listener 'subscribeToReports'
      // However, we can optimistically update the selectedReport if it's open in modal
      if (selectedReport && selectedReport.id === reportId) {
        setSelectedReport({ ...selectedReport, status: newStatus, updatedAt: new Date().toISOString() });
      }
      // Optionally, close modal on successful update or show success message
    } catch (err) {
      console.error('Error updating report status:', err);
      setStatusUpdateError('Failed to update report status. Please try again.');
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

  // Firestore Timestamps might need .toDate() if they are not already strings/numbers
  const formatDateSafe = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Check if it's a Firestore Timestamp object, a common source of date issues
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleString();
    }
    // Handle ISO strings or numeric timestamps
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) { // Check if date is valid
        return 'Invalid Date';
    }
    return date.toLocaleString();
  };

  const ReportModal = ({ report, onClose, onStatusUpdate, modalError }) => { // Added modalError prop
    if (!report) return null;
    const currentStatus = report.status;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-appear">
          <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
            <h3 className="text-xl font-semibold text-gray-800">Report Details: <span className="text-primary-600">{report.id?.substring(0, 8)}...</span></h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
            {/* Modal Error Display */}
            {modalError && (
              <div className="bg-danger-50 border-l-4 border-danger-500 text-danger-700 p-3 rounded-md shadow-sm mb-4">
                <div className="flex">
                  <div className="py-1">
                    <svg className="fill-current h-5 w-5 text-danger-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM9 5v6h2V5H9zm0 8v2h2v-2H9z"/></svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{modalError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Report Info */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-md font-semibold text-gray-700 mb-3">Key Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div><strong className="text-gray-600">Type:</strong> <span className="text-gray-800">{report.category || report.type || 'N/A'}</span></div>
                <div><strong className="text-gray-600">Status:</strong> <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(report.status, 'badge')}`}>{report.status?.toUpperCase()}</span></div>
                <div><strong className="text-gray-600">Created:</strong> <span className="text-gray-800">{formatDateSafe(report.createdAt || report.timestamp)}</span></div>
                {report.updatedAt && <div><strong className="text-gray-600">Updated:</strong> <span className="text-gray-800">{formatDateSafe(report.updatedAt)}</span></div>}
                {report.userId && <div><strong className="text-gray-600">User ID:</strong> <span className="text-gray-800 truncate">{report.userId}</span></div>}
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-md font-semibold text-gray-700 mb-1.5">Description</h4>
              <p className="text-gray-700 text-sm leading-relaxed bg-white p-3 border border-gray-200 rounded-md whitespace-pre-wrap">{report.description || 'No description provided.'}</p>
            </div>

            {/* Location */}
            {report.location && (
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-1.5">Location</h4>
                <div className="text-sm text-gray-700 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <span className="text-lg mr-2">📍</span>
                  {report.location.address || `Lat: ${report.location.latitude?.toFixed(4)}, Lon: ${report.location.longitude?.toFixed(4)}`}
                </div>
              </div>
            )}

            {/* Contact Info */}
            {report.contactInfo && (report.contactInfo.name || report.contactInfo.phone || report.contactInfo.email) && (
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-1.5">Contact Information</h4>
                <div className="text-sm text-gray-700 space-y-1 p-3 bg-gray-50 rounded-md border border-gray-200">
                  {report.contactInfo.name && <p><strong>Name:</strong> {report.contactInfo.name}</p>}
                  {report.contactInfo.phone && <p><strong>Phone:</strong> {report.contactInfo.phone}</p>}
                  {report.contactInfo.email && <p><strong>Email:</strong> {report.contactInfo.email}</p>}
                </div>
              </div>
            )}

            {/* Media Files - Placeholder for now */}
            {report.mediaUrls && report.mediaUrls.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-gray-700 mb-1.5">Attached Media</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {report.mediaUrls.map((url, index) => (
                    <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square bg-gray-200 rounded-md overflow-hidden hover:opacity-80 transition-opacity">
                      {/* Basic image display, can be enhanced for video/file types */}
                      <img src={url} alt={`Report media ${index + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Update Actions */}
          <div className="p-5 border-t border-gray-200 bg-gray-50">
            <h4 className="text-md font-semibold text-gray-700 mb-3">Update Report Status</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {['pending', 'investigating', 'resolved', 'dismissed'].map(statusValue => (
                <button
                  key={statusValue}
                  onClick={() => onStatusUpdate(report.id, statusValue)}
                  disabled={currentStatus === statusValue}
                  className={`w-full px-3 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-150 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed
                    ${currentStatus === statusValue ? `${getStatusColor(statusValue, 'buttonActive')} text-white` : `${getStatusColor(statusValue, 'button')} hover:${getStatusColor(statusValue, 'buttonHover')}`}
                  `}
                >
                  {statusValue.charAt(0).toUpperCase() + statusValue.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-6 text-lg font-semibold text-gray-700">Loading Reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-0">
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Incident Reports</h1>
        <p className="mt-1.5 text-sm text-gray-600">Review and manage all submitted incident reports.</p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full sm:w-auto min-w-[200px] px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
        >
          <option value="all">All Reports ({reports.length})</option>
          <option value="pending">Pending ({reports.filter(r => r.status === 'pending').length})</option>
          <option value="investigating">Investigating ({reports.filter(r => r.status === 'investigating').length})</option>
          <option value="resolved">Resolved ({reports.filter(r => r.status === 'resolved').length})</option>
          <option value="dismissed">Dismissed ({reports.filter(r => r.status === 'dismissed').length})</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
              onClick={() => setSelectedReport(report)}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-primary-700 truncate">{report.category || report.type || 'General Report'}</h3>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status, 'badge')}`}>
                    {report.status?.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-3 mb-3">{report.description || 'No description.'}</p>
                
                {report.location && (
                  <div className="text-xs text-gray-500 flex items-center mb-1">
                    <svg className="w-3.5 h-3.5 mr-1.5 fill-current text-gray-400" viewBox="0 0 20 20"><path d="M10 20S3 10.87 3 7a7 7 0 1114 0c0 3.87-7 13-7 13zm0-11a2 2 0 100-4 2 2 0 000 4z"/></svg>
                    {report.location.address ? report.location.address.substring(0,30)+'...' : `Lat: ${report.location.latitude?.toFixed(2)}, Lon: ${report.location.longitude?.toFixed(2)}`}
                  </div>
                )}
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
                Reported: {formatDateSafe(report.createdAt || report.timestamp)}
              </div>
            </div>
          ))
        ) : (
          <div className="md:col-span-2 lg:col-span-3 text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-5 text-xl font-semibold text-gray-800 mb-2">No Reports Found</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {filter === 'all' 
                ? 'There are no incident reports submitted yet.'
                : `No reports found with the status "${filter}". Try a different filter.`}
            </p>
          </div>
        )}
      </div>

      {selectedReport && (
        <ReportModal
          report={selectedReport}
          onClose={() => {
            setSelectedReport(null);
            setStatusUpdateError(''); // Clear modal error on close
          }}
          onStatusUpdate={handleStatusUpdate}
          modalError={statusUpdateError} // Pass the error to the modal
        />
      )}
    </div>
  );
};

export default Reports;
