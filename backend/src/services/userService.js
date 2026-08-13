const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { sanitizeString, isValidEmail } = require('../utils/validators');

class UserService {
  async getAllUsers() {
    return await userRepository.findAll();
  }

  async createUser({ name, email, password, role }) {
    const cleanName = sanitizeString(name);
    const cleanEmail = sanitizeString(email).toLowerCase();

    if (!cleanName || cleanName.length === 0) {
      throw { statusCode: 400, message: 'User full name is required' };
    }

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      throw { statusCode: 400, message: 'Valid email address is required' };
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      throw { statusCode: 400, message: 'Password must be at least 6 characters long' };
    }

    const validRole = role === 'ADMIN' ? 'ADMIN' : 'STAFF';

    const existing = await userRepository.findByEmail(cleanEmail);
    if (existing) {
      throw { statusCode: 400, message: 'A user with this email address already exists' };
    }

    const password_hash = await bcrypt.hash(password, 10);
    return await userRepository.create({
      name: cleanName,
      email: cleanEmail,
      password_hash,
      role: validRole
    });
  }

  async toggleUserStatus(id, isActive) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return await userRepository.updateStatus(id, Boolean(isActive));
  }
}

module.exports = new UserService();
