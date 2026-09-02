/**
 * App — Root component with complete luxury Pakistani Fashion Platform route map.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dresses from './pages/Dresses';
import Jewellery from './pages/Jewellery';
import Makeup from './pages/Makeup';
import Analyzer from './pages/Analyzer';
import Outfits from './pages/Outfits';
import Recommendations from './pages/Recommendations';
import StylistPage from './pages/StylistPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';

/** Route guard — redirects to /login if not authenticated */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1rem', borderTopColor: '#ec4899' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading GlamIQ…</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/** Redirect authenticated users away from auth pages */
function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg)',
        }}
      >
        <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: '#ec4899' }} />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/analyzer" replace /> : children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          {/* Public Platform Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/dresses" element={<Dresses />} />
          <Route path="/jewellery" element={<Jewellery />} />
          <Route path="/makeup" element={<Makeup />} />
          <Route path="/stylist" element={<StylistPage />} />

          {/* AI Analyzer, Wardrobe & Lookbook Recommendations */}
          <Route
            path="/analyzer"
            element={
              <ProtectedRoute>
                <Analyzer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/outfits"
            element={
              <ProtectedRoute>
                <Outfits />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wardrobe"
            element={<Navigate to="/outfits" replace />}
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Navigate to="/outfits" replace />} />

          {/* User Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Guest Auth */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />

          {/* Admin Portal */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
