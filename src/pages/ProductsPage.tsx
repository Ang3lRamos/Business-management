import { useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../context/AuthContext';
import ProductList from '../components/products/ProductList';
import ProductModal from '../components/products/ProductModal';
import { Plus, Package, AlertTriangle } from 'lucide-react';
import type { Product } from '../types/database';

export default function ProductsPage() {
  const { products, categories, loading, createProduct, updateProduct, deleteProduct } = useProducts();
  const { isAdmin } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filter, setFilter] = useState<'all' | 'low-stock'>('all');

  // Productos filtrados
  const filteredProducts = filter === 'low-stock' 
    ? products.filter(p => p.track_inventory && p.stock <= p.min_stock)
    : products;

  // Productos con stock bajo
  const lowStockCount = products.filter(
    p => p.track_inventory && p.stock <= p.min_stock
  ).length;

  const handleCreate = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    console.log('🗑️ Eliminando producto:', id);
    
    const { error } = await deleteProduct(id);
    
    if (error) {
      console.error('❌ Error al eliminar:', error);
      alert(`Error: ${error}`);
    } else {
      console.log('✅ Producto eliminado correctamente');
    }
  };

  const handleSubmit = async (data: any) => {
    if (editingProduct) {
      const { error } = await updateProduct(editingProduct.id, data);
      if (error) {
        alert(`Error: ${error}`);
        return;
      }
    } else {
      const { error } = await createProduct(data);
      if (error) {
        alert(`Error: ${error}`);
        return;
      }
    }
    
    setShowModal(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-7 h-7" />
            Productos
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona tu inventario de productos
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </button>
        )}
      </div>

      {/* Alertas de stock bajo */}
      {lowStockCount > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900">
              Stock Bajo Detectado
            </h3>
            <p className="text-sm text-yellow-800 mt-1">
              {lowStockCount} {lowStockCount === 1 ? 'producto tiene' : 'productos tienen'} stock por debajo del mínimo.
            </p>
          </div>
          <button
            onClick={() => setFilter(filter === 'all' ? 'low-stock' : 'all')}
            className="text-sm font-medium text-yellow-700 hover:text-yellow-900"
          >
            {filter === 'all' ? 'Ver productos' : 'Ver todos'}
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-sm text-gray-600">Total Productos</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {products.length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Stock Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {products.reduce((sum, p) => sum + Number(p.stock), 0).toFixed(0)}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-600">Valor Inventario</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            ${products.reduce((sum, p) => sum + (Number(p.stock) * Number(p.unit_price)), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Lista de productos */}
      <ProductList
        products={filteredProducts}
        onEdit={isAdmin ? handleEdit : undefined}
        onDelete={isAdmin ? handleDelete : undefined}
      />

      {/* Modal */}
      {showModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
        />
      )}
    </div>
  );
}