// VisitsScreen.tsx

import { useState } from "react";
// 🛑 FIX: Yahan 'Text' ko 'RNText' naam diya gaya hai taake woh Paper ke 'Text' se takraaye nahi.
import { View, StyleSheet, TouchableOpacity, Text as RNText } from "react-native";
import {
  // ✅ Yahan hum Paper ke components ko import kar rahe hain
  Text, // <--- Yeh 'react-native-paper' ka Text component hai
  Button,
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
} from "react-native-paper";

// 🛑 1. Translation Import
import { useTranslation } from 'react-i18next';
import Ionicons from "react-native-vector-icons/Ionicons";

import { useNavigation, } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

// Navigation Type (simple)
type RootStackParamList = {
  Main: undefined;
  CustomerList: undefined;
  AddNewCustomer: undefined;
};

type VisitsNav = NativeStackNavigationProp<RootStackParamList, "Main">;

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#70ac3b",
    onPrimary: "#ffffff",
  },
};

export default function VisitsScreen() {
  const navigation = useNavigation<VisitsNav>();
  const [loadingExisting, setLoadingExisting] = useState<boolean>(false);
  const [loadingNew, setLoadingNew] = useState<boolean>(false);

// 🛑 2. Hook Initialize karein
  const { t } = useTranslation();

  // Jab Existing User button press ho
  const handleExistingUserVisit = () => {
    setLoadingExisting(true);
    navigation.navigate("CustomerList");
    setTimeout(() => {
      setLoadingExisting(false);
    }, 1000);
  };

  // Jab New User button press ho
  const handleNewUserVisit = () => {
    setLoadingNew(true);
    navigation.navigate("AddNewCustomer");
    setTimeout(() => {
      setLoadingNew(false);
    }, 1000);
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.headerText}>
          {t('select_customer')}
        </Text>

        {/* Existing User Button */}
        <TouchableOpacity
          style={[styles.button, styles.existingUserButton]}
          onPress={handleExistingUserVisit}
          disabled={loadingExisting || loadingNew}
        >
          <Ionicons name="people-circle-outline" size={30} color="#70ac3b" />
          <Text style={[styles.buttonText, { color: '#70ac3b' }]}>
            {t('existing_customer')}
          </Text>
        </TouchableOpacity>

        {/* 🛑 FIX: Ab yahan hum RNText (React Native ka default Text) use kar rahe hain */}
        <RNText style={styles.orText}>OR</RNText>

        {/* New User Button */}
        <TouchableOpacity
          style={[styles.button, styles.newUserButton]}
          onPress={handleNewUserVisit}
          disabled={loadingNew || loadingExisting}
        >
          <Ionicons name="person-add-outline" size={30} color="#70ac3b" />
          {/* Text color green set kiya gaya */}
          <Text style={[styles.buttonText, { color: '#70ac3b' }]}>
            {t('new_customer')}
          </Text>
        </TouchableOpacity>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          {t('go_back')}
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
    color: "#70ac3b",
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
    borderColor: "#70ac3b",
    backgroundColor: "#d1e2c5", // Halka neela (light blue)
  },
  newUserButton: {
    borderColor: "#70ac3b", // Sabz (green) border
    backgroundColor: "#d1e2c5", // Halka sabz (light green)
  },
  buttonText: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: "700",
   
    color: "#70ac3b",
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