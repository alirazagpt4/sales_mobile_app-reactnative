import { View, StyleSheet } from 'react-native';
import { Text, Button, Provider as PaperProvider } from 'react-native-paper';
import { useRouter } from 'expo-router';

export default function VisitsScreen() {
  const router = useRouter();
  
  return (
    <PaperProvider>
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.text}>
        🗺️ Visits Tracking Screen
      </Text>
       <Text style={styles.subText}>
        (Your map and visit list will go here.)
      </Text>
      <Button mode="outlined" onPress={() => router.back()} style={styles.button}>
        Go Back to Dashboard
      </Button>
    </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    backgroundColor: '#fff',
  },
  text: { 
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007bff',
  },
  subText: {
    marginBottom: 30,
    textAlign: 'center',
    color: '#555',
  },
  button: {
    marginTop: 20,
    borderColor: '#007bff',
    borderWidth: 1,
  }
});