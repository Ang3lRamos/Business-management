import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Customer, CustomerFormData } from '../types/database';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar clientes
  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setCustomers(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Crear cliente
  const createCustomer = async (customerData: CustomerFormData) => {
    try {
      const { data, error: insertError } = await supabase
        .from('customers')
        .insert([customerData])
        .select()
        .single();

      if (insertError) throw insertError;

      // Agregar a la lista local
      setCustomers((prev) => [data, ...prev]);

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  // Actualizar cliente
  const updateCustomer = async (id: string, customerData: Partial<CustomerFormData>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('customers')
        .update(customerData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      // Actualizar en la lista local
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? data : c))
      );

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  // Eliminar cliente (soft delete)
  const deleteCustomer = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('customers')
        .update({ is_active: false })
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Remover de la lista local
      setCustomers((prev) => prev.filter((c) => c.id !== id));

      return { error: null };
    } catch (err: any) {
      console.error('Error deleting customer:', err);
      return { error: err.message };
    }
  };

  // Obtener un cliente por ID
  const getCustomer = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  // Buscar clientes
  const searchCustomers = async (query: string) => {
    try {
      const { data, error: searchError } = await supabase
        .from('customers')
        .select('*')
        .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,tax_id.ilike.%${query}%`)
        .eq('is_active', true)
        .order('full_name');

      if (searchError) throw searchError;

      return { data: data || [], error: null };
    } catch (err: any) {
      return { data: [], error: err.message };
    }
  };

  // Clientes con deuda
  const getCustomersWithDebt = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .gt('current_balance', 0)
        .order('current_balance', { ascending: false });

      if (fetchError) throw fetchError;

      return { data: data || [], error: null };
    } catch (err: any) {
      return { data: [], error: err.message };
    }
  };

  // Cargar al montar
  useEffect(() => {
    loadCustomers();
  }, []);

  return {
    customers,
    loading,
    error,
    loadCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomer,
    searchCustomers,
    getCustomersWithDebt,
  };
}