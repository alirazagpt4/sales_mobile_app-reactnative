// File: src/screens/LoginScreen.tsx

import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';

// 🛑 CLI Navigation Imports
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; 
// Auth context aur axios
import { useAuth } from './context/AuthContext'; 
import axios from 'axios';

// React Native Paper Components
import { 
  TextInput, 
  Button, 
  Provider as PaperProvider, 
  Text, 
  MD3LightTheme as DefaultTheme 
} from 'react-native-paper';

// 🛑 Navigation Types CLI Ke Liye
// Ye types App.tsx mein diye gaye routes ke mutabiq honi chahiye
type RootStackParamList = {
  Login: undefined;
  Main: undefined; // Assuming your main screen after login is 'main'
};

// Native Stack ka specific type taake 'replace' method kaam kare
type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

// 1. Blue Theme Define kiya hai
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007bff', // Blue color
    onPrimary: '#ffffff', // Button text white
  },
};

export default function LoginScreen() {
  const { login } = useAuth();

  // 🛑 useRouter ki jagah useNavigation hook istemaal kiya
  const navigation = useNavigation<LoginNavigationProp>(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      // 🛑 Debugging ke liye yahan console.log add karein:
      console.log('Sending Email:', email);
      console.log('Sending Password:', password);
      const res = await axios.post('http://38.242.201.229/api/users/login', {
        email,
        password,
      });

      const data = res.data;
      console.log('Login successful:', data);

      await login(data.token);
      
      // 🛑 router.replace('/main') ki jagah navigation.replace('main') use kiya
      navigation.replace('Main'); 
      
    } catch (err: any) {
      console.log(err.response?.data || err.message);
      Alert.alert('Login Failed', err.response?.data?.message || 'Check credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    // PaperProvider ko yahan wrap kiya gaya hai
    <PaperProvider theme={theme}> 
      <View style={styles.container}>
        
        <Text variant="displayMedium" style={styles.headerText}>
          Login
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          outlineColor="#007bff" 
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
          outlineColor="#007bff"
        />
        
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Login
        </Button>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  headerText: {
    color: '#007bff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 10,
    borderRadius: 5,
  },
  buttonContent: {
    paddingVertical: 6,
  }
});