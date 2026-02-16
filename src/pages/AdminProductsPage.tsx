import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { fetchProducts, saveProduct, deleteProduct, uploadProductImage } from '@/services/productService';
import { formatPrice } from '@/utils/helpers';
import type { Product } from '@/types';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProduct({
      name: '',
      description: '',
      price: 0,
      category: '',
      images: [],
      weight_kg: 0,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      let images = editingProduct.images || [];
      // If there are new images to upload
      if ((editingProduct as any)._newImages && Array.isArray((editingProduct as any)._newImages)) {
        // If editing, use product id, else use a temp id (will be replaced after insert)
        let productId = editingProduct.id || `temp`;
        const uploadedUrls: string[] = [];
        for (const file of (editingProduct as any)._newImages) {
          // If product is new, we'll need to upload after insert (since we need the id)
          if (!editingProduct.id) continue;
          const url = await uploadProductImage(file, productId);
          uploadedUrls.push(url);
        }
        images = [...images, ...uploadedUrls];
      }

      // If creating a new product and there are new images, save product first to get id, then upload images
      let savedProduct = { ...editingProduct, images };
      if (!editingProduct.id && (editingProduct as any)._newImages && (editingProduct as any)._newImages.length > 0) {
        // Save product without images to get id
        const tempProduct = { ...editingProduct, images: [] };
        const created = await saveProduct(tempProduct);
        // Now upload images with the new id
        const uploadedUrls: string[] = [];
        for (const file of (editingProduct as any)._newImages) {
          const url = await uploadProductImage(file, created.id);
          uploadedUrls.push(url);
        }
        // Update product with image URLs
        savedProduct = { ...created, images: uploadedUrls };
        await saveProduct(savedProduct);
      } else {
        // For edit or no new images, just save
        savedProduct = { ...editingProduct, images };
        await saveProduct(savedProduct);
      }

      await loadProducts();
      setShowModal(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(id);
      await loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold">Products</h1>
        <button onClick={handleAdd} className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Weight
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden mr-3">
                      {product.images?.[0] && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold">{product.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">
                        {product.description}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm capitalize">{product.category}</td>
                <td className="px-6 py-4 text-sm font-semibold">
                  {formatPrice(product.price)}
                </td>
                <td className="px-6 py-4 text-sm">{product.weight_kg}kg</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      product.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {product.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-800 mr-3"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold">
                {editingProduct.id ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Name</label>
                <input
                  type="text"
                  required
                  className="input w-full"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  className="input w-full resize-none"
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Price (R)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="input w-full"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    className="input w-full"
                    value={editingProduct.weight_kg}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        weight_kg: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Category</label>
                <input
                  type="text"
                  required
                  className="input w-full"
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, category: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Product Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="input w-full"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (!files) return;
                    setEditingProduct({
                      ...editingProduct,
                      // We'll handle upload on save, just store FileList for now
                      _newImages: Array.from(files),
                    });
                  }}
                />
                {/* Show current image URLs if editing */}
                {editingProduct.images && editingProduct.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editingProduct.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Product image ${idx + 1}`}
                        className="w-16 h-16 object-cover rounded border"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  className="mr-2"
                  checked={editingProduct.is_active}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      is_active: e.target.checked,
                    })
                  }
                />
                <label htmlFor="is_active" className="text-sm font-semibold">
                  Active
                </label>
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  Save Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
