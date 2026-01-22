import { useState } from 'react';
import type { ProductWithCategory } from '../../types/database';
import { Edit2, Trash2, Search, AlertCircle } from 'lucide-react';

interface ProductListProps {
  products: ProductWithCategory[];
  onEdit?: (product: ProductWithCategory) => void;
  onDelete?: (id: string) => void;
}

export default function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  const [search, setSearch] = useState('');

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter((product) => {
    const searchLower = search.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.sku.toLowerCase().includes(searchLower) ||
      product.category?.name.toLowerCase().includes(searchLower)
    );
  });

  // Calcular margen de ganancia
  const calculateMargin = (costPrice: number, unitPrice: number) => {
    if (costPrice === 0) return 0;
    return ((unitPrice - costPrice) / costPrice * 100).toFixed(1);
  };

  return (
    <div className="card">
      {/* Búsqueda */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Costo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio Venta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Margen
              </th>
              {(onEdit || onDelete) && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={onEdit || onDelete ? 8 : 7}
                  className="px-6 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-12 h-12 text-gray-300" />
                    <p className="text-gray-500">
                      {search ? 'No se encontraron productos' : 'No hay productos registrados'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const isLowStock = product.track_inventory && product.stock <= product.min_stock;
                const margin = calculateMargin(Number(product.cost_price), Number(product.unit_price));

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <span className="text-gray-400 text-xs font-semibold">
                              {product.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">
                        {product.sku}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.category ? (
                        <span className="badge badge-info">
                          {product.category.name}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Sin categoría</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isLowStock && (
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            isLowStock ? 'text-yellow-700' : 'text-gray-900'
                          }`}
                        >
                          {Number(product.stock).toFixed(0)} {product.unit}
                        </span>
                      </div>
                      {isLowStock && (
                        <p className="text-xs text-gray-500 mt-1">
                          Mín: {Number(product.min_stock).toFixed(0)}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${Number(product.cost_price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${Number(product.unit_price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-medium ${
                          Number(margin) > 50
                            ? 'text-green-600'
                            : Number(margin) > 20
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {margin}%
                      </span>
                    </td>
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(product)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Editar"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(product.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Eliminar"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {filteredProducts.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <p>
            Mostrando {filteredProducts.length} de {products.length} productos
          </p>
        </div>
      )}
    </div>
  );
}