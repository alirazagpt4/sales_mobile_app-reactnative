// StartDayScreen.tsx

import { useState, useEffect } from "react";
import { View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import {
  Text,
  Button,
  Provider as PaperProvider,
  TextInput,
  MD3LightTheme as DefaultTheme,
} from "react-native-paper";

import { Platform, PermissionsAndroid } from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";
import Geolocation, {
  GeoCoordinates,
} from "react-native-geolocation-service";
import { launchCamera, Asset } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useNavigation,  } from "@react-navigation/native";
import {NativeStackNavigationProp  } from "@react-navigation/native-stack";
import axios from "axios";

type StartDayNav = NativeStackNavigationProp<RootStackParamList, "Main">;

const API_URL = "http://38.242.201.229/api/startday";

// Navigation Type (simple)
type RootStackParamList = {
  Main: undefined;
};

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#70ac3b",
    onPrimary: "#ffffff",
  },
};

export default function StartDayScreen() {
  const navigation = useNavigation<StartDayNav>();

  const [token, setToken] = useState<string | null>(null);

  const [meterReadings, setMeterReadings] = useState<string>("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<GeoCoordinates | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [locationReady, setLocationReady] = useState<boolean>(false);

  // Load Token
  useEffect(() => {
    AsyncStorage.getItem("token").then((t) => setToken(t));
  }, []);

  // Get Location
useEffect(() => {
  const requestLocationPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "App needs access to your location",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert("Permission Denied", "Location permission is required.");
        return;
      }
    }

    // Geolocation.requestAuthorization("whenInUse");
    if (Platform.OS === "ios") {
  const auth = await Geolocation.requestAuthorization("whenInUse");
  if (auth !== "granted") {
    Alert.alert("Permission Denied", "Location permission is required.");
    return;
  }
}

    Geolocation.getCurrentPosition(
      (pos) => {
        setCurrentLocation(pos.coords);
        setLocationReady(true);
      },
      (err) => {
        Alert.alert("Location Error", err.message);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  requestLocationPermission();
}, []);


  // Pick Image
  const handlePickImage = async () => {
    const result = await launchCamera({
      mediaType: "photo",
      quality: 0.7,
      saveToPhotos: true,
    });

    const asset: Asset | undefined =
      result?.assets && result.assets.length > 0
        ? result.assets[0]
        : undefined;

    if (asset?.uri) {
      setPhotoUri(asset.uri);
    }
  };

  // Submit
  const handleSubmit = async () => {
    if (!meterReadings && !photoUri) {
      Alert.alert(
        "Incomplete Data",
        "Please provide meter readings or take a photo."
      );
      return;
    }

    if (!currentLocation || !locationReady) {
      Alert.alert("Location Not Ready", "Waiting for location...");
      return;
    }

    setLoading(true);

    const payloadData = {
      meterReadings: meterReadings.trim(),
      location: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        timeStamp: new Date().toISOString(),
      },
      photoUri,
    };

    await AsyncStorage.setItem("startDaydata", JSON.stringify(payloadData));

    const formData = new FormData();
    formData.append("data", JSON.stringify(payloadData));

    if (photoUri) {
      const fileName = photoUri.split("/").pop() || "image.jpg";

      formData.append("image", {
        uri: photoUri,
        name: fileName,
        type: "image/jpeg",
      } as any); // 👈 TypeScript fix
    }

    try {
      const response = await axios.post(API_URL, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log('API Response:', response.data);
      Alert.alert("Success", "Start day saved!");
      await AsyncStorage.removeItem("startDaydata");
      setMeterReadings("");
      setPhotoUri(null);
      setCurrentLocation(null);
      setLocationReady(false);

      navigation.replace("Main");
    } catch (error: any) {
      console.log("Error:", error);
      Alert.alert("Error", "Failed to submit data.");
   } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.headerText}>
          Start Your Day
        </Text>

        {/* Image Button */}
        <TouchableOpacity
          style={styles.photoButton}
          onPress={handlePickImage}
          disabled={loading}
        >
          <Ionicons
            name={photoUri ? "checkmark-circle" : "camera-outline"}
            size={30}
            color={photoUri ? "#70ac3b" : "##fdc440"}
          />
          <Text style={styles.buttonText}>
            {photoUri ? "Photo Captured" : "Take Picture"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        <TextInput
          label="Enter Readings"
          value={meterReadings}
          onChangeText={setMeterReadings}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          disabled={loading}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={
            loading || (!meterReadings.trim() && !photoUri) || !locationReady
          }
          style={styles.submitButton}
        >
          {loading ? "Capturing..." : "Save Check-in"}
        </Button>

        {!locationReady && (
          <Text style={styles.locationWaiting}>
            <Ionicons name="alert-circle-outline" size={14} /> Waiting for
            location...
          </Text>
        )}
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
  input: {
    marginBottom: 15,
    backgroundColor: "#fff",
    
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#70ac3b",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#d1e2c5",
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "600",
    color: "#70ac3b",
  },
  orText: {
    textAlign: "center",
    marginBottom: 20,
    fontSize: 16,
    color: "#70ac3b",
    fontWeight: "bold",
  },
  locationWaiting: {
    textAlign: "center",
    color: "orange",
    marginTop: 15,
    fontSize: 14,
  },
  submitButton: { marginTop: 20 },
});
