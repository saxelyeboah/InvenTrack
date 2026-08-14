import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  Search,
  Plus,
  Edit2,
  Tag,
  RefreshCw,
  Boxes,
  Filter,
  X,
  Ban,
  CheckCircle2
} from 'lucide-react';
import ProductModal from '../components/modals/ProductModal';
import CategoryModal from '../components/modals/CategoryModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category_id', selectedCategory);

      const [prodRes, catRes] = await Promise.all([
        api.get(`/products?${params.toString()}`),
        api.get('/categories')
      ]);

      setProducts(prodRes.data);
      setCategories(catRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch products catalog');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const handleCreateOrUpdate = async (formData) => {
    if (editingProduct) {
      await api.put(`/products/${editingProduct.id}`, formData);
    } else {
      await api.post('/products', formData);
    }
    fetchProducts();
  };

  const handleCategorySave = async (categoryName) => {
    await api.post('/categories', { name: categoryName });
    fetchProducts();
  };

  const handleDeleteCategory = async (categoryId) => {
    await api.delete(`/categories/${categoryId}`);
    fetchProducts();
  };

  const handleToggleStatus = async (product) => {
    try {
      await api.patch(`/products/${product.id}/deactivate`, {
        is_active: !product.is_active
      });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const activeCategoryObj = categories.find((c) => String(c.id) === String(selectedCategory));

  return (
    <div className="app-page-content flex-1 flex flex-col min-h-0 space-y-5 animate-fade-in">
      {/* Top Header Card */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/60 p-5 border border-slate-800/80 rounded-2xl backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Products Catalog</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage SKUs, product pricing, stock levels, reorder thresholds, and active status.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCategoryModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-semibold transition-all shadow-sm"
          >
            <Tag className="w-4 h-4 text-sky-400" />
            <span>Add Category</span>
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setProductModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-sky-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Dribbble Style Toolbar & Active Filter Tags */}
      <div className="flex-shrink-0 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by SKU or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 w-full md:w-48"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <button
              onClick={fetchProducts}
              className="p-2 text-slate-400 hover:text-white bg-slate-950/80 border border-slate-800 rounded-xl transition-colors"
              title="Refresh list"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Filter Tags Row */}
        {(search || selectedCategory) && (
          <div className="flex items-center space-x-2 pt-2 border-t border-slate-800/60 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              Filters Applied:
            </span>
            {search && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-full">
                <span>Search: "{search}"</span>
                <button onClick={() => setSearch('')} className="hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeCategoryObj && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-sky-950 text-sky-300 border border-sky-800 rounded-full">
                <span>Category: {activeCategoryObj.name}</span>
                <button onClick={() => setSelectedCategory('')} className="hover:text-rose-400">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex-shrink-0 bg-rose-950/60 border border-rose-800/80 text-rose-300 p-4 rounded-xl text-xs font-medium">
          {error}
        </div>
      )}

      {/* Products Data Table */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="flex-1 min-h-0 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300 relative">
            <thead className="bg-slate-950 sticky top-0 z-10 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 shadow-sm">
              <tr>
                <th className="px-6 py-3.5">SKU Code</th>
                <th className="px-6 py-3.5">Product Name</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5 text-right">Cost Price</th>
                <th className="px-6 py-3.5 text-right">Selling Price</th>
                <th className="px-6 py-3.5 text-center">On-Hand Stock</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                    Loading products catalog...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                    No products found matching criteria.
                  </td>
                </tr>
              ) : (
                products.map((prod) => {
                  const isLowStock = prod.quantity_on_hand <= prod.reorder_level;
                  return (
                    <tr
                      key={prod.id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        !prod.is_active ? 'opacity-40 bg-slate-950/40' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-mono font-bold text-sky-400">{prod.sku}</td>
                      <td className="px-6 py-4 font-semibold text-slate-100">{prod.name}</td>
                      <td className="px-6 py-4 text-slate-400">{prod.category_name || 'Uncategorized'}</td>
                      <td className="px-6 py-4 text-right font-mono text-slate-300">
                        GHS {parseFloat(prod.cost_price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-emerald-400 font-bold">
                        GHS {parseFloat(prod.selling_price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                            isLowStock
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {prod.quantity_on_hand}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                            prod.is_active
                              ? 'bg-sky-950 text-sky-300 border border-sky-800'
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                          }`}
                        >
                          {prod.is_active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingProduct(prod);
                            setProductModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(prod)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                            prod.is_active
                              ? 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/60'
                              : 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/60'
                          }`}
                          title={prod.is_active ? 'Click to Deactivate' : 'Click to Activate'}
                        >
                          {prod.is_active ? (
                            <>
                              <Ban className="w-3.5 h-3.5" />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSave={handleCreateOrUpdate}
        product={editingProduct}
        categories={categories}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSave={handleCategorySave}
        onDelete={handleDeleteCategory}
        categories={categories}
      />
    </div>
  );
};

export default Products;
