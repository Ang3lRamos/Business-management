import { useState } from 'react';
import { useProducts } from '../../hooks/useProducts';
import type { Customer, Product } from '../../types/database';
import { X, Plus, Minus, Trash2, ShoppingCart, AlertCircle } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
}

interface CreateSaleModalProps {
  customers: Customer[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}

export default function CreateSaleModal({ customers, onSubmit, onClose }: CreateSaleModalProps) {
  const { products, loading: productsLoading } = useProducts();
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paymentStatus, setPaymentStatus] = useState<string>('paid');
  const [generalDiscount, setGeneralDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Agregar producto al carrito
  const addToCart = () => {
    if (!selectedProduct) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    // Verificar si ya está en el carrito
    const existing = cart.find(item => item.product.id === product.id);
    
    if (existing) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1, discount: 0 }]);
    }

    setSelectedProduct('');
  };

  // Actualizar cantidad
  const updateQuantity = (productId: string, newQuantity: number) => {
    const item = cart.find(i => i.product.id === productId);
    if (!item) return;

    // Validar stock disponible
    if (item.product.track_inventory && newQuantity > Number(item.product.stock)) {
      alert(`Stock insuficiente. Disponible: ${item.product.stock} ${item.product.unit}`);
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // Actualizar descuento de línea
  const updateLineDiscount = (productId: string, discount: number) => {
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, discount: Math.max(0, discount) }
        : item
    ));
  };

  // Remover del carrito
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  // Calcular totales
  const subtotal = cart.reduce((sum, item) => {
    const lineTotal = item.quantity * Number(item.product.unit_price) - item.discount;
    return sum + lineTotal;
  }, 0);

  const taxBase = subtotal - generalDiscount;
  const tax = taxBase * 0.19; // 19% IVA
  const total = taxBase + tax;

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (cart.length === 0) {
      setError('Agrega al menos un producto al carrito');
      return;
    }

    // Validar stock de todos los productos
    for (const item of cart) {
      if (item.product.track_inventory && item.quantity > Number(item.product.stock)) {
        setError(`Stock insuficiente para ${item.product.name}. Disponible: ${item.product.stock}`);
        return;
      }
    }

    setLoading(true);

    try {
      await onSubmit({
        customer_id: customerId || undefined,
        sale_date: new Date().toISOString().split('T')[0],
        discount: generalDiscount,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        notes: notes || undefined,
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: Number(item.product.unit_price),
          discount: item.discount,
        })),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Nueva Venta
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" disabled={loading}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Selección de productos */}
            <div className="lg:col-span-2 space-y-6">
              {/* Agregar producto */}
              <div className="card">
                <h3 className="font-semibold mb-3">Agregar Productos</h3>
                <div className="flex gap-2">
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="input flex-1"
                    disabled={productsLoading || loading}
                  >
                    <option value="">Seleccionar producto...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${Number(product.unit_price).toLocaleString()} 
                        {product.track_inventory && ` (Stock: ${product.stock} ${product.unit})`}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addToCart}
                    className="btn-primary"
                    disabled={!selectedProduct || loading}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Carrito */}
              <div className="card">
                <h3 className="font-semibold mb-3">Carrito ({cart.length} productos)</h3>
                
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>El carrito está vacío</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map(item => {
                      const lineSubtotal = item.quantity * Number(item.product.unit_price) - item.discount;
                      
                      return (
                        <div key={item.product.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                            <p className="text-sm text-gray-600">
                              ${Number(item.product.unit_price).toLocaleString()} / {item.product.unit}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-100 rounded"
                              disabled={loading}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.product.id, parseFloat(e.target.value) || 0)}
                              className="w-16 text-center border rounded px-2 py-1"
                              min="0"
                              step="0.01"
                              disabled={loading}
                            />
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-100 rounded"
                              disabled={loading}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              ${lineSubtotal.toLocaleString()}
                            </p>
                            <input
                              type="number"
                              value={item.discount}
                              onChange={(e) => updateLineDiscount(item.product.id, parseFloat(e.target.value) || 0)}
                              className="w-20 text-xs text-right border rounded px-2 py-1 mt-1"
                              placeholder="Desc."
                              min="0"
                              disabled={loading}
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={loading}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Resumen y detalles */}
            <div className="space-y-6">
              {/* Cliente */}
              <div className="card">
                <h3 className="font-semibold mb-3">Cliente</h3>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="input"
                  disabled={loading}
                >
                  <option value="">Cliente Ocasional</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.full_name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pago */}
              <div className="card space-y-3">
                <h3 className="font-semibold">Pago</h3>
                
                <div>
                  <label className="label">Método</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="input"
                    disabled={loading}
                  >
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                    <option value="credit">Crédito</option>
                  </select>
                </div>

                <div>
                  <label className="label">Estado</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="input"
                    disabled={loading}
                  >
                    <option value="paid">Pagado</option>
                    <option value="pending">Pendiente</option>
                    <option value="partial">Parcial</option>
                  </select>
                </div>
              </div>

              {/* Totales */}
              <div className="card space-y-2">
                <h3 className="font-semibold mb-3">Totales</h3>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-600">Descuento:</span>
                  <input
                    type="number"
                    value={generalDiscount}
                    onChange={(e) => setGeneralDiscount(parseFloat(e.target.value) || 0)}
                    className="w-24 text-right border rounded px-2 py-1"
                    min="0"
                    disabled={loading}
                  />
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA (19%):</span>
                  <span className="font-medium">${tax.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>TOTAL:</span>
                  <span className="text-primary-600">${total.toLocaleString()}</span>
                </div>
              </div>

              {/* Notas */}
              <div className="card">
                <label className="label">Notas (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Notas adicionales..."
                  disabled={loading}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3">
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
                  disabled={loading || cart.length === 0}
                >
                  {loading ? 'Procesando...' : 'Completar Venta'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}