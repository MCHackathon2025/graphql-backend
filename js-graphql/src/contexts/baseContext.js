import jwt from 'jsonwebtoken';

// TODO: no hardcode and exposed secret...
const SECRET = 'abc';

/**
 * Extract location data from request headers
 * @param {Request} request - GraphQL request object
 * @returns {Object|null} Location data or null
 */
function extractLocationFromHeaders(request) {
  const lat = request.headers.get('x-location-latitude');
  const lng = request.headers.get('x-location-longitude');

  if (!lat || !lng) return null;

  return {
    latitude: parseFloat(lat),
    longitude: parseFloat(lng),
    accuracy: parseFloat(request.headers.get('x-location-accuracy')) || null,
    address: request.headers.get('x-location-address') || null,
    timestamp: parseInt(request.headers.get('x-location-timestamp')) || Date.now(),
  };
}

const baseContext = async ({ request }) => {
  const token = request.headers.get('x-token');
  const location = extractLocationFromHeaders(request);

  const context = {
    location,
    headers: Object.fromEntries(request.headers.entries()),
  };

  if (token) {
    try {
      const me = await jwt.verify(token, SECRET);
      context.me = me;
    } catch (error) {
      throw new Error('Your session expired. Please sign in again.');
    }
  }

  return context;
};

export default baseContext;
