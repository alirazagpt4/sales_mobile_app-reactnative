import type { ComponentProps } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Button, Text, Provider as PaperProvider, MD3LightTheme as DefaultTheme } from "react-native-paper";
import { useAuth } from '../context/authContext';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons'; // Import Ionicons

// 🌟 FIX: Use ComponentProps to correctly inherit all valid Ionicons names
type IconName = ComponentProps<typeof Ionicons>['name'];
// Define the Blue Theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007bff',
  },
};


interface DashboardItemProps {
  icon: IconName;
  label: string;
  onPress: () => void; // A function that takes no arguments and returns nothing
}

// Custom component for the dashboard tiles
const DashboardItem = ({ icon, label, onPress }: DashboardItemProps) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Ionicons name={icon} size={40} color={theme.colors.primary} />
    <Text style={styles.cardLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function MainScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  
  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        
        {/* Main Header */}
        <Text variant="headlineLarge" style={styles.headerText}>
          Dashboard
        </Text>

        {/* --- 🌟 Two Tiles Side-by-Side --- */}
        <View style={styles.dashboardGrid}>
          
          {/* Tile 1: Start Day */}
          <DashboardItem 
            icon="sunny-outline" 
            label="Start Day" 
            onPress={() => router.push('/start-day')} 
          />
          
          {/* Tile 2: Visits */}
          <DashboardItem 
            icon="location-outline" 
            label="Visits" 
            onPress={() => router.push('/visits')} 
          />
          
        </View>
        {/* ----------------------------- */}

        {/* Logout Section (Normal flow mein, tiles ke neeche) */}
        <View style={styles.logoutSection}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Button 
            mode="contained" 
            onPress={() => {
              logout();
              router.replace('/login');
            }}
            style={styles.button}
          >
            Logout
          </Button>
        </View>
        
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#fff',
    // Removed justifyContent: 'center' taake content top se start ho
  },
  headerText: { 
    fontWeight: 'bold', 
    color: '#007bff', 
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 40, // Increased gap from tiles
  },
  // Dashboard Grid ko side-by-side aur centered rakha hai
  dashboardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around', // Tiles ke beech mein gap
    width: '100%',
    marginBottom: 60, // Gap from Logout section
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%', // Amne Samne
    elevation: 2, 
  },
  cardLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  // Logout Section ki absolute position hata di hai
  logoutSection: {
    alignSelf: 'center',
    alignItems: 'center',
    width: '100%',
    // No 'position: absolute' now
  },
  welcomeText: {
    marginBottom: 10,
    fontSize: 16,
    color: '#555',
  },
  button: {
    width: '80%',
    paddingVertical: 5,
  }
});