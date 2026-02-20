import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text as RNText, Alert } from 'react-native';
import {
  Text,
  Button,
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
} from 'react-native-paper';

// 🛑 Icons aur Navigation
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#70ac3b",
    onPrimary: "#ffffff",
  },
};

// 1. Navigation Types define karein (File ke upar imports ke niche)
type RootStackParamList = {
  Main: undefined;
  Report: undefined;
  DailyVisitReport: undefined; // 👈 Nayi screen ka naam
};



export default function ReportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  // Button Press logic
  const handleDailyVisitReport = () => {
    setLoading(true);
    // Abhi ke liye sirf Alert, baad mein navigation daal denge
    // Alert.alert("DVR", "Hello DVR");
    navigation.navigate("DailyVisitReport");
    
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.headerText}>
          {t('reports') || "Reports Center"}
        </Text>

        {/* Daily Visit Report Button (VisitsScreen ke style jaisa) */}
        <TouchableOpacity
          style={[styles.button, styles.reportButton]}
          onPress={handleDailyVisitReport}
          disabled={loading}
        >
          <Ionicons name="document-text-outline" size={30} color="#70ac3b" />
          <Text style={styles.buttonText}>
            {t('DailyVisitReport') || "Daily Visit Report"}
          </Text>
        </TouchableOpacity>

        {/* Go Back Button */}
        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          {t('go_back') || "Go Back"}
        </Button>

      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#fff",
    justifyContent: 'center' // Elements ko center mein rakhne ke liye
  },
  headerText: {
    fontWeight: "bold",
    marginBottom: 60,
    color: "#70ac3b",
    textAlign: "center",
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
  reportButton: {
    borderColor: "#70ac3b",
    backgroundColor: "#d1e2c5", // Light green background jaisa visits mein tha
  },
  buttonText: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: "700",
    color: "#70ac3b",
  },
  backButton: {
    marginTop: 30,
  }
});