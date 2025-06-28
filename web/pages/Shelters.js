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
  };

  // Robust date formatting
  const formatDateSafe = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
  ];

  const getOccupancyColor = (percentage) => {
    if (percentage >= 90) return 'bg-danger-500';
    if (percentage >= 70) return 'bg-warning-500';
    if (percentage >= 40) return 'bg-primary-500';
    return 'bg-success-500';
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mx-auto"></div>
          <p className="mt-6 text-lg font-semibold text-gray-700">Loading Shelters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-0">
      {/* Page Header */}
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Emergency Shelters</h1>
            <p className="mt-1.5 text-sm text-gray-600">Manage and monitor available emergency shelters.</p>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="mt-4 sm:mt-0 px-5 py-2.5 text-sm font-semibold rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm hover:shadow-md transition-all duration-150 ease-in-out flex items-center"
          >
            <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 20 20"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"></path></svg>
            Add New Shelter
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Active Shelters', value: shelters.filter(s => s.isActive).length, icon: '🏠' },
          { label: 'Total Occupancy', value: shelters.reduce((sum, s) => sum + (s.currentOccupancy || 0), 0), icon: '👥' },
          { label: 'Total Capacity', value: shelters.reduce((sum, s) => sum + (s.capacity || 0), 0), icon: '📦' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl shadow-lg p-5 border border-gray-200 flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-full text-primary-600 text-2xl">{stat.icon}</div>
            <div>
              <p className="text-3xl font-extrabold text-gray-800">{stat.value}</p>
              <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
         <h2 className="text-xl font-semibold text-gray-800 mb-3">Filter Shelters</h2>
        <LocationFilter
          onLocationChange={handleLocationChange}
          selectedState={selectedState}
          selectedDistrict={selectedDistrict}
        />
      </div>


      {/* Shelters List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShelters.length > 0 ? filteredShelters.map((shelter) => {
          const occupancyPercentage = shelter.capacity > 0 ? ((shelter.currentOccupancy || 0) / shelter.capacity) * 100 : 0;
          return (
            <div key={shelter.id} className={`bg-white rounded-xl shadow-lg border-l-4 hover:shadow-2xl transition-all duration-300 ease-in-out flex flex-col justify-between ${shelter.isActive ? 'border-success-500' : 'border-gray-400 opacity-80'}`}>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-primary-700 truncate">{shelter.name}</h3>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm border ${shelter.isActive ? 'bg-success-100 text-success-700 border-success-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                    {shelter.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1"><span className="font-medium">Address:</span> {shelter.address}</p>
                {shelter.contactPhone && <p className="text-sm text-gray-600 mb-3"><span className="font-medium">Phone:</span> {shelter.contactPhone}</p>}

                {/* Occupancy */}
                <div className="my-3">
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="font-medium text-gray-700">Occupancy:</span>
                    <span className="font-semibold text-gray-800">{shelter.currentOccupancy || 0} / {shelter.capacity || 'N/A'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getOccupancyColor(occupancyPercentage)}`} style={{ width: `${Math.min(100, occupancyPercentage)}%` }}></div>
                  </div>
                  <div className="flex items-center justify-center mt-2 space-x-2">
                     <button onClick={() => handleUpdateOccupancy(shelter.id, Math.max(0, (shelter.currentOccupancy || 0) - 1))} className="px-2 py-0.5 text-xs font-medium bg-gray-200 hover:bg-gray-300 rounded-md">-</button>
                     <button onClick={() => handleUpdateOccupancy(shelter.id, Math.min(shelter.capacity || Infinity, (shelter.currentOccupancy || 0) + 1))} className="px-2 py-0.5 text-xs font-medium bg-gray-200 hover:bg-gray-300 rounded-md">+</button>
                  </div>
                </div>

                {/* Amenities */}
                {shelter.amenities && shelter.amenities.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Amenities:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {shelter.amenities.slice(0, 4).map((amenity, index) => ( // Show limited amenities
                        <span key={index} className="px-2 py-0.5 text-xs bg-primary-50 text-primary-700 rounded-full border border-primary-200">{amenity}</span>
                      ))}
                      {shelter.amenities.length > 4 && <span className="text-xs text-gray-500">+{shelter.amenities.length - 4} more</span>}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                 <button
                    onClick={() => handleToggleShelter(shelter.id, shelter.isActive)}
                    className={`w-full px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-150 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1
                      ${shelter.isActive ? 'bg-warning-100 text-warning-700 hover:bg-warning-200 focus:ring-warning-400' : 'bg-success-100 text-success-700 hover:bg-success-200 focus:ring-success-400'}`}
                  >
                    {shelter.isActive ? 'Set Inactive' : 'Set Active'}
                  </button>
              </div>
            </div>
          )
        }) : (
          <div className="md:col-span-2 lg:col-span-3 text-center py-16 bg-white rounded-xl shadow-lg border border-gray-200">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <h3 className="mt-5 text-xl font-semibold text-gray-800 mb-2">No Shelters Found</h3>
            <p className="text-gray-500">Try adjusting your location filters or add a new shelter.</p>
          </div>
        )}
      </div>

      {/* Add Shelter Modal Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-appear">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-800">Add New Emergency Shelter</h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleAddShelter} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
              <div>
                <label htmlFor="shelterName" className="block text-sm font-medium text-gray-700 mb-1">Shelter Name *</label>
                <input id="shelterName" type="text" value={newShelter.name} onChange={(e) => setNewShelter({...newShelter, name: e.target.value})} required className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              
              <div>
                <label htmlFor="shelterAddress" className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input id="shelterAddress" type="text" value={newShelter.address} onChange={(e) => setNewShelter({...newShelter, address: e.target.value})} required className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="shelterCapacity" className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
                  <input id="shelterCapacity" type="number" value={newShelter.capacity} onChange={(e) => setNewShelter({...newShelter, capacity: e.target.value})} required min="1" className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                </div>
                <div>
                  <label htmlFor="shelterPhone" className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  <input id="shelterPhone" type="tel" value={newShelter.contactPhone} onChange={(e) => setNewShelter({...newShelter, contactPhone: e.target.value})} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-md bg-gray-50 custom-scrollbar">
                  {commonAmenities.map((amenity) => (
                    <label key={amenity} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer hover:bg-primary-50 p-1 rounded-md">
                      <input type="checkbox" checked={newShelter.amenities.includes(amenity)}
                        onChange={(e) => {
                          const updatedAmenities = e.target.checked
                            ? [...newShelter.amenities, amenity]
                            : newShelter.amenities.filter(a => a !== amenity);
                          setNewShelter({...newShelter, amenities: updatedAmenities});
                        }}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-gray-200 mt-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-400 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 transition-colors">
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
