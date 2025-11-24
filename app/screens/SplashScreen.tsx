import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Text, Provider as PaperProvider } from 'react-native-paper';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current; // initial opacity 0

  useEffect(() => {
    // Fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // 2 sec ke baad login screen par jao
    const timer = setTimeout(() => {
      router.replace('/screens/LoginScreen');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <PaperProvider>
      <View style={styles.container}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.text}>Splash Screen</Text>
        </Animated.View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 32, fontWeight: 'bold' },
});
