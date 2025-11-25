import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  Text, 
  Provider as PaperProvider, 
  MD3LightTheme as DefaultTheme 
} from 'react-native-paper';

// Same Blue Theme taake Login aur Splash match karein
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007bff', // Blue color
  },
};

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current; // initial opacity 0

  useEffect(() => {
    // Fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: true,
    }).start();

    // 3 sec ke baad login screen par jao
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* H1 Style Text - Blue Color */}
          <Text variant="displayLarge" style={styles.text}>
            Splash Screen
          </Text>
        </Animated.View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#fff', // Background white taake blue text pop kare
  },
  text: { 
    fontWeight: 'bold',
    color: '#007bff', // Primary Blue color manually force kiya
    textAlign: 'center',
  },
});