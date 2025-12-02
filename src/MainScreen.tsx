import type { ComponentProps } from 'react';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

// 🛑 CLI Navigation Imports
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 
// 🚨 CHANGE: @expo/vector-icons ki jagah 'react-native-vector-icons/Ionicons' use kiya
import Ionicons from 'react-native-vector-icons/Ionicons'; 

import { Button, Text, Provider as PaperProvider, MD3LightTheme as DefaultTheme } from "react-native-paper";

// AUTH CONTEXT (Path bilkul theek hai: screens se context folder tak)
import { useAuth } from './context/AuthContext'; 


// --- NAVIGATION TYPES FOR CLI ---
// Zaroori: Aapko ye routes App.tsx mein register karne honge
type RootStackParamList = {
  Login: undefined; // Target after logout
  Main: undefined;
  // Naye Routes jo tiles mein use honge
  StartDay: undefined; 
  Visits: undefined;
};
type MainScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;
// ---------------------------------


// 🌟 Use ComponentProps to correctly inherit all valid Ionicons names
type IconName = ComponentProps<typeof Ionicons>['name'];

// Define the Blue Theme
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007bff',
    onSurface: '#333',
  },
};


interface DashboardItemProps {
  icon: IconName;
  label: string;
  onPress: () => void;
}

// Custom component for the dashboard tiles
const DashboardItem = ({ icon, label, onPress }: DashboardItemProps) => (
  <TouchableOpacity 
    style={styles.card} 
    onPress={onPress}
    activeOpacity={0.7} // Press effect
  >
    <Ionicons name={icon} size={40} color={theme.colors.primary} />
    <Text style={styles.cardLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function MainScreen() {
  // 🛑 useNavigation hook for CLI project
  const navigation = useNavigation<MainScreenNavigationProp>(); 
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    // 🛑 React Navigation: Logout ke baad Login screen par redirect
    navigation.replace('Login'); 
  }

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
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
              // 🛑 React Navigation: 'start-day' screen par navigate
              onPress={() => navigation.navigate('StartDay')} 
            />
            
            {/* Tile 2: Visits */}
            <DashboardItem 
              icon="location-outline" 
              label="Visits" 
              // 🛑 React Navigation: 'visits' screen par navigate
              onPress={() => navigation.navigate('Visits')} 
            />
            
          </View>
          {/* ----------------------------- */}
          
          <View style={styles.filler} />

        </ScrollView>
        
        {/* Logout Section (Fixed at bottom) */}
        <View style={styles.logoutSection}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Button 
            mode="contained" 
            onPress={handleLogout} 
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Logout
          </Button>
        </View>
        
      </View>
    </PaperProvider>
  );
}

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 150, // Logout section ke liye space
  },
  headerText: { 
    fontWeight: 'bold', 
    color: '#007bff', 
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 40, 
  },
  dashboardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    width: '100%',
    marginBottom: 20, 
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%', 
    height: windowHeight * 0.18, // Height based on screen size
    elevation: 4, // Android shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  filler: {
    // Spacer to ensure content isn't covered by the absolute footer
    height: 100, 
  },
  // Logout Section ko bottom par fixed rakha hai
  logoutSection: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  welcomeText: {
    marginBottom: 10,
    fontSize: 16,
    color: '#555',
  },
  button: {
    width: '100%',
    paddingVertical: 5,
    borderRadius: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  }
});