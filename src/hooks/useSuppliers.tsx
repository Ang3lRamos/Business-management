import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Supplier } from '../types/database';

export interface SupplierFormData {
  company_name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  country: string;
  tax_id?: string;
  payment_terms?: string;
  credit_limit: number;
  notes?: string;
}

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar proveedores
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setSuppliers(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Crear proveedor
  const createSupplier = async (supplierData: SupplierFormData) => {
    try {
      const { data, error: insertError } = await supabase
        .from('suppliers')
        .insert([supplierData])
        .select()
        .single();

      if (insertError) throw insertError;

      setSuppliers((prev) => [data, ...prev]);

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  // Actualizar proveedor
  const updateSupplier = async (id: string, supplierData: Partial<SupplierFormData>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('suppliers')
        .update(supplierData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      setSuppliers((prev) =>
        prev.map((s) => (s.id === id ? data : s))
      );

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  // Eliminar proveedor (soft delete)
  const deleteSupplier = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('suppliers')
        .update({ is_active: false })
        .eq('id', id);

      if (deleteError) throw deleteError;

      setSuppliers((prev) => prev.filter((s) => s.id !== id));

      return { error: null };
    } catch (err: any) {
      console.error('Error deleting supplier:', err);
      return { error: err.message };
    }
  };

  // Obtener un proveedor por ID
  const getSupplier = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  // Cargar al montar
  useEffect(() => {
    loadSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error,
    loadSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplier,
  };
}