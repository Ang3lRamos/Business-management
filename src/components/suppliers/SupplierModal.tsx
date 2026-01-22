import { useState, useEffect } from 'react';
import type { Supplier } from '../../types/database';
import type { SupplierFormData } from '../../hooks/useSuppliers';
import { X } from 'lucide-react';

interface SupplierModalProps {
  supplier: Supplier | null;
  onSubmit: (data: SupplierFormData) => void;
  onClose: () => void;
}

export default function SupplierModal({ supplier, onSubmit, onClose }: SupplierModalProps) {
  const [formData, setFormData] = useState<SupplierFormData>({
    company_name: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    country: 'Colombia',
    tax_id: '',
    payment_terms: 'Contado',
    credit_limit: 0,
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  // Cargar datos del proveedor si estamos editando
  useEffect(() => {
    if (supplier) {
      setFormData({
        company_name: supplier.company_name,
        contact_name: supplier.contact_name || '',
        contact_email: supplier.contact_email || '',
        contact_phone: supplier.contact_phone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        country: supplier.country,
        tax_id: supplier.tax_id || '',
        payment_terms: supplier.payment_terms || 'Contado',
        credit_limit: Number(supplier.credit_limit),
        notes: supplier.notes || '',
      });
    }
  }, [supplier]);

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
            {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
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
          {/* Información de la empresa */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Información de la Empresa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Nombre de la Empresa *</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="input"
                  required
                  placeholder="Distribuidora XYZ S.A.S."
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">NIT</label>
                <input
                  type="text"
                  name="tax_id"
                  value={formData.tax_id}
                  onChange={handleChange}
                  className="input"
                  placeholder="900123456-1"
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

              <div className="md:col-span-2">
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
            </div>
          </div>

          {/* Persona de contacto */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Persona de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre del Contacto</label>
                <input
                  type="text"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  className="input"
                  placeholder="Juan Pérez"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Teléfono</label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  className="input"
                  placeholder="+57 300 1234567"
                  disabled={loading}
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Email</label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="input"
                  placeholder="contacto@proveedor.com"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Términos comerciales */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Términos Comerciales</h3>
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
                  Crédito que el proveedor te otorga
                </p>
              </div>
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
              placeholder="Notas adicionales sobre el proveedor..."
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
              {loading ? 'Guardando...' : supplier ? 'Actualizar' : 'Crear Proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}