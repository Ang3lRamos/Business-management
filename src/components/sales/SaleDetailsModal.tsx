import type { SaleWithDetails } from '../../types/database';
import { X, User, Calendar, CreditCard, FileText, Package } from 'lucide-react';

interface SaleDetailsModalProps {
  sale: SaleWithDetails;
  onClose: () => void;
}

export default function SaleDetailsModal({ sale, onClose }: SaleDetailsModalProps) {
  // Badge de estado
  const getStatusBadge = () => {
    if (sale.status === 'cancelled') {
      return <span className="badge badge-danger">Anulada</span>;
    }
    if (sale.payment_status === 'paid') {
      return <span className="badge badge-success">Pagado</span>;
    }
    if (sale.payment_status === 'pending') {
      return <span className="badge badge-warning">Pendiente</span>;
    }
    return <span className="badge badge-info">Parcial</span>;
  };

  // Método de pago
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Detalles de Venta
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Factura: <span className="font-mono font-semibold text-primary-600">{sale.sale_number}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Información general */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold">Fecha</h3>
              </div>
              <p className="text-gray-900">
                {new Date(sale.sale_date).toLocaleDateString('es-CO', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold">Cliente</h3>
              </div>
              <p className="text-gray-900">
                {sale.customer?.full_name || 'Cliente Ocasional'}
              </p>
              {sale.customer?.phone && (
                <p className="text-sm text-gray-600">{sale.customer.phone}</p>
              )}
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold">Método de Pago</h3>
              </div>
              <p className="text-gray-900">{getPaymentMethod(sale.payment_method)}</p>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold">Estado</h3>
              </div>
              {getStatusBadge()}
            </div>
          </div>

          {/* Vendedor */}
          <div className="card">
            <h3 className="font-semibold mb-2">Vendedor</h3>
            <p className="text-gray-900">
              {sale.created_by_profile?.full_name || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              {sale.created_by_profile?.role === 'admin' ? 'Administrador' : 'Vendedor'}
            </p>
          </div>

          {/* Productos */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-gray-400" />
              <h3 className="font-semibold">Productos</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Producto
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Cantidad
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Precio
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Descuento
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sale.sale_details?.map((detail) => (
                    <tr key={detail.id}>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {detail.product.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {detail.product.sku}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {Number(detail.quantity).toFixed(2)} {detail.product.unit}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        ${Number(detail.unit_price).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        ${Number(detail.discount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        ${Number(detail.subtotal).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales */}
          <div className="card bg-gray-50">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium text-gray-900">
                  ${Number(sale.subtotal).toLocaleString()}
                </span>
              </div>
              
              {Number(sale.discount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Descuento:</span>
                  <span className="font-medium text-red-600">
                    -${Number(sale.discount).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">IVA ({sale.tax_percentage}%):</span>
                <span className="font-medium text-gray-900">
                  ${Number(sale.tax).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t border-gray-300">
                <span className="text-lg font-bold text-gray-900">TOTAL:</span>
                <span className="text-lg font-bold text-primary-600">
                  ${Number(sale.total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {sale.notes && (
            <div className="card bg-blue-50 border border-blue-200">
              <h3 className="font-semibold mb-2 text-blue-900">Notas</h3>
              <p className="text-sm text-blue-800">{sale.notes}</p>
            </div>
          )}

          {/* Info adicional */}
          <div className="text-xs text-gray-500 text-center">
            Creada el {new Date(sale.created_at).toLocaleString('es-CO')}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="btn-secondary flex-1"
          >
            Cerrar
          </button>
          <button
            onClick={() => alert('Función de impresión próximamente...')}
            className="btn-primary flex-1"
          >
            Imprimir Factura
          </button>
        </div>
      </div>
    </div>
  );
}