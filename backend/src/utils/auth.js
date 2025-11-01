import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

export const decodeToken = (token) => {
  // Decode token without verification (for expired tokens)
  return jwt.decode(token);
};

export const verifyTokenIgnoreExpiry = (token) => {
  // Verify token but ignore expiration (for refresh endpoint)
  try {
    return jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw error; // Still throw for invalid tokens
    }
    // For expired tokens, we can still decode
    return jwt.decode(token);
  }
};
