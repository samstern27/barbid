import React, { createContext, useState, useEffect, useMemo } from "react";

// Location context for managing user geolocation and coordinates
// Provides fallback coordinates and error handling for location services
export const LocationContext = createContext();

// Location provider component that manages geolocation state
export const LocationProvider = ({ children }) => {
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [locationError, setLocationError] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  // Initialize geolocation on component mount
  // Handles browser support, permissions, and fallback coordinates
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by this browser");
      setIsLocationLoading(false);
      return;
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isLocationLoading) {
        setLocationError("Location request timed out");
        setIsLocationLoading(false);
        // Set default coordinates (London) as fallback
        setCoords({ lat: 51.5074, lng: -0.1278 });
      }
    }, 10000); // 10 second timeout

    // Success callback for geolocation
    const successCallback = (position) => {
      clearTimeout(timeoutId);
      setCoords({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setLocationError(null);
      setIsLocationLoading(false);
    };

    // Error callback for geolocation failures
    const errorCallback = (err) => {
      clearTimeout(timeoutId);
      setLocationError(err.message);
      setIsLocationLoading(false);

      // Set default coordinates (London) as fallback based on error type
      switch (err.code) {
        case err.PERMISSION_DENIED:
          // Location permission denied, using default coordinates
          break;
        case err.POSITION_UNAVAILABLE:
          // Location unavailable, using default coordinates
          break;
        case err.TIMEOUT:
          // Location timeout, using default coordinates
          break;
        default:
          // Unknown location error, using default coordinates
      }

      // Set default coordinates (London) as fallback
      setCoords({ lat: 51.5074, lng: -0.1278 });
    };

    // Geolocation options for optimal performance
    const options = {
      enableHighAccuracy: false, // Don't need high accuracy for job search
      timeout: 8000, // 8 second timeout
      maximumAge: 300000, // Accept cached location up to 5 minutes old
    };

    try {
      navigator.geolocation.getCurrentPosition(
        successCallback,
        errorCallback,
        options
      );
    } catch (error) {
      clearTimeout(timeoutId);
      setLocationError("Failed to get location");
      setIsLocationLoading(false);
      // Set default coordinates (London) as fallback
      setCoords({ lat: 51.5074, lng: -0.1278 });
    }

    // Cleanup function to clear timeout
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    coords,
    locationError,
    isLocationLoading,
  }), [coords, locationError, isLocationLoading]);

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
