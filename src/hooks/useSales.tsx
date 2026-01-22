import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { SaleWithDetails, Customer } from '../types/database';

export function useSales() {
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar ventas con relaciones
  const loadSales = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(*),
          sale_details(
            *,
            product:products(*)
          ),
          created_by_profile:profiles!sales_created_by_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setSales(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading sales:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar clientes
  const loadCustomers = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('is_active', true)
        .order('full_name');

      if (fetchError) throw fetchError;

      setCustomers(data || []);
    } catch (err) {
      console.error('Error loading customers:', err);
    }
  };

  // Crear venta
  const createSale = async (saleData: {
    customer_id?: string;
    sale_date: string;
    discount: number;
    payment_method: string;
    payment_status: string;
    notes?: string;
    items: Array<{
      product_id: string;
      quantity: number;
      unit_price: number;
      discount: number;
    }>;
  }) => {
    try {
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No estás autenticado');
      }

      // Calcular totales antes de insertar
      const subtotal = saleData.items.reduce((sum, item) => {
        const lineSubtotal = (item.quantity * item.unit_price) - item.discount;
        return sum + lineSubtotal;
      }, 0);

      const taxBase = subtotal - saleData.discount;
      const tax = Math.round(taxBase * 0.19 * 100) / 100; // 19% redondeado a 2 decimales
      const total = taxBase + tax;

      // 1. Crear el encabezado de la venta
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert([{
          customer_id: saleData.customer_id || null,
          sale_date: saleData.sale_date,
          subtotal: subtotal,
          discount: saleData.discount,
          tax: tax,
          tax_percentage: 19,
          total: total,
          payment_method: saleData.payment_method,
          payment_status: saleData.payment_status,
          notes: saleData.notes,
          status: 'completed',
          created_by: user.id,
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // 2. Crear los detalles de la venta
      const details = saleData.items.map(item => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount,
      }));

      const { error: detailsError } = await supabase
        .from('sale_details')
        .insert(details);

      if (detailsError) throw detailsError;

      // 3. Recargar ventas
      await loadSales();

      return { data: sale, error: null };
    } catch (err: any) {
      console.error('Error creating sale:', err);
      return { data: null, error: err.message };
    }
  };

  // Obtener una venta por ID
  const getSale = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('sales')
        .select(`
          *,
          customer:customers(*),
          sale_details(
            *,
            product:products(*)
          ),
          created_by_profile:profiles!sales_created_by_fkey(*)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  // Anular venta (solo admin)
  const cancelSale = async (id: string) => {
    try {
      const { error: cancelError } = await supabase
        .from('sales')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (cancelError) throw cancelError;

      // Recargar ventas
      await loadSales();

      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  // Estadísticas de ventas
  const getSalesStats = async (startDate?: string, endDate?: string) => {
    try {
      let query = supabase
        .from('sales')
        .select('total, sale_date, status')
        .eq('status', 'completed');

      if (startDate) {
        query = query.gte('sale_date', startDate);
      }
      if (endDate) {
        query = query.lte('sale_date', endDate);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const totalSales = data?.reduce((sum, sale) => sum + Number(sale.total), 0) || 0;
      const totalCount = data?.length || 0;

      return { 
        data: {
          totalSales,
          totalCount,
          averageSale: totalCount > 0 ? totalSales / totalCount : 0,
        }, 
        error: null 
      };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  // Cargar al montar
  useEffect(() => {
    loadSales();
    loadCustomers();
  }, []);

  return {
    sales,
    customers,
    loading,
    error,
    loadSales,
    createSale,
    getSale,
    cancelSale,
    getSalesStats,
  };
}