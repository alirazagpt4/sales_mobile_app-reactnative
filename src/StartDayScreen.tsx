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
import NetInfo from "@react-native-community/netinfo";

// 🛑 1. Translation Import
import { useTranslation } from 'react-i18next';

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

  // 🛑 2. Hook Initialization
  const { t } = useTranslation();

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
          title: t('confirm'), // Professional Title
          message: "App needs access to your location",
          buttonNegative: t('location_err'),
          buttonPositive: "OK",
        }
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(t('error'), t('location_err'));
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
      () => {
        Alert.alert(t('error'), t('gps_error'));
      },
      { enableHighAccuracy: true, timeout: 30000 }
    );
  };

  requestLocationPermission();
}, []);


  // Pick Image
  const handlePickImage = async () => {
    const result = await launchCamera({
      mediaType: "photo",
      quality: 0.4,
      maxWidth: 800,      // Image ki width limit karein taake memory crash na ho
      maxHeight: 800,
      saveToPhotos: false,
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


    // 1. Pehle Internet Check karein
    const state = await NetInfo.fetch();
    
    if (!state.isConnected) {
        Alert.alert(t('error'), t('no_internet'));
        return;
    }
    
    // 1. Local variable mein foran value save karein (State par depend na karein)
    const readingsValue = meterReadings.trim();
    const currentPhoto = photoUri;

    if (!readingsValue || !currentPhoto) {
        Alert.alert(t('error'), t('incomplete_data'));
        return;
    }

    if (!currentLocation || !locationReady) {
        Alert.alert(t('error'), t('waiting_location'));
        return;
    }

    setLoading(true);

    try {
        // 2. Payload banayein local variables se
        const payloadData = {
            photoUri: currentPhoto,
            meterReadings: readingsValue,
            location: {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                timeStamp: new Date().toISOString(),
            },
        };

        // Backup save karein
         await AsyncStorage.setItem("startDaydata", JSON.stringify(payloadData));

        const formData = new FormData();
        // 🛑 Backend ke mutabiq single "data" field mein JSON bhej rahe hain
        formData.append("data", JSON.stringify(payloadData));

        if (currentPhoto) {
            const fileName = currentPhoto.split("/").pop() || "image.jpg";
            
            // 🛑 Purane Androids ke liye path check
            const cleanUri = Platform.OS === 'android' ? currentPhoto : currentPhoto.replace('file://', '');

            formData.append("image", {
                uri: cleanUri,
                name: fileName,
                type: "image/jpeg",
            } as any);
        }

        const response = await axios.post(API_URL, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
            // 🛑 Purane phones slow hote hain, timeout barha den
            timeout: 60000, 
        });
        
        console.log('API Response:', response.data);
        Alert.alert(t('success'), t('start_day_success'));

        // ✅ START: YE DO LINES ADD KAREIN
        const today = new Date().toLocaleDateString();
        await AsyncStorage.setItem("last_submission_date", today);
        // ✅ END: AB SELECTION SCREEN PAR BUTTONS DISABLE HO JAYENGE
        
        // Cleanup
         await AsyncStorage.removeItem("startDaydata");
        setMeterReadings("");
        setPhotoUri(null);
        setLocationReady(false);

        // 🛑 Navigation se pehle thora gap den taake memory release ho jaye
        setTimeout(() => {
            navigation.replace("Main");
        }, 500);

    } catch (error: any) {
        console.log("Error details:", error.response?.data || error.message);
        Alert.alert("Error", "Failed to submit data. Please check your internet or try again.");
    } finally {
        setLoading(false);
    }
};

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <Text variant="headlineMedium" style={styles.headerText}>
          {t('start_day_header')}
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
            {photoUri ? t('photo_captured') : t('take_picture')}
          </Text>
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        <TextInput
          label={t('enter_readings')}
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
          {loading ? t('capturing') : t('save_checkin')}
        </Button>

        {!locationReady && (
          <Text style={styles.locationWaiting}>
            <Ionicons name="alert-circle-outline" size={14} /> {t('waiting_location')}
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
