// ============================================
// DATABASE TYPES
// Tipos que coinciden con las tablas de Supabase
// ============================================

export type UserRole = 'admin' | 'vendedor';

export type ProductType = 'finished' | 'raw_material';

export type PurchaseStatus = 'draft' | 'completed' | 'cancelled';
export type SaleStatus = 'draft' | 'completed' | 'cancelled';

export type PaymentStatus = 'pending' | 'partial' | 'paid';
export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'credit';

export type CustomerType = 'individual' | 'business';

export type StockMovementType = 'entrada' | 'salida' | 'ajuste';
export type ReferenceType = 'purchase' | 'sale' | 'adjustment';

// ────────────────────────────────────────────
// PROFILE
// ────────────────────────────────────────────
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ────────────────────────────────────────────
// CATEGORY
// ────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  color: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ────────────────────────────────────────────
// PRODUCT
// ────────────────────────────────────────────
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category_id: string | null;
  cost_price: number;
  unit_price: number;
  stock: number;
  min_stock: number;
  unit: string;
  track_inventory: boolean;
  product_type: ProductType;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Con relaciones
export interface ProductWithCategory extends Product {
  category: Category | null;
}

// ────────────────────────────────────────────
// SUPPLIER
// ────────────────────────────────────────────
export interface Supplier {
  id: string;
  company_name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  country: string;
  tax_id: string | null;
  payment_terms: string | null;
  credit_limit: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ────────────────────────────────────────────
// CUSTOMER
// ────────────────────────────────────────────
export interface Customer {
  id: string;
  customer_type: CustomerType;
  full_name: string;
  email: string | null;
  phone: string;
  address: string | null;
  city: string | null;
  country: string;
  tax_id: string | null;
  payment_terms: string;
  credit_limit: number;
  current_balance: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ────────────────────────────────────────────
// PURCHASE
// ────────────────────────────────────────────
export interface Purchase {
  id: string;
  purchase_number: string;
  supplier_id: string;
  purchase_date: string;
  subtotal: number;
  tax: number;
  tax_percentage: number;
  total: number;
  status: PurchaseStatus;
  payment_status: PaymentStatus;
  amount_paid: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseDetail {
  id: string;
  purchase_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

// Con relaciones
export interface PurchaseWithDetails extends Purchase {
  supplier: Supplier;
  purchase_details: (PurchaseDetail & { product: Product })[];
}

// ────────────────────────────────────────────
// SALE
// ────────────────────────────────────────────
export interface Sale {
  id: string;
  sale_number: string;
  customer_id: string | null;
  sale_date: string;
  subtotal: number;
  discount: number;
  tax: number;
  tax_percentage: number;
  total: number;
  status: SaleStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  amount_paid: number;
  invoice_url: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface SaleDetail {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  subtotal: number;
  created_at: string;
}

// Con relaciones
export interface SaleWithDetails extends Sale {
  customer: Customer | null;
  sale_details: (SaleDetail & { product: Product })[];
  created_by_profile: Profile | null;
}

// ────────────────────────────────────────────
// STOCK MOVEMENT
// ────────────────────────────────────────────
export interface StockMovement {
  id: string;
  product_id: string;
  type: StockMovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_type: ReferenceType | null;
  reference_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface StockMovementWithProduct extends StockMovement {
  product: Product;
}

// ────────────────────────────────────────────
// FORMS (para crear/editar)
// ────────────────────────────────────────────
export interface ProductFormData {
  sku: string;
  name: string;
  description?: string;
  category_id?: string;
  cost_price: number;
  unit_price: number;
  stock: number;
  min_stock: number;
  unit: string;
  track_inventory: boolean;
  product_type: ProductType;
  is_active: boolean;
}

export interface CustomerFormData {
  customer_type: CustomerType;
  full_name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  tax_id?: string;
  payment_terms: string;
  credit_limit: number;
  notes?: string;
}

export interface SaleFormData {
  customer_id?: string;
  sale_date: string;
  discount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  notes?: string;
  items: SaleItemFormData[];
}

export interface SaleItemFormData {
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
}