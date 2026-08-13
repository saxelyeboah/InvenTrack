const productRepository = require('../repositories/productRepository');
const {
  sanitizeString,
  sanitizeSku,
  isPositiveNumber,
  isNonNegativeInteger
} = require('../utils/validators');

class ProductController {
  async getAll(req, res, next) {
    try {
      const { search, category_id, active_only } = req.query;
      const products = await productRepository.findAll({
        search: search ? sanitizeString(search) : undefined,
        category_id,
        active_only: active_only === 'true'
      });
      res.json(products);
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const product = await productRepository.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const { sku, name, category_id, cost_price, selling_price, reorder_level, initial_quantity } = req.body;
      
      const cleanSku = sanitizeSku(sku);
      const cleanName = sanitizeString(name);

      if (!cleanSku || !cleanName) {
        return res.status(400).json({ error: 'Valid SKU and Product Name are required' });
      }

      if (!isPositiveNumber(cost_price)) {
        return res.status(400).json({ error: 'Cost price must be a valid positive number greater than 0' });
      }

      if (!isPositiveNumber(selling_price)) {
        return res.status(400).json({ error: 'Selling price must be a valid positive number greater than 0' });
      }

      const reorderLevelNum = reorder_level !== undefined && reorder_level !== '' ? Number(reorder_level) : 5;
      if (!isNonNegativeInteger(reorderLevelNum)) {
        return res.status(400).json({ error: 'Reorder level must be a valid non-negative integer (0 or greater)' });
      }

      const initialQtyNum = initial_quantity !== undefined && initial_quantity !== '' ? Number(initial_quantity) : 0;
      if (!isNonNegativeInteger(initialQtyNum)) {
        return res.status(400).json({ error: 'Initial quantity must be a valid non-negative integer (0 or greater)' });
      }

      const existingSku = await productRepository.findBySku(cleanSku);
      if (existingSku) {
        return res.status(400).json({ error: `A product with SKU "${cleanSku}" already exists` });
      }

      const product = await productRepository.create({
        sku: cleanSku,
        name: cleanName,
        category_id: category_id ? Number(category_id) : null,
        cost_price: Number(cost_price).toFixed(2),
        selling_price: Number(selling_price).toFixed(2),
        reorder_level: reorderLevelNum,
        quantity_on_hand: initialQtyNum
      });

      res.status(201).json(product);
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { sku, name, category_id, cost_price, selling_price, reorder_level } = req.body;

      const existing = await productRepository.findById(id);
      if (!existing) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const cleanSku = sku ? sanitizeSku(sku) : existing.sku;
      const cleanName = name ? sanitizeString(name) : existing.name;

      if (!cleanSku || !cleanName) {
        return res.status(400).json({ error: 'Valid SKU and Product Name are required' });
      }

      if (cost_price !== undefined && !isPositiveNumber(cost_price)) {
        return res.status(400).json({ error: 'Cost price must be a valid positive number greater than 0' });
      }

      if (selling_price !== undefined && !isPositiveNumber(selling_price)) {
        return res.status(400).json({ error: 'Selling price must be a valid positive number greater than 0' });
      }

      if (reorder_level !== undefined && !isNonNegativeInteger(reorder_level)) {
        return res.status(400).json({ error: 'Reorder level must be a valid non-negative integer (0 or greater)' });
      }

      if (cleanSku.toUpperCase() !== existing.sku.toUpperCase()) {
        const skuCheck = await productRepository.findBySku(cleanSku);
        if (skuCheck) {
          return res.status(400).json({ error: `A product with SKU "${cleanSku}" already exists` });
        }
      }

      const updated = await productRepository.update(id, {
        sku: cleanSku,
        name: cleanName,
        category_id: category_id ? Number(category_id) : null,
        cost_price: cost_price !== undefined ? Number(cost_price).toFixed(2) : existing.cost_price,
        selling_price: selling_price !== undefined ? Number(selling_price).toFixed(2) : existing.selling_price,
        reorder_level: reorder_level !== undefined ? Number(reorder_level) : existing.reorder_level
      });

      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  async toggleStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      const updated = await productRepository.setStatus(id, Boolean(is_active));
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ProductController();
