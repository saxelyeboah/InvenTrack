const categoryService = require('../services/categoryService');

class CategoryController {
  async getAll(req, res, next) {
    try {
      const categories = await categoryService.getAllCategories();
      res.json(categories);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { name } = req.body;
      const category = await categoryService.createCategory(name);
      res.status(201).json(category);
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await categoryService.deleteCategory(id);
      res.json(deleted);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new CategoryController();
