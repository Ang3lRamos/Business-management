import { useState } from 'react';
import { usePurchases } from '../hooks/usePurchases';
import { useAuth } from '../context/AuthContext';
import PurchasesList from '../components/purchases/PurchasesList';
import CreatePurchaseModal from '../components/purchases/CreatePurchaseModal';
import { Plus, FileText, DollarSign, Package, TrendingUp } from 'lucide-react';

export default function PurchasesPage() {
  const { purchases, suppliers, loading, createPurchase, cancelPurchase } = usePurchases();
  const { isAdmin } = useAuth();
  
  const [showModal, setShowModal] = useState(false);

  // Estadísticas
  const totalPurchases = purchases
    .filter(p => p.status === 'completed')
    .reduce((sum, purchase) => sum + Number(purchase.total), 0);

  const thisMonthPurchases = purchases.filter(p => {
    const purchaseDate = new Date(p.purchase_date);
    const now = new Date();
    return (
      purchaseDate.getMonth() === now.getMonth() &&
      purchaseDate.getFullYear() === now.getFullYear() &&
      p.status === 'completed'
    );
  });

  const thisMonthTotal = thisMonthPurchases.reduce(
    (sum, purchase) => sum + Number(purchase.total), 
    0
  );

  const handleCreatePurchase = async (data: any) => {
    const { error } = await createPurchase(data);
    
    if (error) {
      alert(`Error: ${error}`);
      return;
    }
    
    setShowModal(false);
  };

  const handleCancelPurchase = async (id: string) => {
    if (!confirm('¿Estás seguro de anular esta compra? Esto restará el stock agregado.')) return;

    const { error } = await cancelPurchase(id);
    
    if (error) {
      alert(`Error: ${error}`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Acceso Denegado</h2>
        <p className="text-gray-600 mt-2">
          Solo administradores pueden gestionar compras
        </p>
      </div>
    );
  }

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
            <FileText className="w-7 h-7" />
            Compras
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona las compras a proveedores
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Compra
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Compras</p>
              <p className="text-2xl font-bold text-gray-900">
                {purchases.filter(p => p.status === 'completed').length}
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
              <p className="text-sm text-gray-600">Compras del Mes</p>
              <p className="text-2xl font-bold text-gray-900">
                ${thisMonthTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Histórico</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalPurchases.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista */}
      <PurchasesList
        purchases={purchases}
        onCancel={handleCancelPurchase}
      />

      {/* Modal */}
      {showModal && (
        <CreatePurchaseModal
          suppliers={suppliers}
          onSubmit={handleCreatePurchase}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}