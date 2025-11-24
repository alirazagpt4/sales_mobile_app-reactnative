import { Stack } from 'expo-router';
import { AuthProvider } from '../context/authContext';
// import { StatusBar } from 'expo-status-bar';
// import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
// import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {


  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="screens/SplashScreen" options={{ headerShown: false }} />
        <Stack.Screen name="screens/LoginScreen" options={{ headerShown: false }} />
        <Stack.Screen name="screens/MainScreen" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
    
 
  );
}
