/**
 * Auth Context — provides authentication state and methods across the React app.
 *
 * State: user object (null when logged out), loading flag
 * Methods: login, register, logout
 * Auto-refresh: on mount, attempts /auth/refresh to restore session from httpOnly cookie
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import client, { setAccessToken, clearAccessToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Try to restore session on mount ─────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Attempt refresh — if the httpOnly cookie is valid, we get a new access token
        const { data } = await client.post('/auth/refresh');
        setAccessToken(data.access_token);
        
        // Fetch user profile with the new token
        const profileRes = await client.get('/profile');
        setUser(profileRes.data);
      } catch {
        // No valid session — that's fine, user will need to log in
        clearAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── Login ────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    setAccessToken(data.access_token);

    // Fetch user profile
    const profileRes = await client.get('/profile');
    setUser(profileRes.data);

    return data;
  }, []);

  // ── Register ─────────────────────────────────────────────
  const register = useCallback(async (fullName, email, password, gender) => {
    const { data } = await client.post('/auth/register', {
      full_name: fullName,
      email,
      password,
      gender: gender || null,
    });
    return data;
  }, []);

  // ── Logout ───────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await client.post('/auth/logout');
    } catch {
      // Even if the API call fails, clear local state
    }
    clearAccessToken();
    setUser(null);
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUserData } : updatedUserData));
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
