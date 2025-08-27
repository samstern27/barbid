// Utility function to calculate the distance between two geographical coordinates
// Uses the Haversine formula to compute the great-circle distance on Earth's surface
// Returns distance in kilometers rounded to 1 decimal place
const getDistance = (lat1, lon1, lat2, lon2) => {
  // Convert degrees to radians for trigonometric calculations
  const toRad = (value) => (value * Math.PI) / 180;
  
  const R = 6371; // Radius of the Earth in kilometers
  
  // Calculate the differences in latitude and longitude in radians
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  // Haversine formula: calculates the square of half the chord length
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  // Calculate the angular distance in radians
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Convert to distance in kilometers
  const distance = R * c;
  
  // Return distance rounded to 1 decimal place
  return Number(distance.toFixed(1));
};

export default getDistance;
