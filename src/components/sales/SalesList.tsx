import { useState } from 'react';
import type { SaleWithDetails } from '../../types/database';
import { Eye, XCircle, Search, User, CreditCard, Calendar } from 'lucide-react';
import SaleDetailsModal from './SaleDetailsModal';

interface SalesListProps {
  sales: SaleWithDetails[];
  onCancel?: (id: string) => void;
}

export default function SalesList({ sales, onCancel }: SalesListProps) {
  const [search, setSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<SaleWithDetails | null>(null);

  // Filtrar ventas por búsqueda
  const filteredSales = sales.filter((sale) => {
    const searchLower = search.toLowerCase();
    return (
      sale.sale_number.toLowerCase().includes(searchLower) ||
      sale.customer?.full_name.toLowerCase().includes(searchLower) ||
      sale.created_by_profile?.full_name.toLowerCase().includes(searchLower)
    );
  });

  // Badge de estado de pago
  const getPaymentBadge = (status: string) => {
    const badges = {
      paid: 'badge-success',
      pending: 'badge-warning',
      partial: 'badge-info',
    };
    const labels = {
      paid: 'Pagado',
      pending: 'Pendiente',
      partial: 'Parcial',
    };
    return { class: badges[status as keyof typeof badges], label: labels[status as keyof typeof labels] };
  };

  // Badge de método de pago
  const getPaymentMethod = (method: string) => {
    const methods = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      credit: 'Crédito',
    };
    return methods[method as keyof typeof methods] || method;
  };

  return (
    <>
      <div className="card">
        {/* Búsqueda */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número, cliente o vendedor..."
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Vendedor
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">No se encontraron ventas</p>
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const paymentBadge = getPaymentBadge(sale.payment_status);
                  
                  return (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono font-semibold text-primary-600">
                          {sale.sale_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(sale.sale_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {sale.customer?.full_name || 'Cliente Ocasional'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">
                          ${Number(sale.total).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {getPaymentMethod(sale.payment_method)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`badge ${paymentBadge.class}`}>
                          {paymentBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {sale.created_by_profile?.full_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalles"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {onCancel && sale.status === 'completed' && (
                            <button
                              onClick={() => onCancel(sale.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Anular venta"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filteredSales.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Mostrando {filteredSales.length} de {sales.length} ventas
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {selectedSale && (
        <SaleDetailsModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </>
  );
}