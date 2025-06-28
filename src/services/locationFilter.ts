import { Alert } from './alerts';
import { Shelter } from './shelters';
import { Report } from './reports';
import { SOSMessage } from './sos';

// Location filter interface
export interface LocationFilter {
  state?: string;
  district?: string;
}

// Generic location data interface
interface LocationData {
  state?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

/**
 * Filters alerts based on location criteria
 * @param alerts - Array of alerts to filter
 * @param filter - Location filter criteria
 * @returns Filtered alerts array
 */
export const filterAlertsByLocation = (alerts: Alert[], filter: LocationFilter): Alert[] => {
  if (!filter.state && !filter.district) {
    return alerts;
  }

  return alerts.filter(alert => {
    const location = alert.location as LocationData;
    
    // Check state filter
    if (filter.state && location.state !== filter.state) {
      return false;
    }
    
    // Check district filter
    if (filter.district && location.district !== filter.district) {
      return false;
    }
    
    return true;
  });
};

/**
 * Filters shelters based on location criteria
 * @param shelters - Array of shelters to filter
 * @param filter - Location filter criteria
 * @returns Filtered shelters array
 */
export const filterSheltersByLocation = (shelters: Shelter[], filter: LocationFilter): Shelter[] => {
  if (!filter.state && !filter.district) {
    return shelters;
  }

  return shelters.filter(shelter => {
    const location = shelter.location as LocationData;
    
    // Check state filter
    if (filter.state && location.state !== filter.state) {
      return false;
    }
    
    // Check district filter
    if (filter.district && location.district !== filter.district) {
      return false;
    }
    
    return true;
  });
};

/**
 * Filters reports based on location criteria
 * @param reports - Array of reports to filter
 * @param filter - Location filter criteria
 * @returns Filtered reports array
 */
export const filterReportsByLocation = (reports: Report[], filter: LocationFilter): Report[] => {
  if (!filter.state && !filter.district) {
    return reports;
  }

  return reports.filter(report => {
    const location = report.location as LocationData;
    
    // Check state filter
    if (filter.state && location.state !== filter.state) {
      return false;
    }
    
    // Check district filter
    if (filter.district && location.district !== filter.district) {
      return false;
    }
    
    return true;
  });
};

/**
 * Filters SOS messages based on location criteria
 * @param sosMessages - Array of SOS messages to filter
 * @param filter - Location filter criteria
 * @returns Filtered SOS messages array
 */
export const filterSOSMessagesByLocation = (sosMessages: SOSMessage[], filter: LocationFilter): SOSMessage[] => {
  if (!filter.state && !filter.district) {
    return sosMessages;
  }

  return sosMessages.filter(sosMessage => {
    const location = sosMessage.location as LocationData;
    
    // Check state filter
    if (filter.state && location.state !== filter.state) {
      return false;
    }
    
    // Check district filter
    if (filter.district && location.district !== filter.district) {
      return false;
    }
    
    return true;
  });
};

/**
 * Gets location statistics for filtered data
 * @param data - Array of data with location information
 * @param filter - Location filter criteria
 * @returns Location statistics
 */
export const getLocationStatistics = (data: any[], filter: LocationFilter) => {
  const filteredData = data.filter(item => {
    const location = item.location as LocationData;
    
    if (filter.state && location.state !== filter.state) {
      return false;
    }
    
    if (filter.district && location.district !== filter.district) {
      return false;
    }
    
    return true;
  });

  // Count by state
  const stateStats = filteredData.reduce((acc, item) => {
    const state = item.location?.state || 'Unknown';
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count by district
  const districtStats = filteredData.reduce((acc, item) => {
    const district = item.location?.district || 'Unknown';
    acc[district] = (acc[district] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    total: filteredData.length,
    byState: stateStats,
    byDistrict: districtStats
  };
};

/**
 * Validates if location data has required fields for filtering
 * @param location - Location data to validate
 * @returns True if location has state and district information
 */
export const isLocationFilterable = (location: LocationData): boolean => {
  return !!(location.state && location.district);
};

/**
 * Normalizes location data for consistent filtering
 * @param location - Raw location data
 * @returns Normalized location data
 */
export const normalizeLocationData = (location: any): LocationData => {
  return {
    state: location.state || location.State || '',
    district: location.district || location.District || '',
    latitude: location.latitude || location.lat || 0,
    longitude: location.longitude || location.lng || 0,
    address: location.address || location.Address || ''
  };
};

/**
 * Creates a location filter from URL parameters or user selection
 * @param params - URL parameters or filter object
 * @returns Location filter object
 */
export const createLocationFilter = (params: { state?: string; district?: string }): LocationFilter => {
  return {
    state: params.state || undefined,
    district: params.district || undefined
  };
};

/**
 * Converts location filter to URL parameters
 * @param filter - Location filter object
 * @returns URL search parameters
 */
export const locationFilterToParams = (filter: LocationFilter): URLSearchParams => {
  const params = new URLSearchParams();
  
  if (filter.state) {
    params.set('state', filter.state);
  }
  
  if (filter.district) {
    params.set('district', filter.district);
  }
  
  return params;
};
