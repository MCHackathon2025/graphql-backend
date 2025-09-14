import jwt from 'jsonwebtoken';

// TODO: no hardcode and exposed secret...
const SECRET = 'abc';

const baseContext = async ({ request }) => {
  const token = request.headers.get('x-token');
  if (token) {
    try {
      const me = await jwt.verify(token, SECRET);
      return { me };
    } catch (error) {
      throw new Error('Your session expired. Please sign in again.');
    }
  }
  return {};
};

export default baseContext;
