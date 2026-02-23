import type { ComponentProps } from 'react';
import { Alert } from 'react-native';
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

// 🛑 CLI Navigation Imports
import { useNavigation  } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 
// 🚨 CHANGE: @expo/vector-icons ki jagah 'react-native-vector-icons/Ionicons' use kiya
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { useTranslation } from 'react-i18next';

import { Button, Text, Provider as PaperProvider, MD3LightTheme as DefaultTheme } from "react-native-paper";

// AUTH CONTEXT (Path bilkul theek hai: screens se context folder tak)
import { useAuth } from './context/AuthContext'; 


// --- NAVIGATION TYPES FOR CLI ---
// Zaroori: Aapko ye routes App.tsx mein register karne honge
type RootStackParamList = {
  Login: undefined; // Target after logout
  Main: undefined;
  // Naye Routes jo tiles mein use honge
  StartDaySelection: undefined;
  StartDay: undefined; 
  Visits: undefined;
  Report: undefined;
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
    primary: '#70ac3b', // Blue color
    onPrimary: '#ffffff', // Button text white
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
  const { logout , user } = useAuth();

  // hook intialization
  const { t } = useTranslation();
  
 const handleLogout = () => {
    Alert.alert(
      t('confirm'), // Professional Title
      t('logout_message'), // Professional Message
      [
        {
          text: t('cancel'),
          onPress: () => console.log("Logout Cancelled"),
          style: "cancel"
        },
        { 
          text: t('logout_btn'), 
          onPress: async () => {
            await logout();
            navigation.replace('Login'); 
          },
          style: "destructive" 
        }
      ],
      { cancelable: true }
    );
  };

 return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileHeader}>
    <View style={{ flex: 1 }}>
      <Text style={styles.welcomeSubText}>{t('welcome_back')}</Text>
      <Text style={styles.userMainName}>{user?.fullname || 'User'}</Text>
    </View>
    
    {/* Right side Menu Icon */}
    <TouchableOpacity 
      style={styles.headerIconCircle}
      onPress={() => Alert.alert("Profile", `Name: ${user?.fullname}\nDesignation: ${user?.designation || 'N/A'}`)}
    >
      <Ionicons name="person-circle-outline" size={45} color={theme.colors.primary} />
    </TouchableOpacity>
  </View>

          {/* Tiles Section */}
          <View style={styles.dashboardGrid}>
            <DashboardItem 
              icon="sunny-outline" 
              label={t('start_day')} 
              onPress={() => navigation.navigate('StartDaySelection')} 
            />
            <DashboardItem 
              icon="location-outline" 
              label={t('visits')} 
              onPress={() => navigation.navigate('Visits')} 
            />

          </View>

          {/* 🆕 Row 2: Reports Section (Same tiles style) */}
          <View style={styles.dashboardGrid}>
            <DashboardItem 
              icon="document-text-outline" 
              label={t('reports')} 
              onPress={() => navigation.navigate('Report')} 
            />
            {/* Ye empty View isliye taake "Reports" wala box left side par alignment mein rahe */}
            <View style={{ width: '45%', backgroundColor: 'transparent' }} />
          </View>
          
          <View style={styles.filler} />
        </ScrollView>
        
        {/* Logout Section */}
        <View style={styles.logoutSection}>

          <Button 
            mode="contained" 
            onPress={handleLogout} // ✅ Alert function trigger hoga
            style={styles.button}
            labelStyle={styles.buttonLabel}
            // ✅ Logout Icon for professional look
            icon={({ size, color }) => (
              <Ionicons name="log-out-outline" size={size} color={color} />
            )}
          >
            {t('logout_btn')}
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
    color: '#70ac3b', 
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
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  welcomeSubText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  userMainName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: -2,
  },
  headerIconCircle: {
    backgroundColor: '#f0f9eb',
    borderRadius: 30,
    padding: 2,
  },
});