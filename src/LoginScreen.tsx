// File: src/screens/LoginScreen.tsx

import React, { useState } from 'react';
import { View, StyleSheet, Alert ,  Image} from 'react-native';

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

const logo = require('./assets/farmsolution.png');
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
    primary: '#70ac3b', // Blue color
    onPrimary: '#ffffff', // Button text white
  },
};

export default function LoginScreen() {
  const { login } = useAuth();

  // 🛑 useRouter ki jagah useNavigation hook istemaal kiya
  const navigation = useNavigation<LoginNavigationProp>(); 
  
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      // 🛑 Debugging ke liye yahan console.log add karein:
      console.log('Sending name:', name);
      console.log('Sending Password:', password);
      const res = await axios.post('http://38.242.201.229/api/users/login', {
        name,
        password,
      });

      const data = res.data;
      console.log('Login successful:', data);

      await login(data.token , data.user);
      
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

        <Image 
          source={logo} 
          style={styles.logo} // Logo ki size styles mein define ki gayi hai
          resizeMode="contain"
        />
        
        <Text variant="displayMedium" style={styles.headerText}>
          Login
        </Text>

        <TextInput
          label="Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          keyboardType="default"
          autoCapitalize="none"
          style={styles.input}
          outlineColor="#70ac3b" 
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
          outlineColor="#70ac3b"
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
  logo: {
    width: 150, // Aapki zaroorat ke mutabiq adjust karein
    height: 150,
    alignSelf: 'center', // Center mein laane ke liye
    marginBottom: 20, // Login text se thoda fasla
  },
  headerText: {
    color: '#70ac3b',
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