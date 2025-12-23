// File: src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from './context/AuthContext';
import axios from 'axios';

import {
  TextInput,
  Button,
  Provider as PaperProvider,
  Text,
  MD3LightTheme as DefaultTheme
} from 'react-native-paper';

const logo = require('./assets/farmsolution.png');

type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

type LoginNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#70ac3b',
    onPrimary: '#ffffff',
  },
};

export default function LoginScreen() {
  const { login } = useAuth();
  const navigation = useNavigation<LoginNavigationProp>();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Password show/hide karne ki state
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      console.log('Sending name:', name);

      const res = await axios.post('http://38.242.201.229/api/users/login', {
        name,
        password,
      });

      const data = res.data;
      await login(data.token, data.user);
      navigation.replace('Main');

    } catch (err: any) {
      console.log(err.response?.data || err.message);
      Alert.alert('Login Failed', err.response?.data?.message || 'Check credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider theme={theme}>
      {/* KeyboardAvoidingView: Taake keyboard screen ko cover na kare */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={logo}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Variant 'headlineSmall' use kiya hai taake size chota ho jaye */}
          <Text variant="headlineSmall" style={styles.headerText}>
            Login
          </Text>

          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            autoCapitalize="none"
            style={styles.input}
            outlineColor="#70ac3b"
            // Left icon for user (Optional but looks good)
            left={<TextInput.Icon icon="account" color="#70ac3b" />}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            // 🛑 IS LINE KO DHAYAN SE DEKHEIN:
            secureTextEntry={!isPasswordVisible}
            style={styles.input}
            outlineColor="#70ac3b"
            left={<TextInput.Icon icon="lock" color="#70ac3b" />}
            // Eye Icon Toggle
            right={
              <TextInput.Icon
                icon={isPasswordVisible ? "eye-off" : "eye"}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                color="#70ac3b"
              />
            }
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
        </ScrollView>
      </KeyboardAvoidingView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 200, // Logo bara kar diya (150 se 200)
    height: 200,
    alignSelf: 'center',
    marginBottom: 10,
  },
  headerText: {
    color: '#70ac3b',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 22, // Size chota kar diya
    marginBottom: 30,
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