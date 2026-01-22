import { useState, useEffect } from 'react';
import type { Customer, CustomerFormData } from '../../types/database';
import { X, Building2, UserCircle } from 'lucide-react';

interface CustomerModalProps {
  customer: Customer | null;
  onSubmit: (data: CustomerFormData) => void;
  onClose: () => void;
}

export default function CustomerModal({ customer, onSubmit, onClose }: CustomerModalProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    customer_type: 'individual',
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    tax_id: '',
    payment_terms: 'Contado',
    credit_limit: 0,
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  // Cargar datos del cliente si estamos editando
  useEffect(() => {
    if (customer) {
      setFormData({
        customer_type: customer.customer_type,
        full_name: customer.full_name,
        email: customer.email || '',
        phone: customer.phone,
        address: customer.address || '',
        city: customer.city || '',
        tax_id: customer.tax_id || '',
        payment_terms: customer.payment_terms,
        credit_limit: Number(customer.credit_limit),
        notes: customer.notes || '',
      });
    }
  }, [customer]);

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
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
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
          {/* Tipo de cliente */}
          <div>
            <label className="label">Tipo de Cliente *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, customer_type: 'individual' })}
                className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                  formData.customer_type === 'individual'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={loading}
              >
                <UserCircle className={`w-6 h-6 ${
                  formData.customer_type === 'individual' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Individual</div>
                  <div className="text-sm text-gray-500">Persona natural</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, customer_type: 'business' })}
                className={`p-4 border-2 rounded-lg flex items-center gap-3 transition-colors ${
                  formData.customer_type === 'business'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={loading}
              >
                <Building2 className={`w-6 h-6 ${
                  formData.customer_type === 'business' ? 'text-primary-600' : 'text-gray-400'
                }`} />
                <div className="text-left">
                  <div className="font-medium text-gray-900">Empresa</div>
                  <div className="text-sm text-gray-500">Razón social</div>
                </div>
              </button>
            </div>
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">
                {formData.customer_type === 'business' ? 'Razón Social *' : 'Nombre Completo *'}
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                className="input"
                required
                placeholder={
                  formData.customer_type === 'business'
                    ? 'Empresa S.A.S.'
                    : 'Juan Pérez'
                }
                disabled={loading}
              />
            </div>

            <div>
              <label className="label">
                {formData.customer_type === 'business' ? 'NIT' : 'Cédula'}
              </label>
              <input
                type="text"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleChange}
                className="input"
                placeholder={formData.customer_type === 'business' ? '900123456-1' : '1037654321'}
                disabled={loading}
              />
            </div>

            <div>
              <label className="label">Teléfono *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                required
                placeholder="+57 300 1234567"
                disabled={loading}
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="cliente@email.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="label">Ciudad</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input"
                placeholder="Medellín"
                disabled={loading}
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="label">Dirección</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input"
              placeholder="Calle 50 #25-30"
              disabled={loading}
            />
          </div>

          {/* Términos comerciales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Términos de Pago</label>
              <select
                name="payment_terms"
                value={formData.payment_terms}
                onChange={handleChange}
                className="input"
                disabled={loading}
              >
                <option value="Contado">Contado</option>
                <option value="15 días">15 días</option>
                <option value="30 días">30 días</option>
                <option value="45 días">45 días</option>
                <option value="60 días">60 días</option>
              </select>
            </div>

            <div>
              <label className="label">Límite de Crédito</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  name="credit_limit"
                  value={formData.credit_limit}
                  onChange={handleChange}
                  className="input pl-7"
                  min="0"
                  step="1000"
                  disabled={loading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Monto máximo que puede deber el cliente
              </p>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="label">Notas</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="input"
              rows={3}
              placeholder="Notas adicionales sobre el cliente..."
              disabled={loading}
            />
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
              {loading ? 'Guardando...' : customer ? 'Actualizar' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}