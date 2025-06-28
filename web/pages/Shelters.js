import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, addDoc } from 'firebase/firestore';
import { firestore } from '../../src/config/firebase';
import LocationFilter from '../components/LocationFilter';
import { filterSheltersByLocation } from '../../src/services/locationFilter';

const Shelters = () => {
  const [shelters, setShelters] = useState([]);
  const [filteredShelters, setFilteredShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [newShelter, setNewShelter] = useState({
    name: '',
    address: '',
    capacity: '',
    currentOccupancy: 0,
    contactPhone: '',
    amenities: [],
    isActive: true
  });

  useEffect(() => {
    loadShelters();
  }, []);

  // Apply location filters whenever shelters or location filters change
  useEffect(() => {
    let filtered = shelters;

    if (selectedState || selectedDistrict) {
      filtered = filterSheltersByLocation(filtered, {
        state: selectedState,
        district: selectedDistrict
      });
    }

    setFilteredShelters(filtered);
  }, [shelters, selectedState, selectedDistrict]);

  const loadShelters = async () => {
    try {
      const sheltersQuery = query(
        collection(firestore, 'shelters'),
        orderBy('name', 'asc')
      );

      const snapshot = await getDocs(sheltersQuery);
      const sheltersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setShelters(sheltersData);
    } catch (error) {
      console.error('Error loading shelters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (state, district) => {
    setSelectedState(state);
    setSelectedDistrict(district);
  };

  const handleToggleShelter = async (shelterId, currentStatus) => {
    try {
      const shelterRef = doc(firestore, 'shelters', shelterId);
      await updateDoc(shelterRef, {
        isActive: !currentStatus,
        updatedAt: new Date().toISOString()
      });
      
      setShelters(shelters.map(shelter => 
        shelter.id === shelterId 
          ? { ...shelter, isActive: !currentStatus }
          : shelter
      ));
    } catch (error) {
      console.error('Error toggling shelter status:', error);
      alert('Failed to update shelter status');
    }
  };

  const handleUpdateOccupancy = async (shelterId, newOccupancy) => {
    try {
      const shelterRef = doc(firestore, 'shelters', shelterId);
      await updateDoc(shelterRef, {
        currentOccupancy: parseInt(newOccupancy),
        updatedAt: new Date().toISOString()
      });
      
      setShelters(shelters.map(shelter => 
        shelter.id === shelterId 
          ? { ...shelter, currentOccupancy: parseInt(newOccupancy) }
          : shelter
      ));
    } catch (error) {
      console.error('Error updating occupancy:', error);
      alert('Failed to update occupancy');
    }
  };

  const handleAddShelter = async (e) => {
    e.preventDefault();
    try {
      const shelterData = {
        ...newShelter,
        capacity: parseInt(newShelter.capacity),
        currentOccupancy: parseInt(newShelter.currentOccupancy),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(firestore, 'shelters'), shelterData);
      setShelters([...shelters, { id: docRef.id, ...shelterData }]);
      
      setNewShelter({
        name: '',
        address: '',
        capacity: '',
        currentOccupancy: 0,
        contactPhone: '',
        amenities: [],
        isActive: true
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding shelter:', error);
      alert('Failed to add shelter');
    }
  };

  const getOccupancyStatus = (current, capacity) => {
    const percentage = (current / capacity) * 100;
    if (percentage >= 90) return 'full';
    if (percentage >= 70) return 'high';
    if (percentage >= 40) return 'medium';
    return 'low';
  };

  const commonAmenities = [
    'Food Service', 'Medical Care', 'Pet Friendly', 'Wheelchair Accessible',
    'Showers', 'Laundry', 'WiFi', 'Childcare', 'Security', 'Parking'
  ];

  if (loading) {
    return (
      <div className="shelters-page loading">
        <div className="loading-spinner">Loading shelters...</div>
      </div>
    );
  }

  return (
    <div className="shelters-page">
      <div className="page-header">
        <h2>Emergency Shelters</h2>
        <div className="page-actions">
          <button 
            className="add-button"
            onClick={() => setShowAddForm(true)}
          >
            ➕ Add Shelter
          </button>
        </div>
      </div>

      <div className="shelters-stats">
        <div className="stat-item">
          <span className="stat-value">{shelters.filter(s => s.isActive).length}</span>
          <span className="stat-label">Active Shelters</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {shelters.reduce((sum, s) => sum + (s.currentOccupancy || 0), 0)}
          </span>
          <span className="stat-label">Total Occupancy</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {shelters.reduce((sum, s) => sum + (s.capacity || 0), 0)}
          </span>
          <span className="stat-label">Total Capacity</span>
        </div>
      </div>

      <div className="shelters-list">
        {shelters.map((shelter) => (
          <div key={shelter.id} className={`shelter-card ${shelter.isActive ? 'active' : 'inactive'}`}>
            <div className="shelter-header">
              <div className="shelter-title-section">
                <h3 className="shelter-name">{shelter.name}</h3>
                <span className={`status-badge ${shelter.isActive ? 'active' : 'inactive'}`}>
                  {shelter.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div className="shelter-actions">
                <button
                  className={`toggle-button ${shelter.isActive ? 'deactivate' : 'activate'}`}
                  onClick={() => handleToggleShelter(shelter.id, shelter.isActive)}
                >
                  {shelter.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                </button>
              </div>
            </div>

            <div className="shelter-content">
              <div className="shelter-info">
                <div className="info-item">
                  <span className="info-icon">📍</span>
                  <span className="info-text">{shelter.address}</span>
                </div>
                {shelter.contactPhone && (
                  <div className="info-item">
                    <span className="info-icon">📞</span>
                    <span className="info-text">{shelter.contactPhone}</span>
                  </div>
                )}
              </div>

              <div className="occupancy-section">
                <div className="occupancy-header">
                  <span className="occupancy-label">Occupancy</span>
                  <div className="occupancy-controls">
                    <button 
                      onClick={() => handleUpdateOccupancy(shelter.id, Math.max(0, (shelter.currentOccupancy || 0) - 1))}
                      className="occupancy-button decrease"
                    >
                      -
                    </button>
                    <span className="occupancy-display">
                      {shelter.currentOccupancy || 0} / {shelter.capacity}
                    </span>
                    <button 
                      onClick={() => handleUpdateOccupancy(shelter.id, Math.min(shelter.capacity, (shelter.currentOccupancy || 0) + 1))}
                      className="occupancy-button increase"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="occupancy-bar">
                  <div 
                    className={`occupancy-fill ${getOccupancyStatus(shelter.currentOccupancy || 0, shelter.capacity)}`}
                    style={{ width: `${Math.min(100, ((shelter.currentOccupancy || 0) / shelter.capacity) * 100)}%` }}
                  ></div>
                </div>
              </div>

              {shelter.amenities && shelter.amenities.length > 0 && (
                <div className="amenities-section">
                  <span className="amenities-label">Amenities:</span>
                  <div className="amenities-list">
                    {shelter.amenities.map((amenity, index) => (
                      <span key={index} className="amenity-tag">{amenity}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Shelter</h3>
              <button className="close-button" onClick={() => setShowAddForm(false)}>✕</button>
            </div>
            
            <form onSubmit={handleAddShelter} className="shelter-form">
              <div className="form-group">
                <label>Shelter Name *</label>
                <input
                  type="text"
                  value={newShelter.name}
                  onChange={(e) => setNewShelter({...newShelter, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Address *</label>
                <input
                  type="text"
                  value={newShelter.address}
                  onChange={(e) => setNewShelter({...newShelter, address: e.target.value})}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Capacity *</label>
                  <input
                    type="number"
                    value={newShelter.capacity}
                    onChange={(e) => setNewShelter({...newShelter, capacity: e.target.value})}
                    required
                    min="1"
                  />
                </div>
                
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    value={newShelter.contactPhone}
                    onChange={(e) => setNewShelter({...newShelter, contactPhone: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Amenities</label>
                <div className="amenities-checkboxes">
                  {commonAmenities.map((amenity) => (
                    <label key={amenity} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={newShelter.amenities.includes(amenity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewShelter({
                              ...newShelter,
                              amenities: [...newShelter.amenities, amenity]
                            });
                          } else {
                            setNewShelter({
                              ...newShelter,
                              amenities: newShelter.amenities.filter(a => a !== amenity)
                            });
                          }
                        }}
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Add Shelter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shelters;
