// VisitsScreen.tsx

import { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import {
  Text,
  Button,
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
} from "react-native-paper";

import Ionicons from "react-native-vector-icons/Ionicons";

import { useNavigation, } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Navigation Type (simple)
type RootStackParamList = {
  // Yahan aapko woh screens define karni hongi jahan aap existing/new user par click karke jana chahte hain.
  // Maslan (for example): 'ExistingUserVisit' or 'NewUserForm'
  Main: undefined; 
};

type VisitsNav = NativeStackNavigationProp<RootStackParamList, "Main">;

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#007bff",
    onPrimary: "#ffffff",
  },
};

export default function VisitsScreen() {
  const navigation = useNavigation<VisitsNav>();
  const [loadingExisting, setLoadingExisting] = useState<boolean>(false);
  const [loadingNew, setLoadingNew] = useState<boolean>(false);

  // Jab Existing User button press ho
  const handleExistingUserVisit = () => {
    setLoadingExisting(true);
    // TODO: Existing User ke liye Navigation logic yahan aayega
    Alert.alert("Navigation", "Hum Existing User Visit Screen par jaa rahe hain.");
    // For example: navigation.navigate("ExistingUserVisit");
    setTimeout(() => {
      setLoadingExisting(false);
    }, 1000);
  };

  // Jab New User button press ho
  const handleNewUserVisit = () => {
    setLoadingNew(true);
    // TODO: New User ke liye Navigation logic yahan aayega
    Alert.alert("Navigation", "Hum New User Form Screen par jaa rahe hain.");
    // For example: navigation.navigate("NewUserForm");
    setTimeout(() => {
      setLoadingNew(false);
    }, 1000);
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.headerText}>
          Select Visit Type
        </Text>

        {/* Existing User Button */}
        <TouchableOpacity
          style={[styles.button, styles.existingUserButton]}
          onPress={handleExistingUserVisit}
          disabled={loadingExisting || loadingNew}
        >
          <Ionicons name="people-circle-outline" size={30} color="#007bff" />
          <Text style={styles.buttonText}>
            Existing Customer
          </Text>
        </TouchableOpacity>

        <Text style={styles.orText}>Or</Text> {/* 'OR' ki jagah 'YA' use kiya hai */}

        {/* New User Button */}
        <TouchableOpacity
          style={[styles.button, styles.newUserButton]}
          onPress={handleNewUserVisit}
          disabled={loadingNew || loadingExisting}
        >
          <Ionicons name="person-add-outline" size={30} color="#28a745" />
          <Text style={[styles.buttonText, { color: "#28a745" }]}>
            New Customer
          </Text>
        </TouchableOpacity>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Wapis Jaayen
        </Button>

      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  headerText: {
    fontWeight: "bold",
    marginBottom: 40,
    color: "#007bff",
    textAlign: "center",
    marginTop: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  existingUserButton: {
    borderColor: "#007bff",
    backgroundColor: "#e6f0ff", // Halka neela (light blue)
  },
  newUserButton: {
    borderColor: "#28a745", // Sabz (green) border
    backgroundColor: "#e0f7e9", // Halka sabz (light green)
  },
  buttonText: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: "700",
    color: "#007bff",
  },
  orText: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
    color: "#555",
    fontWeight: "bold",
  },
  backButton: {
      marginTop: 30,
  }
});