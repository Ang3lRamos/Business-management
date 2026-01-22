import { useState, useEffect } from 'react';
import type { Product, Category, ProductFormData } from '../../types/database';
import { X } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  categories: Category[];
  onSubmit: (data: ProductFormData) => void;
  onClose: () => void;
}

export default function ProductModal({
  product,
  categories,
  onSubmit,
  onClose,
}: ProductModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    sku: '',
    name: '',
    description: '',
    category_id: '',
    cost_price: 0,
    unit_price: 0,
    stock: 0,
    min_stock: 0,
    unit: 'unidad',
    track_inventory: true,
    product_type: 'finished',
    is_active: true,
  });

  const [loading, setLoading] = useState(false);

  // Cargar datos del producto si estamos editando
  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        category_id: product.category_id || '',
        cost_price: Number(product.cost_price),
        unit_price: Number(product.unit_price),
        stock: Number(product.stock),
        min_stock: Number(product.min_stock),
        unit: product.unit,
        track_inventory: product.track_inventory,
        product_type: product.product_type,
        is_active: product.is_active,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? parseFloat(value) || 0
          : type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  // Calcular margen
  const margin = formData.cost_price > 0
    ? ((formData.unit_price - formData.cost_price) / formData.cost_price * 100).toFixed(1)
    : '0';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">SKU *</label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="input"
                required
                placeholder="PROD-001"
                disabled={loading}
              />
            </div>

            <div>
              <label className="label">Nombre *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                required
                placeholder="Nombre del producto"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows={3}
              placeholder="Descripción del producto..."
              disabled={loading}
            />
          </div>

          <div>
            <label className="label">Categoría</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="input"
              disabled={loading}
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Precios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Precio de Costo *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  name="cost_price"
                  value={formData.cost_price}
                  onChange={handleChange}
                  className="input pl-7"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="label">Precio de Venta *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  name="unit_price"
                  value={formData.unit_price}
                  onChange={handleChange}
                  className="input pl-7"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="label">Margen de Ganancia</label>
              <div className="input bg-gray-50 flex items-center justify-center font-semibold text-green-600">
                {margin}%
              </div>
            </div>
          </div>

          {/* Inventario */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Stock Actual *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="input"
                min="0"
                step="0.01"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="label">Stock Mínimo *</label>
              <input
                type="number"
                name="min_stock"
                value={formData.min_stock}
                onChange={handleChange}
                className="input"
                min="0"
                step="0.01"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Alerta cuando stock sea igual o menor
              </p>
            </div>

            <div>
              <label className="label">Unidad de Medida *</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="input"
                disabled={loading}
              >
                <option value="unidad">Unidad</option>
                <option value="kg">Kilogramos</option>
                <option value="litros">Litros</option>
                <option value="metros">Metros</option>
                <option value="cajas">Cajas</option>
                <option value="paquetes">Paquetes</option>
              </select>
            </div>
          </div>

          {/* Opciones */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="track_inventory"
                checked={formData.track_inventory}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    track_inventory: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">
                Controlar inventario
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_active: e.target.checked,
                  }))
                }
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                disabled={loading}
              />
              <span className="text-sm text-gray-700">Producto activo</span>
            </label>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Guardando...' : product ? 'Actualizar' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}