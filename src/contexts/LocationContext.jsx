import React, { createContext, useState, useEffect } from "react";

export const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [locationError, setLocationError] = useState(null);
  const [isLocationLoading, setIsLocationLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      setLocationError("Geolocation not supported by this browser");
      setIsLocationLoading(false);
      return;
    }

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isLocationLoading) {
        console.warn("Location request timed out");
        setLocationError("Location request timed out");
        setIsLocationLoading(false);
        // Set default coordinates (London) as fallback
        setCoords({ lat: 51.5074, lng: -0.1278 });
      }
    }, 10000); // 10 second timeout

    const successCallback = (position) => {
      clearTimeout(timeoutId);
      setCoords({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      setLocationError(null);
      setIsLocationLoading(false);
    };

    const errorCallback = (err) => {
      clearTimeout(timeoutId);
      console.warn("Location error:", err.message);
      setLocationError(err.message);
      setIsLocationLoading(false);

      // Set default coordinates (London) as fallback based on error type
      switch (err.code) {
        case err.PERMISSION_DENIED:
          console.warn("Location permission denied, using default coordinates");
          break;
        case err.POSITION_UNAVAILABLE:
          console.warn("Location unavailable, using default coordinates");
          break;
        case err.TIMEOUT:
          console.warn("Location timeout, using default coordinates");
          break;
        default:
          console.warn("Unknown location error, using default coordinates");
      }

      // Set default coordinates (London) as fallback
      setCoords({ lat: 51.5074, lng: -0.1278 });
    };

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
      console.error("Geolocation error:", error);
      setLocationError("Failed to get location");
      setIsLocationLoading(false);
      // Set default coordinates (London) as fallback
      setCoords({ lat: 51.5074, lng: -0.1278 });
    }

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <LocationContext.Provider
      value={{ coords, locationError, isLocationLoading }}
    >
      {children}
    </LocationContext.Provider>
  );
};
