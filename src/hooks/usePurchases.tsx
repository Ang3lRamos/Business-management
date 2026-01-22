import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Purchase, Supplier } from '../types/database';

interface PurchaseWithDetails extends Purchase {
  supplier: Supplier;
  purchase_details: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product: {
      id: string;
      name: string;
      sku: string;
      unit: string;
    };
  }>;
}

export function usePurchases() {
  const [purchases, setPurchases] = useState<PurchaseWithDetails[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar compras con relaciones
  const loadPurchases = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('purchases')
        .select(`
          *,
          supplier:suppliers(*),
          purchase_details(
            *,
            product:products(id, name, sku, unit)
          )
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setPurchases(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar proveedores
  const loadSuppliers = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('suppliers')
        .select('*')
        .eq('is_active', true)
        .order('company_name');

      if (fetchError) throw fetchError;

      setSuppliers(data || []);
    } catch (err) {
      console.error('Error loading suppliers:', err);
    }
  };

  // Crear compra
  const createPurchase = async (purchaseData: {
    supplier_id: string;
    purchase_date: string;
    payment_status: string;
    notes?: string;
    items: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
    }>;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No estás autenticado');
      }

      // Calcular totales
      const subtotal = purchaseData.items.reduce((sum, item) => {
        return sum + (item.quantity * item.unit_price);
      }, 0);

      const tax = Math.round(subtotal * 0.19 * 100) / 100;
      const total = subtotal + tax;

      // 1. Crear encabezado
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert([{
          supplier_id: purchaseData.supplier_id,
          purchase_date: purchaseData.purchase_date,
          subtotal: subtotal,
          tax: tax,
          tax_percentage: 19,
          total: total,
          payment_status: purchaseData.payment_status,
          notes: purchaseData.notes,
          status: 'completed',
          created_by: user.id,
        }])
        .select()
        .single();

      if (purchaseError) throw purchaseError;

      // 2. Crear detalles
      const details = purchaseData.items.map(item => ({
        purchase_id: purchase.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
      }));

      const { error: detailsError } = await supabase
        .from('purchase_details')
        .insert(details);

      if (detailsError) throw detailsError;

      // 3. Recargar compras
      await loadPurchases();

      return { data: purchase, error: null };
    } catch (err: any) {
      console.error('Error creating purchase:', err);
      return { data: null, error: err.message };
    }
  };

  // Obtener una compra por ID
  const getPurchase = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('purchases')
        .select(`
          *,
          supplier:suppliers(*),
          purchase_details(
            *,
            product:products(*)
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  // Anular compra (solo admin)
  const cancelPurchase = async (id: string) => {
    try {
      const { error: cancelError } = await supabase
        .from('purchases')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (cancelError) throw cancelError;

      await loadPurchases();

      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  // Cargar al montar
  useEffect(() => {
    loadPurchases();
    loadSuppliers();
  }, []);

  return {
    purchases,
    suppliers,
    loading,
    error,
    loadPurchases,
    createPurchase,
    getPurchase,
    cancelPurchase,
  };
}