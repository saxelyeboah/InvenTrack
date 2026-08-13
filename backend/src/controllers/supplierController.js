const supplierService = require('../services/supplierService');

class SupplierController {
  async getAll(req, res, next) {
    try {
      const suppliers = await supplierService.getAllSuppliers();
      res.json(suppliers);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const supplier = await supplierService.createSupplier(req.body);
      res.status(201).json(supplier);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const supplier = await supplierService.updateSupplier(id, req.body);
      res.json(supplier);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await supplierService.deleteSupplier(id);
      res.json(deleted);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new SupplierController();
