import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { API_CONFIG, STORAGE_KEYS } from '../config/constants';

export interface User {
  _id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  deleteAccount: () => Promise<boolean>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = API_CONFIG.BASE_URL;

  const fetchCurrentUser = useCallback(async (authToken: string) => {
    try {
      console.log('Fetching current user with token:', authToken ? 'Present' : 'Missing');

      const response = await fetch(`${API_BASE}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Profile response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('User fetched successfully:', data.user?.username);
        setUser(data.user);
      } else {
        // Token is invalid, remove it
        console.log('Profile fetch failed, removing token');
        Cookies.remove(STORAGE_KEYS.TOKEN);
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      Cookies.remove(STORAGE_KEYS.TOKEN);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = Cookies.get(STORAGE_KEYS.TOKEN);
    console.log('Initializing auth, stored token:', storedToken ? 'Present' : 'Missing');

    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      console.log('No stored token found, setting loading to false');
      setLoading(false);
    }
  }, [fetchCurrentUser]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for:', email);

      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', { status: response.status, hasToken: !!data.access_token });

      if (response.ok) {
        setUser(data.user);
        setToken(data.access_token);
        // Set cookie with secure settings
        Cookies.set(STORAGE_KEYS.TOKEN, data.access_token, {
          expires: 7, // 7 days
          secure: false, // Set to true in production with HTTPS
          sameSite: 'lax'
        });
        console.log('Login successful, token stored');
        return true;
      } else {
        console.error('Login error:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, username: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting registration:', { email, username });

      const response = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();
      console.log('Registration response:', { status: response.status, data });

      if (response.ok) {
        setUser(data.user);
        setToken(data.access_token);
        Cookies.set(STORAGE_KEYS.TOKEN, data.access_token, { expires: 7 }); // 7 days
        return true;
      } else {
        console.error('Registration failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Registration network error:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    setToken(null);
    Cookies.remove(STORAGE_KEYS.TOKEN);
    // Also remove from localStorage if it exists
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/api/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Account deleted successfully, log out
        logout();
        return true;
      } else {
        const data = await response.json();
        console.error('Delete account error:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Delete account error:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    deleteAccount,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
