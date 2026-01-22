import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import ProductsPage from './pages/ProductsPage';
import SalesPage from './pages/SalesPage';
import CustomersPage from './pages/CustomersPage';
import SuppliersPage from './pages/SuppliersPage';

// Componente para rutas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Componente para redireccionar si ya está logueado
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Rutas protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route path="productos" element={<ProductsPage />} />
        <Route path="ventas" element={<SalesPage />} />
        <Route path="clientes" element={<CustomersPage />} />
        <Route path="proveedores" element={<SuppliersPage />} />
        
        {/* Placeholders para las demás páginas */}
        <Route 
          element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold">Proveedores</h2>
              <p className="text-gray-600 mt-2">Próximamente...</p>
            </div>
          } 
        />
        <Route 
          path="compras" 
          element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold">Compras</h2>
              <p className="text-gray-600 mt-2">Próximamente...</p>
            </div>
          } 
        />
        <Route 
          path="reportes" 
          element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold">Reportes</h2>
              <p className="text-gray-600 mt-2">Próximamente...</p>
            </div>
          } 
        />
      </Route>

      {/* Ruta 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}