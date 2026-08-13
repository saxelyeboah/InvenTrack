const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const JWT_SECRET = process.env.JWT_SECRET || 'inventrack_super_secret_jwt_key_2026_cscd602';
const JWT_EXPIRES_IN = '24h';

class AuthService {
  async login(email, password) {
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';

    if (!cleanEmail) {
      throw { statusCode: 400, message: 'Please enter your email address.' };
    }

    if (!password) {
      throw { statusCode: 400, message: 'Please enter your password.' };
    }

    const user = await userRepository.findByEmail(cleanEmail);
    if (!user) {
      throw { statusCode: 401, message: 'No user account found with this email. Please check for typos or contact an administrator.' };
    }

    if (!user.is_active) {
      throw { statusCode: 403, message: 'Your account is deactivated. Please contact your system administrator to re-enable access.' };
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Incorrect password. Please double-check your password and try again.' };
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await userRepository.findById(decoded.id);
      if (!user || !user.is_active) {
        throw new Error('User inactive or invalid');
      }
      return user;
    } catch (err) {
      throw { statusCode: 401, message: 'Your session has expired. Please sign in again.' };
    }
  }
}

module.exports = new AuthService();
