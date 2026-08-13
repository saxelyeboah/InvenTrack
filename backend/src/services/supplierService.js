const supplierRepository = require('../repositories/supplierRepository');
const { sanitizeString, isValidEmail, isValidPhone } = require('../utils/validators');

class SupplierService {
  async getAllSuppliers() {
    return await supplierRepository.findAll();
  }

  validateSupplierData(data) {
    const name = sanitizeString(data.name);
    const contact_person = sanitizeString(data.contact_person);
    const phone = sanitizeString(data.phone);
    const email = sanitizeString(data.email);

    if (!name || name.length === 0) {
      throw { statusCode: 400, message: 'Supplier name is required' };
    }

    if (phone && !isValidPhone(phone)) {
      throw { statusCode: 400, message: 'Invalid phone number. Phone number cannot contain letters.' };
    }

    if (email && !isValidEmail(email)) {
      throw { statusCode: 400, message: 'Invalid email address format' };
    }

    return { name, contact_person, phone, email };
  }

  async createSupplier(data) {
    const sanitizedData = this.validateSupplierData(data);
    return await supplierRepository.create(sanitizedData);
  }

  async updateSupplier(id, data) {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw { statusCode: 404, message: 'Supplier not found' };
    }
    const sanitizedData = this.validateSupplierData(data);
    return await supplierRepository.update(id, sanitizedData);
  }

  async deleteSupplier(id) {
    const supplier = await supplierRepository.findById(id);
    if (!supplier) {
      throw { statusCode: 404, message: 'Supplier not found' };
    }
    return await supplierRepository.delete(id);
  }
}

module.exports = new SupplierService();
