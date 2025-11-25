import {useState , useEffect} from 'react';
import { View, StyleSheet , Alert , TouchableOpacity} from 'react-native';
import { Text, Button, Provider as PaperProvider , TextInput ,  MD3LightTheme as DefaultTheme  } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons'; // Import Ionicons
import * as Location from 'expo-location';
import { LocationObjectCoords } from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../context/authContext';
import axios  from 'axios';

// 1. Blue Theme Define kiya hai
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#007bff', // Ye wo Blue color hai (Button + Input Focus)
    onPrimary: '#ffffff', // Button ke text ka color white
  },
};

export default function StartDayScreen() {
  const router = useRouter();
  const { token } = useAuth();

  // State Management for Location and Photo and readings
  const [meterReadings , setMeterReadings] = useState('');
  const [photoUri , setPhotoUri] = useState<string | null>(null);
  const [currentLocation , setCurrentLocation] = useState<LocationObjectCoords | null>(null);  
  const [loading , setLoading] = useState(false);
  const [locationReady , setLocationReady] = useState(false);


  // location capture logic
  useEffect(()=>{
    (
      async ()=>{
        // Request location permissions
        let {status} = await Location.requestForegroundPermissionsAsync();
        if(status === 'granted'){
          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation
          });
          setCurrentLocation(location.coords);
          setLocationReady(true);
          setLoading(false);
          console.log('Location captured: ' , location.coords);
        }
        else{
          Alert.alert('Permission Denied' , 'Location permission is required to start the day.');
        }
      }
    )()
  }, []);


  // image picker logic

  const handlePickImage = async () => {
    // Permission for camera request 
    const { status} = await ImagePicker.requestCameraPermissionsAsync();
    if(status !== 'granted'){
      Alert.alert('Permission Denied' , 'Camera permission is required to take a photo.');
      return;
    }

    // Launch camera to take photo
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: false,
    });


    if(!result.canceled){
      // Image path save to state
      setPhotoUri(result.assets[0].uri);
      console.log('Photo captured: ' , result.assets[0].uri);
    }
  }


  // submission logic
  const handleSubmit = async () =>{
    // Validations
    if(!meterReadings && !photoUri){
      Alert.alert('Incomplete Data' , 'Please provide meter readings and take a photo.');
      return;
    }

    if(!currentLocation && !locationReady){
      Alert.alert('Location Not Ready' , 'Waiting for location data. Please try again in a moment.');
      return;
    }

    setLoading(true);


    // Prepare form data
      const submissionData = {
        meterReadings: meterReadings,
        photoUri: photoUri,
        location: {
             latitude: currentLocation?.latitude,
             longitude: currentLocation?.longitude,
        },
        
      };
      
      // show data in console (for testing)
      console.log("final payload data submission...");
      console.log("Submission Data: " , submissionData);
      const payload = AsyncStorage.setItem('startDaydata' , JSON.stringify(submissionData));
      console.log("Payload stored in AsyncStorage." , payload);
      
      
       
      //  API submission
    try{
      
      // Abhi API call ko skip karte hain, sirf simulation karte hain
        await new Promise(resolve => setTimeout(resolve, 1500));

        setLoading(false);
        Alert.alert('Success' , 'Your day has been started successfully!');
        router.replace('/main');

      

    }
    catch(error){
      console.error('Submission Error: ' , error);
      Alert.alert('Submission Failed' , 'An error occurred while submitting your data. Please try again.');
    }
  }


  
  return (
    <PaperProvider theme={theme}>

    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.headerText}>
        Start Your Day
      </Text>

      {/* 1. Image Pick Section */}
        <TouchableOpacity style={styles.photoButton} onPress={handlePickImage} disabled={loading}>
          <Ionicons name={photoUri ? "checkmark-circle" : "camera-outline"} size={30} color={photoUri ? 'green' : '#007bff'} />
          <Text style={styles.buttonText}>{photoUri ? 'Photo Captured' : 'Take Picture'}</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        {/* 2. Readings Input Section */}
        <TextInput
          label="Enter Readings"
          value={meterReadings}
          onChangeText={setMeterReadings}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          disabled={loading}
        />
        
        {/* Submit Button */}
        <Button 
          mode="contained" 
          onPress={handleSubmit}
          loading={loading}
          // Button disable hoga agar Location nahi mili HO, ya dono fields empty hon
          disabled={loading || (!meterReadings.trim() && !photoUri) || !locationReady} 
          style={styles.submitButton}
        >
          {loading ? 'Capturing...' : 'Save Check-in'}
        </Button>
        
        <Button mode="text" onPress={() => router.back()} disabled={loading} style={styles.backButton}>
          Cancel / Go Back
        </Button>
        
        {/* Location ready check */}
        {!locationReady && 
            <Text style={styles.locationWaiting}>
                <Ionicons name="alert-circle-outline" size={14} /> Waiting for Location...
            </Text>
        }
    
       
      <Button mode="outlined" onPress={() => router.back()} style={styles.backButton}>
        Go Back to Dashboard
      </Button>
    </View>
    </PaperProvider>
  );
}

// ... (Component ke baad) ...

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#fff',
  },
  headerText: { 
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#007bff',
    textAlign: 'center',
    marginTop: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: '#fff',
    outlineColor: '#007bff',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007bff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#e6f0ff',
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#007bff',
  },
  orText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    color: '#555',
    fontWeight: 'bold',
  },
  locationWaiting: {
    textAlign: 'center',
    color: 'orange',
    marginTop: 15,
    fontSize: 14,
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 5,
  },
  backButton: {
    marginTop: 10,
  }
});

