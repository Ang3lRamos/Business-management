import { useState } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { useAuth } from '../context/AuthContext';
import CustomersList from '../components/customers/CustomersList';
import CustomerModal from '../components/customers/CustomerModal';
import { Plus, Users, DollarSign, Building2, UserCircle } from 'lucide-react';
import type { Customer } from '../types/database';

export default function CustomersPage() {
  const { customers, loading, createCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const { isAdmin } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Estadísticas
  const totalCustomers = customers.length;
  const businessCustomers = customers.filter(c => c.customer_type === 'business').length;
  const individualCustomers = customers.filter(c => c.customer_type === 'individual').length;
  const totalDebt = customers.reduce((sum, c) => sum + Number(c.current_balance), 0);

  const handleCreate = () => {
    setEditingCustomer(null);
    setShowModal(true);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;

    const { error } = await deleteCustomer(id);
    
    if (error) {
      alert(`Error: ${error}`);
    }
  };

  const handleSubmit = async (data: any) => {
    if (editingCustomer) {
      const { error } = await updateCustomer(editingCustomer.id, data);
      if (error) {
        alert(`Error: ${error}`);
        return;
      }
    } else {
      const { error } = await createCustomer(data);
      if (error) {
        alert(`Error: ${error}`);
        return;
      }
    }
    
    setShowModal(false);
    setEditingCustomer(null);
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
            <Users className="w-7 h-7" />
            Clientes
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona la base de clientes
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalCustomers}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Empresas</p>
              <p className="text-2xl font-bold text-gray-900">
                {businessCustomers}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Individuales</p>
              <p className="text-2xl font-bold text-gray-900">
                {individualCustomers}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Cartera Total</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalDebt.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista */}
      <CustomersList
        customers={customers}
        onEdit={handleEdit}
        onDelete={isAdmin ? handleDelete : undefined}
      />

      {/* Modal */}
      {showModal && (
        <CustomerModal
          customer={editingCustomer}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            setEditingCustomer(null);
          }}
        />
      )}
    </div>
  );
}