const getWeather = async (_p, { input }, context) => {
  const { time, region, latitude, longitude } = input;
  const { location: headerLocation } = context;

  let locationParam;
  let finalRegion;

  // Priority order: explicit coordinates > header coordinates > region > header address
  if (latitude && longitude) {
    locationParam = `${latitude},${longitude}`;
    finalRegion = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } else if (headerLocation && headerLocation.latitude && headerLocation.longitude) {
    locationParam = `${headerLocation.latitude},${headerLocation.longitude}`;
    finalRegion = headerLocation.address || `${headerLocation.latitude.toFixed(4)}, ${headerLocation.longitude.toFixed(4)}`;
    console.log('Using location from headers:', headerLocation);
  } else if (region) {
    locationParam = region.trim();
    finalRegion = region;
  } else {
    throw new Error('Either region or latitude/longitude must be provided, or location headers must be included');
  }

  const encoded = encodeURIComponent(locationParam);
  const url = `https://wttr.in/${encoded}?format=j1`;

  const res = await fetch(url, {
    method: 'GET',
    header: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Weather API request failed: ${res.status}`);
  }

  const body = await res.json();
  const cur = body?.current_condition?.[0];

  if (!cur) {
    throw new Error('No weather data available for the specified location');
  }

  return {
    temperature: cur.temp_C,
    humidity: cur.humidity,
    time: time || new Date().toISOString(),
    region: finalRegion,
  };
};

const getLocation = async (_p, { input }, context) => {
  const { latitude, longitude } = input;
  const { location: headerLocation } = context;

  // Use coordinates from input or fallback to headers
  let lat, lng;
  if (latitude && longitude) {
    lat = latitude;
    lng = longitude;
  } else if (headerLocation && headerLocation.latitude && headerLocation.longitude) {
    lat = headerLocation.latitude;
    lng = headerLocation.longitude;
    console.log('Using location from headers for reverse geocoding:', headerLocation);
  } else {
    throw new Error('Either latitude/longitude must be provided in input or location headers must be included');
  }

  try {
    // Use reverse geocoding to get address from coordinates
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );

    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }

    const data = await response.json();

    return {
      latitude: lat,
      longitude: lng,
      accuracy: headerLocation?.accuracy || null,
      address: data.locality || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      timestamp: headerLocation?.timestamp || new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);

    // Return basic location info without address
    return {
      latitude: lat,
      longitude: lng,
      accuracy: headerLocation?.accuracy || null,
      address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      timestamp: headerLocation?.timestamp || new Date().toISOString(),
    };
  }
};

export const Query = {
  getWeather,
  getLocation,
};
