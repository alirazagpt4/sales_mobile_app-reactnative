// File: context/AuthContext.tsx

import { createContext, useState, useContext, ReactNode, useEffect } from 'react'; // 🛑 Zaroori: useEffect import kiya
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Text } from 'react-native-paper';

type AuthContextType = {
  token: string | null;
  loading: boolean; // 🛑 Naya: Loading state zaroori hai
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

// 🛑 loading: true, default value mein add kiya
const AuthContext = createContext<AuthContextType>({
  token: null,
  loading: false, 
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // 🛑 Naya: Initial load state

  // 1. 💾 useEffect: App shuru hone par token load karein
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          console.log('App started, loaded token:', storedToken);
        }
      } catch (e) {
        console.error('Failed to load token:', e);
      } finally {
        setLoading(false); // Token load hone ke baad loading band karein
      }
    };
    loadToken();
  }, []); // Empty array ka matlab, sirf component mount hone par chalao

  const login = async (newToken: string) => {
    // ... (Login logic same rahega)
    setToken(newToken);
    await AsyncStorage.setItem('token', newToken);
    console.log('User logged in, token saved to storage');
  };

  const logout = async () => {
    // ... (Logout logic same rahega)
    setToken(null);
    await AsyncStorage.removeItem('token');
    console.log('User logged out, token removed from storage');
  };

  return (
    <AuthContext.Provider value={{ token, loading, login, logout }}> 
   
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);