import { useState } from 'react';
import { useSales } from '../hooks/useSales';
import { useAuth } from '../context/AuthContext';
import SalesList from '../components/sales/SalesList';
import CreateSaleModal from '../components/sales/CreateSaleModal';
import { Plus, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

export default function SalesPage() {
  const { sales, customers, loading, createSale, cancelSale } = useSales();
  const { isAdmin } = useAuth();
  
  const [showModal, setShowModal] = useState(false);

  // Calcular estadísticas
  const totalSales = sales
    .filter(s => s.status === 'completed')
    .reduce((sum, sale) => sum + Number(sale.total), 0);

  const todaySales = sales.filter(s => {
    const today = new Date().toISOString().split('T')[0];
    return s.sale_date === today && s.status === 'completed';
  });

  const todayTotal = todaySales.reduce((sum, sale) => sum + Number(sale.total), 0);

  const handleCreateSale = async (data: any) => {
    const { error } = await createSale(data);
    
    if (error) {
      alert(`Error: ${error}`);
      return;
    }
    
    setShowModal(false);
  };

  const handleCancelSale = async (id: string) => {
    if (!confirm('¿Estás seguro de anular esta venta? Esto devolverá el stock.')) return;

    const { error } = await cancelSale(id);
    
    if (error) {
      alert(`Error: ${error}`);
    }
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
            <ShoppingCart className="w-7 h-7" />
            Ventas
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona las ventas del negocio
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Venta
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ventas del Mes</p>
              <p className="text-2xl font-bold text-gray-900">
                ${totalSales.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ventas Hoy</p>
              <p className="text-2xl font-bold text-gray-900">
                {todaySales.length}
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
              <p className="text-sm text-gray-600">Total Hoy</p>
              <p className="text-2xl font-bold text-gray-900">
                ${todayTotal.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de ventas */}
      <SalesList
        sales={sales}
        onCancel={isAdmin ? handleCancelSale : undefined}
      />

      {/* Modal crear venta */}
      {showModal && (
        <CreateSaleModal
          customers={customers}
          onSubmit={handleCreateSale}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}