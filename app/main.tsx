import { View, StyleSheet } from 'react-native';
import { 
  Button, 
  Text, 
  Provider as PaperProvider, 
  MD3LightTheme as DefaultTheme 
} from "react-native-paper";

import { useAuth } from '../context/authContext';
import { useRouter } from 'expo-router';

// Define the Blue Theme for consistent styling
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007bff', // The consistent blue color
  },
};

export default function MainScreen() {
  const router = useRouter();
  
  const { logout } = useAuth();
  
  return (
    // Wrap component in PaperProvider to apply theme color to Button
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        
        {/* H1 Style Text - Blue Color */}
        <Text variant="displayMedium" style={styles.headerText}>
          Main Screen
        </Text>
        
        {/* Button will automatically use the blue primary color */}
        <Button 
          mode="contained" 
          onPress={() => {
            // LOGIC UNTOUCHED
            logout();
            router.replace('/login');
          }}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Logout
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
    backgroundColor: '#fff', // Consistent white background
  },
  headerText: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#007bff', // Blue color applied
    marginBottom: 40, // Space between text and button
  },
  button: {
    borderRadius: 5,
  },
  buttonContent: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  }
});