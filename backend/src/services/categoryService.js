const categoryRepository = require('../repositories/categoryRepository');

class CategoryService {
  async getAllCategories() {
    return await categoryRepository.findAll();
  }

  async createCategory(name) {
    if (!name || name.trim().length === 0) {
      throw { statusCode: 400, message: 'Category name is required' };
    }
    return await categoryRepository.create(name);
  }

  async deleteCategory(id) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw { statusCode: 404, message: 'Category not found' };
    }
    return await categoryRepository.delete(id);
  }
}

module.exports = new CategoryService();
