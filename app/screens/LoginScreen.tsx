import { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/authContext';
import axios from 'axios';
import { TextInput, Button, Provider as PaperProvider } from 'react-native-paper';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:3000/api/users/login', {
        email,
        password,
      });

      const data = res.data;
      console.log('Login successful:', data);

      // Token store in AuthContext + AsyncStorage
      await login(data.token);

      // Redirect to MainScreen
      router.replace('/screens/MainScreen');
    } catch (err: any) {
      console.log(err.response?.data || err.message);
      Alert.alert('Login Failed', err.response?.data?.message || 'Check credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />
        <Button
          mode="contained"
          onPress={handleLogin}
          loading={loading}
          style={styles.button}
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
  },
  input: {
    marginBottom: 15,
  },
  button: {
    padding: 5,
  },
});
