# Business Management

Sistema de gestión para un negocio pequeño: inventario, ventas, compras, clientes y proveedores, con un panel de indicadores y dos roles de usuario.

> En desarrollo: el frontend y la conexión con Supabase están construidos módulo por módulo.

## Módulos

| Módulo | Qué hace |
|---|---|
| **Panel** | Indicadores del negocio: ventas del mes, ventas de hoy, productos en stock y clientes activos |
| **Productos** | Catálogo con categorías, precios y stock; alta y edición en un modal |
| **Ventas** | Registro de ventas con varios productos, estado (borrador, completada, cancelada), método de pago (efectivo, tarjeta, transferencia o crédito) y detalle de cada venta |
| **Compras** | Compras a proveedores con su detalle y estado |
| **Clientes** | Directorio de clientes |
| **Proveedores** | Directorio de proveedores |
| **Usuarios** | Gestión de cuentas, solo para administradores |

## Roles

- **admin:** acceso completo, incluida la gestión de usuarios.
- **vendedor:** opera ventas, productos y clientes.

El rol vive en la tabla `profiles` de Supabase y se lee al iniciar sesión (`AuthContext`). Todas las páginas exigen sesión iniciada, y el menú muestra las secciones de administración solo a los administradores.

## Modelo de datos

Tablas en Supabase (Postgres):

- `profiles` y `categories`
- `products`
- `customers` y `suppliers`
- `sales` y `sale_details`
- `purchases` y `purchase_details`

Los tipos de TypeScript de cada tabla están en [`src/types/database.tsx`](src/types/database.tsx).

## Stack

- **React 19** con **TypeScript** y **Vite 7**
- **React Router 7** para la navegación
- **Supabase** para base de datos y autenticación
- **Tailwind CSS v4** y **lucide-react** para la interfaz

## Estructura

```
src/
  pages/        una página por módulo (panel, productos, ventas, compras, clientes, proveedores, usuarios, login)
  components/   listas y modales de cada módulo, y el layout principal
  hooks/        acceso a datos por módulo (useProducts, useSales, usePurchases, useCustomers, useSuppliers)
  context/      sesión y rol del usuario
  lib/          cliente de Supabase
  types/        tipos de la base de datos
```

## Correr en local

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea un archivo `.env` con las variables de tu proyecto de Supabase:

   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-anon-key
   ```

3. Arranca el servidor:

   ```bash
   npm run dev
   ```
