// File: context/AuthContext.tsx

import { createContext, useState, useContext, ReactNode, useEffect } from 'react'; // 🛑 Zaroori: useEffect import kiya
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Text } from 'react-native-paper';

export type UserType = {
  id: number;
  name: string;
  email:string,
  role: string,
  city_id: number; 

};

type AuthContextType = {
  token: string | null,
  user: UserType | null,
  loading: boolean; // 🛑 Naya: Loading state zaroori hai
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

// 🛑 loading: true, default value mein add kiya
const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: false, 
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true); // 🛑 Naya: Initial load state

  // 1. 💾 useEffect: App shuru hone par token load karein
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUserJSON = await AsyncStorage.getItem('user');
        if (storedToken && storedUserJSON) {
          setToken(storedToken);
          const storedUser: UserType = JSON.parse(storedUserJSON);
          setUser(storedUser);
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

  const login = async (newToken: string, userData: UserType) => {
    // ... (Login logic same rahega)
    setToken(newToken);
    setUser(userData);
    await AsyncStorage.setItem('token', newToken);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    console.log('User logged in, token saved to storage');
  };

  const logout = async () => {
    // ... (Logout logic same rahega)
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    console.log('User logged out, token removed from storage');
  };

  return (
    <AuthContext.Provider value={{ token,user , loading, login, logout }}> 
   
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);