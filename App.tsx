/**
 * Final App Entry Point with Custom Navigation Stack (Context Wrapped)
 */

import { useAuth } from './src/context/AuthContext';
import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import './src/i18n';

// 🛑 1. AuthProvider import karein
import { AuthProvider } from './src/context/AuthContext';

// Apne custom components ko import karein
import SplashScreen from './src/SplashScreen';
import LoginScreen from './src/LoginScreen'; // Login Screen zaroori hai
import MainScreen from './src/MainScreen';
import StartDayScreen from './src/StartDayScreen';
import VisitsScreen from './src/VisitsScreen';
import AddNewCustomerScreen from './src/AddNewCustomerScreen';
import CustomerListScreen from './src/CustomersListScreen';
import ReportScreen from './src/ReportScreen';
import DailyVisitReportScreen from './src/DailyVisitReportScreen';
import { useTranslation } from 'react-i18next';

// 1. Stack Navigator aur Routes define karein
const Stack = createNativeStackNavigator();

// Zaroori Types: Aapke routes ke naam
type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined; // Assuming the screen after login
};

// Original App function ka naam 'RootNavigation' rakh dete hain
function RootNavigation(): React.JSX.Element {
  const { token } = useAuth();
const { t } = useTranslation();
  return (
    // 2. NavigationContainer: Saare navigation ko handle karta hai
    <NavigationContainer>
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor="#fff"
      />

      <Stack.Navigator
        initialRouteName="Splash" // Sabse pehle 'Splash' screen chalao
        screenOptions={{
          headerShown: false,
        }}
      >

        {token == null ? (
          <>
  <Stack.Screen 
  name="Splash" 
  component={SplashScreen} 
  />
        <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        />
        </>
        ) : (
          <>

        <Stack.Screen 
        name="Main" 
        component={MainScreen} 
        />
        <Stack.Screen
        name='StartDay'
        component={StartDayScreen}
        options={{ 
          headerShown: true, // Is screen par header title dikhana better hoga
          title: t('start_day_header') 
        }
      }/>
          <Stack.Screen
          name='Visits'
          component={VisitsScreen}
          options={{ 
            headerShown: true, 
            title: t('mark_visit_header') 
          }}
          
          />

            <Stack.Screen 
            name="AddNewCustomer" 
            component={AddNewCustomerScreen} 
            options={{ title: 'Add New Customer' }}
            />
                <Stack.Screen 
                name="CustomerList" 
                component={CustomerListScreen} 
                options={{ title: 'Customer List' }}
                />
                <Stack.Screen 
                name="Report" 
                component={ReportScreen} 
                options={{ title: 'Reports' }}
                />
                <Stack.Screen 
                name="DailyVisitReport" 
                component={DailyVisitReportScreen} 
                options={{ title: 'Daily Visit Report' }}
                />
                </>

        )}


      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 🛑 3. Naya Root Component jo AuthProvider ko wrap karta hai
export default function App() {
  return (
    <AuthProvider>
      <RootNavigation />
    </AuthProvider>
  );
}