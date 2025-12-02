import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Animated, 
  Text, 

  
} from 'react-native';
// React Navigation se zaroori types aur hook import kiye
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// 🛑 Zaroori: Aapke Stack Navigator ke routes ke types define karein
// 'Login' woh screen hai jahan hum jaana chahte hain
type RootStackParamList = {
  Login: undefined; 
  Splash: undefined;
  // Agar koi aur screens hain toh unhein bhi yahan add karein
};

export default function SplashScreen() {
  // Navigation hook ko sahi type dekar use kiya
  // const navigation = useNavigation<NavigationProp<RootStackParamList>>(); 
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  // Animated value, initial opacity 0
  const fadeAnim = useRef(new Animated.Value(0)).current; 

  useEffect(() => {
    // Fade-in animation shuru karein (3 seconds ka duration)
    Animated.timing(fadeAnim, {
      toValue: 1, // Opacity 0 se 1 tak
      duration: 3000,
      useNativeDriver: true,
    }).start();

    // 2 second (2000ms) baad Login Screen par redirect ho jao
    const timer = setTimeout(() => {
      // expo-router ki jagah, hum 'navigation.replace' use kar rahe hain
      navigation.replace('Login'); 
    }, 2000);

    // Component unmount hone par timer clear karein
    return () => clearTimeout(timer);
  }, [fadeAnim, navigation]); // Dependencies add kiye

  return (
    // react-native-paper ke Provider ki jagah, standard View
    <View style={styles.container}>
      <Animated.View style={[{ opacity: fadeAnim }]}>
        {/* Standard React Native Text, H1 style ke liye font size set kiya */}
        <Text style={styles.text}>
          Splash Screen
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff', // White background
  } ,
  text: { 
    fontSize: 40, // H1 style ke liye size
    fontWeight: 'bold',
    color: '#007bff', // Blue color
    textAlign: 'center',
  },
});