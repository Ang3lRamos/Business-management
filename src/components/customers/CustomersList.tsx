import { useState } from 'react';
import type { Customer } from '../../types/database';
import { Edit2, Trash2, Search, Building2, UserCircle, Phone, Mail, CreditCard } from 'lucide-react';

interface CustomersListProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onDelete?: (id: string) => void;
}

export default function CustomersList({ customers, onEdit, onDelete }: CustomersListProps) {
  const [search, setSearch] = useState('');

  // Filtrar clientes
  const filteredCustomers = customers.filter((customer) => {
    const searchLower = search.toLowerCase();
    return (
      customer.full_name.toLowerCase().includes(searchLower) ||
      customer.phone.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.tax_id?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="card">
      {/* Búsqueda */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, teléfono, email o NIT..."
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
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contacto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                NIT/CC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Crédito
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Saldo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">
                    {search ? 'No se encontraron clientes' : 'No hay clientes registrados'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => {
                const hasDebt = Number(customer.current_balance) > 0;
                const creditUsage = customer.credit_limit > 0 
                  ? (Number(customer.current_balance) / customer.credit_limit * 100).toFixed(0)
                  : 0;

                return (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          customer.customer_type === 'business' 
                            ? 'bg-purple-100' 
                            : 'bg-blue-100'
                        }`}>
                          {customer.customer_type === 'business' ? (
                            <Building2 className="w-5 h-5 text-purple-600" />
                          ) : (
                            <UserCircle className="w-5 h-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {customer.full_name}
                          </div>
                          {customer.city && (
                            <div className="text-sm text-gray-500">{customer.city}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        customer.customer_type === 'business' 
                          ? 'badge-info' 
                          : 'badge-success'
                      }`}>
                        {customer.customer_type === 'business' ? 'Empresa' : 'Individual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {customer.phone}
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {customer.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.tax_id || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${Number(customer.credit_limit).toLocaleString()}
                      </div>
                      {customer.credit_limit > 0 && (
                        <div className="text-xs text-gray-500">
                          {creditUsage}% usado
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasDebt ? (
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-medium text-red-600">
                            ${Number(customer.current_balance).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">$0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(customer)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(customer.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
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
      {filteredCustomers.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredCustomers.length} de {customers.length} clientes
        </div>
      )}
    </div>
  );
}