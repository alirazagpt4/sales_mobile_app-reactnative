import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/authContext';
import axios from 'axios';
import { 
  TextInput, 
  Button, 
  Provider as PaperProvider, 
  Text, 
  MD3LightTheme as DefaultTheme 
} from 'react-native-paper';

// 1. Blue Theme Define kiya hai
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007bff', // Ye wo Blue color hai (Button + Input Focus)
    onPrimary: '#ffffff', // Button ke text ka color white
  },
};

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await axios.post('http://192.168.0.114:3000/api/users/login', {
        email,
        password,
      });

      const data = res.data;
      console.log('Login successful:', data);

      await login(data.token);
      router.replace('/main');
    } catch (err: any) {
      console.log(err.response?.data || err.message);
      Alert.alert('Login Failed', err.response?.data?.message || 'Check credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Theme ko yahan pass kiya taake puri app par blue color apply ho
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        
        {/* 2. H1 Type Header Add kiya */}
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
          // Agar outline always blue chahiye to uncomment karein neechay wali line:
          outlineColor="#007bff" 
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
          // Agar outline always blue chahiye to uncomment karein neechay wali line:
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
    backgroundColor: '#fff', // Clean look ke liye background white
  },
  // Header Style
  headerText: {
    color: '#007bff', // Same Blue color
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40, // Thora gap inputs se
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 10,
    borderRadius: 5, // Thora rounded nice lagta hai
  },
  buttonContent: {
    paddingVertical: 6, // Button ki height thori behtar karne ke liye
  }
});