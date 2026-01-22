import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { ProductWithCategory, Category, ProductFormData } from '../types/database';

export function useProducts() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos con categorías
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('is_active', true) // Solo productos activos
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías
  const loadCategories = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (fetchError) throw fetchError;

      setCategories(data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // Crear producto
  const createProduct = async (productData: ProductFormData) => {
    try {
      const { data, error: insertError } = await supabase
        .from('products')
        .insert([productData])
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (insertError) throw insertError;

      // Agregar a la lista local
      setProducts((prev) => [data, ...prev]);

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  // Actualizar producto
  const updateProduct = async (id: string, productData: Partial<ProductFormData>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (updateError) throw updateError;

      // Actualizar en la lista local
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? data : p))
      );

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  // Eliminar producto (soft delete)
  const deleteProduct = async (id: string) => {
    try {
      // Actualizar is_active a false
      const { error: deleteError } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Remover de la lista local (importante para que desaparezca de la UI)
      setProducts((prev) => prev.filter((p) => p.id !== id));

      return { error: null };
    } catch (err: any) {
      console.error('Error deleting product:', err);
      return { error: err.message };
    }
  };

  // Obtener un producto por ID
  const getProduct = async (id: string) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message };
    }
  };

  // Buscar productos
  const searchProducts = async (query: string) => {
    try {
      const { data, error: searchError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%`)
        .eq('is_active', true)
        .order('name');

      if (searchError) throw searchError;

      return { data: data || [], error: null };
    } catch (err: any) {
      return { data: [], error: err.message };
    }
  };

  // Productos con stock bajo
  const getLowStockProducts = async () => {
    try {
      // Primero obtenemos todos los productos activos que controlan inventario
      const { data, error: fetchError } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('is_active', true)
        .eq('track_inventory', true)
        .order('stock', { ascending: true });

      if (fetchError) throw fetchError;

      // Filtrar en el cliente aquellos donde stock <= min_stock
      const lowStockProducts = (data || []).filter(
        (product) => Number(product.stock) <= Number(product.min_stock)
      );

      return { data: lowStockProducts, error: null };
    } catch (err: any) {
      return { data: [], error: err.message };
    }
  };

  // Cargar al montar
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  return {
    products,
    categories,
    loading,
    error,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProduct,
    searchProducts,
    getLowStockProducts,
  };
}