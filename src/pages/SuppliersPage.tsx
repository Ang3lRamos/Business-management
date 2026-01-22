import { useState } from 'react';
import { useSuppliers } from '../hooks/useSuppliers';
import { useAuth } from '../context/AuthContext';
import SuppliersList from '../components/suppliers/SuppliersList';
import SupplierModal from '../components/suppliers/SupplierModal';
import { Plus, TruckIcon, DollarSign, Building2 } from 'lucide-react';
import type { Supplier } from '../types/database';

export default function SuppliersPage() {
  const { suppliers, loading, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const { isAdmin } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Estadísticas
  const totalSuppliers = suppliers.length;
  const totalCreditAvailable = suppliers.reduce((sum, s) => sum + Number(s.credit_limit), 0);

  const handleCreate = () => {
    setEditingSupplier(null);
    setShowModal(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;

    const { error } = await deleteSupplier(id);
    
    if (error) {
      alert(`Error: ${error}`);
    }
  };

  const handleSubmit = async (data: any) => {
    if (editingSupplier) {
      const { error } = await updateSupplier(editingSupplier.id, data);
      if (error) {
        alert(`Error: ${error}`);
        return;
      }
    } else {
      const { error } = await createSupplier(data);
      if (error) {
        alert(`Error: ${error}`);
        return;
      }
    }
    
    setShowModal(false);
    setEditingSupplier(null);
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
            <TruckIcon className="w-7 h-7" />
            Proveedores
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona los proveedores del negocio
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleCreate}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nuevo Proveedor
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Proveedores</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalSuppliers}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Crédito Disponible</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalCreditAvailable.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TruckIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Proveedores Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalSuppliers}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista */}
      <SuppliersList
        suppliers={suppliers}
        onEdit={isAdmin ? handleEdit : undefined}
        onDelete={isAdmin ? handleDelete : undefined}
      />

      {/* Modal */}
      {showModal && (
        <SupplierModal
          supplier={editingSupplier}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            setEditingSupplier(null);
          }}
        />
      )}
    </div>
  );
}