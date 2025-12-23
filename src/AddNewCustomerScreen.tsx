import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
    Platform,
    SafeAreaView,
    StatusBar,
    PermissionsAndroid 
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

import {
    Text,
    TextInput,
    Button,
    Provider as PaperProvider,
    MD3LightTheme as DefaultTheme,
    ActivityIndicator
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Dropdown } from 'react-native-paper-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './context/AuthContext';
import axios from 'axios';

// ✅ Icons for professional look
import Feather from 'react-native-vector-icons/Feather';

type RootStackParamList = {
    Visits: undefined;
    AddNewCustomer: undefined;
    CustomerList: undefined;
};

const API_URL = "http://38.242.201.229";
type AddCustomerNav = NativeStackNavigationProp<RootStackParamList, 'AddNewCustomer'>;

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#70ac3b',
        onPrimary: '#ffffff',
    },
};

const CUSTOMERS_STORAGE_KEY = '@Customers';

export default function AddNewCustomerScreen() {
    const { token, user } = useAuth();
    const userCityId = user?.city_id ?? null;

    const [cityDisplayName, setCityDisplayName] = useState('Loading...');
    const [loadingCityName, setLoadingCityName] = useState(true);
    const navigation = useNavigation<AddCustomerNav>();

    // Form States
    const [customerName, setCustomerName] = useState('');
    const [contact, setContact] = useState('');
    const [area, setArea] = useState('');
    const [tehsil, setTehsil] = useState('');
    const [bagsPotential, setBagsPotential] = useState('');
    const [customerType, setCustomerType] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);


    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);


    const getLocation = async () => {
        setLocationLoading(true);

        // Android Permission Check
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert("Permission Denied", "Location permission is required.");
                setLocationLoading(false);
                return;
            }
        }

        // Get Current Position
        Geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
                setLocationLoading(false);
            },
            (error) => {
                console.log(error.code, error.message);
                Alert.alert("Location Error", error.message);
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };


    useEffect(() => {
        getLocation();
    }, [])




    // Fetch City Name
    useEffect(() => {
        if (typeof userCityId === 'number' && token) {
            const fetchAllCitiesAndFindName = async () => {
                try {
                    const response = await axios.get(`${API_URL}/api/cities`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const allCities: { id: number; name: string }[] = response.data;
                    const userCity = allCities.find(city => city.id === userCityId);
                    if (userCity) setCityDisplayName(userCity.name);
                    else setCityDisplayName('City Not Found');
                } catch (error) {
                    setCityDisplayName('API Error');
                } finally {
                    setLoadingCityName(false);
                }
            };
            fetchAllCitiesAndFindName();
        } else {
            setLoadingCityName(false);
        }
    }, [userCityId, token]);

    const validateForm = () => {
        if (!customerName || !contact || !area || !tehsil || !customerType) {
            Alert.alert('Required Fields', 'Please fill all fields to continue.');
            return false;
        }


        // New Check: Location capture hui ya nahi
        if (latitude === null || longitude === null) {
            Alert.alert('Location Required', 'Please wait until customer location is captured or press refresh.');
            return false;
        }


        if (contact.length !== 11) {
            Alert.alert('Invalid Contact', 'Contact number must be 11 digits.');
            return false;
        }
        return true;
    };

    const handleSaveCustomer = async () => {
        if (!validateForm()) return;
        setLoading(true);

        try {
            const payload = {
                customer_name: customerName.trim(),
                contact: contact.trim(),
                area: area.trim(),
                tehsil: tehsil.trim(),
                bags_potential: parseInt(bagsPotential) || 0,
                type: customerType,
                city_id: userCityId,
                latitude: latitude,
                longitude: longitude,
            };

            await axios.post(`${API_URL}/api/customers/create-customer`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            Alert.alert('Success', 'Customer added successfully!');

            setArea('');
            setBagsPotential('');
            setContact('');
            setCustomerName('');
            setCustomerType('');
            setTehsil('');
            setLatitude(null); // Clear lat
            setLongitude(null); // Clear long

            setTimeout(() => {
                setLoading(false);
                navigation.navigate('CustomerList');
            }, 1500);

        } catch (error) {
            Alert.alert('Error', 'Failed to save customer data.');
            setLoading(false);
        }
    };

    return (
        <PaperProvider theme={theme}>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />

                <View style={styles.header}>
                    <Text variant="headlineSmall" style={styles.headerText}>
                        Add New Customer
                    </Text>
                </View>

                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >

                    <View style={styles.dropdownWrapper}>
                        <Dropdown
                            label="Select Customer Type"
                            value={customerType}
                            onSelect={setCustomerType}
                            options={[
                                { label: 'Farmer', value: 'Farmer' },
                                { label: 'Dealer', value: 'Dealer' },
                            ]}
                            mode="outlined"
                        />
                    </View>


                    <TextInput
                        label="Customer Name"
                        value={customerName}
                        onChangeText={setCustomerName}
                        mode="outlined"
                        style={styles.input}
                        placeholder="e.g., Amir Dogar"
                        left={<TextInput.Icon icon={() => <Feather name="user" size={20} color="#777" />} />}
                    />

                    <TextInput
                        label="Contact"
                        value={contact}
                        onChangeText={setContact}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="phone-pad"
                        maxLength={11}
                        placeholder="e.g., 03144987155"
                        left={<TextInput.Icon icon={() => <Feather name="phone" size={20} color="#777" />} />}
                    />

                    <TextInput
                        label="Area"
                        value={area}
                        onChangeText={setArea}
                        mode="outlined"
                        style={styles.input}
                        placeholder="e.g., Jhipal 73 chak"
                        left={<TextInput.Icon icon={() => <Feather name="map" size={20} color="#777" />} />}
                    />

                    <TextInput
                        label="Tehsil"
                        value={tehsil}
                        onChangeText={setTehsil}
                        mode="outlined"
                        style={styles.input}
                        placeholder="e.g., Faisalabad"
                        left={<TextInput.Icon icon={() => <Feather name="navigation" size={20} color="#777" />} />}
                    />

                    <TextInput
                        label="City (Auto-Filled)"
                        value={loadingCityName ? 'Fetching...' : cityDisplayName}
                        mode="outlined"
                        editable={false}
                        style={[styles.input, styles.readOnlyInput]}
                        left={<TextInput.Icon icon={() => <Feather name="home" size={20} color="#777" />} />}
                        right={loadingCityName ? <TextInput.Icon icon={() => <ActivityIndicator size="small" />} /> : null}
                    />

                    <TextInput
                        label="Customer Location (Lat, Long)"
                        value={locationLoading ? 'Fetching Location...' : (latitude ? `${latitude.toFixed(6)}, ${longitude?.toFixed(6)}` : 'Location not captured')}
                        mode="outlined"
                        editable={false}
                        style={[styles.input, styles.readOnlyInput]}
                        left={<TextInput.Icon icon={() => <Feather name="map-pin" size={20} color="#70ac3b" />} />}
                        right={
                            locationLoading ? (
                                <TextInput.Icon icon={() => <ActivityIndicator size="small" color="#70ac3b" />} />
                            ) : (
                                <TextInput.Icon icon="refresh" onPress={getLocation} color="#70ac3b" />
                            )
                        }
                    />

                    <TextInput
                        label="Bags Potential"
                        value={bagsPotential}
                        onChangeText={setBagsPotential}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="e.g. 500"
                        left={<TextInput.Icon icon={() => <Feather name="package" size={20} color="#777" />} />}
                    />



                    <Button
                        mode="contained"
                        onPress={handleSaveCustomer}
                        style={styles.saveButton}
                        loading={loading}
                        disabled={loading}
                        contentStyle={styles.saveButtonContent}
                    >
                        {loading ? 'Saving...' : 'Save Customer'}
                    </Button>

                    <Button
                        mode="text"
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                        textColor="#666"
                    >
                        Cancel
                    </Button>
                </ScrollView>
            </SafeAreaView>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingVertical: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerText: {
        fontWeight: 'bold',
        color: '#70ac3b',
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    input: {
        marginBottom: 16,
        backgroundColor: '#fff',
    },
    readOnlyInput: {
        backgroundColor: '#f5f5f5',
    },
    dropdownWrapper: {
        marginBottom: 20,
        marginTop: 5,
    },
    saveButton: {
        marginTop: 10,
        borderRadius: 8,
        paddingVertical: 4,
    },
    saveButtonContent: {
        height: 48,
    },
    backButton: {
        marginTop: 12,
    },
});