import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
    Platform,
    SafeAreaView,
    StatusBar,
    PermissionsAndroid,
    TouchableOpacity
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';

// 🛑 Translation Hook Import
import { useTranslation } from 'react-i18next';

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

    // 🛑 Translation Initialize
    const { t } = useTranslation();

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
    const [district, setDistrict] = useState('');
    const [division, setDivision] = useState('');
    const [province, setProvince] = useState('');
    const [region, setRegion] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(false);


    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [locationLoading, setLocationLoading] = useState(false);

    const [address, setAddress] = useState(''); // Display ke liye


    const getLocation = async () => {
        setLocationLoading(true);

        // Android Permission Check
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                Alert.alert(t('error'), t('location_err'));
                setLocationLoading(false);
                return;
            }
        }

        // Get Current Position
        Geolocation.getCurrentPosition(
            async (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);



                // Reverse Geocoding (Lat/Lng se Address nikalna)
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.coords.latitude}&lon=${position.coords.longitude}`,
                        {
                            headers: {
                                'User-Agent': 'FSPL' // Apni app ka naam likh dein
                            }
                        }
                    );
                    const data = await response.json();
                    // Chota address dikhane ke liye (e.g., "Street 5, Faisalabad")
                    const shortAddress = data.display_name;
                    setAddress(shortAddress);
                } catch (error) {
                    setAddress(``); // Error par coords dikha dein
                }


                setLocationLoading(false);
            },
            (error) => {
                console.log(error.code, error.message);
                Alert.alert(t('error'), t('gps_error'));
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
        if (!customerName || !contact || !area || !tehsil || !customerType || !region) {
            Alert.alert(t('error'), t('incomplete_data'));
            return false;
        }


        // New Check: Location capture hui ya nahi
        if (latitude === null || longitude === null) {
            Alert.alert(t('error'), t('location_required'));
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
                district: district,
                division: division,
                province: province,
                region: region,
                latitude: latitude,
                longitude: longitude,
            };

            await axios.post(`${API_URL}/api/customers/create-customer`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            Alert.alert(t('success'), t('save_customer'));

            setArea('');
            setBagsPotential('');
            setContact('');
            setCustomerName('');
            setCustomerType('');
            setTehsil('');
            setLatitude(null); // Clear lat
            setLongitude(null); // Clear long
            getLocation(); // Re-fetch location
            setDistrict('');
            setDivision('');
            setProvince('');
            setRegion(undefined)

            setTimeout(() => {
                setLoading(false);
                navigation.navigate('Visits');
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

                {/* Header Section - Thora compact */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Feather name="arrow-left" size={24} color="#70ac3b" />
                    </TouchableOpacity>
                    <Text variant="titleLarge" style={styles.headerText}>
                        {t('add_cust_header')}
                    </Text>
                </View>

                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Compact Dropdown Wrapper */}
                    <View style={styles.dropdownSection}>
                        <Dropdown
                            label={t('cust_type')}
                            value={customerType}
                            onSelect={setCustomerType}
                            options={[
                                { label: 'Farmer', value: 'Farmer' },
                                { label: 'Dealer', value: 'Dealer' },
                            ]}
                            mode="outlined"
                        />
                    </View>

                    {/* Inputs - Thora Margin kam kiya hai */}
                    <View style={styles.inputSection}>
                        <TextInput
                            label={t('cust_name')}
                            value={customerName}
                            onChangeText={setCustomerName}
                            mode="outlined"
                            dense // 🛑 Taake height kam ho jaye
                            style={styles.input}
                            placeholder="e.g., Amir Dogar"
                            left={<TextInput.Icon icon={() => <Feather name="user" size={18} color="#777" />} />}
                        />

                        <TextInput
                            label={t('contact')}
                            value={contact}
                            onChangeText={setContact}
                            mode="outlined"
                            dense
                            style={styles.input}
                            keyboardType="phone-pad"
                            maxLength={11}
                            left={<TextInput.Icon icon={() => <Feather name="phone" size={18} color="#777" />} />}
                        />

                        <TextInput
                            label={t('address')}
                            value={area}
                            onChangeText={setArea}
                            mode="outlined"
                            dense
                            style={styles.input}
                            left={<TextInput.Icon icon={() => <Feather name="map" size={18} color="#777" />} />}
                        />

                        <View style={styles.row}>
                            <TextInput
                                label={t('tehsil')}
                                value={tehsil}
                                onChangeText={setTehsil}
                                mode="outlined"
                                dense
                                style={[styles.input, { flex: 1, marginRight: 8 }]}
                            />
                            <TextInput
                                label={t('bags_potential')}
                                value={bagsPotential}
                                onChangeText={setBagsPotential}
                                mode="outlined"
                                dense
                                keyboardType="numeric"
                                style={[styles.input, { flex: 1 }]}
                            />
                        </View>
                        {/* ✅ Naya Section: District aur Division ek row mein */}
                        <View style={styles.row}>
                            <TextInput
                                label={t('district')} // Make sure ye key i18n mein ho, warna "District" likh dein
                                value={district}
                                onChangeText={setDistrict}
                                mode="outlined"
                                dense
                                style={[styles.input, { flex: 1, marginRight: 8 }]}
                            />
                            <TextInput
                                label={t('division')}
                                value={division}
                                onChangeText={setDivision}
                                mode="outlined"
                                dense
                                style={[styles.input, { flex: 1 }]}
                            />
                        </View>

                        {/* ✅ Naya Section: Province single ya Region ke saath row mein */}
                        <View style={styles.row}>
                            <TextInput
                                label={t('province')}
                                value={province}
                                onChangeText={setProvince}
                                mode="outlined"
                                dense
                                style={[styles.input, { flex: 1 }]}
                            />
                        </View>

                        <TextInput
                            label={t('city_auto')}
                            value={loadingCityName ? 'Fetching...' : cityDisplayName}
                            mode="outlined"
                            dense
                            editable={false}
                            style={[styles.input, styles.readOnlyInput]}
                            left={<TextInput.Icon icon={() => <Feather name="home" size={18} color="#777" />} />}
                        />

                        <TextInput
                            label={t('location_info')}
                            value={locationLoading ? 'Fetching GPS...' : (address ? address : 'No GPS Fix')}
                            mode="outlined"
                            dense
                            editable={false}
                            multiline={false}
                            style={[styles.input, styles.readOnlyInput]}
                            left={<TextInput.Icon icon={() => <Feather name="map-pin" size={18} color="#70ac3b" />} />}
                            right={<TextInput.Icon icon="refresh" onPress={getLocation} color="#70ac3b" size={20} />}
                        />



                        <View style={styles.dropdownSection}>
                            <Dropdown
                                label={t('region')}
                                value={region}
                                onSelect={setRegion}
                                options={[
                                    { label: 'Gojra', value: 'Gojra' },
                                    { label: 'Sargodha', value: 'Sargodha' },
                                    { label: 'Jhang', value: 'Jhang' },
                                    { label: 'South', value: 'South' },
                                    { label: 'Rahim Yar Khan', value: 'Rahim Yar Khan' },
                                    { label: 'Layyah', value: 'Layyah' },
                                    { label: 'Sahiwal', value: 'Sahiwal' },
                                    { label: 'Narowal', value: 'Narowal' },
                                    { label: 'Pindi Bhattian', value: 'Pindi Bhattian' },
                                    { label: 'Gujranwala', value: 'Gujranwala' },
                                ]}
                                mode="outlined"
                            />
                        </View>
                    </View>

                    {/* Button Section - Zyada professional placement */}
                    <View style={styles.buttonContainer}>
                        <Button
                            mode="contained"
                            onPress={handleSaveCustomer}
                            style={styles.saveButton}
                            loading={loading}
                            disabled={loading}
                            contentStyle={styles.buttonHeight}
                        >
                            {loading ? t('saving') : t('save_customer')}
                        </Button>

                        <Button
                            mode="outlined" // 🛑 Cancel ko outlined kiya taake alag dikhay
                            onPress={() => navigation.goBack()}
                            style={styles.cancelButton}
                            textColor="#666"
                            contentStyle={styles.buttonHeight}
                        >
                            {t('cancel')}
                        </Button>
                    </View>
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
        flexDirection: 'row',
        paddingVertical: 12,
        alignItems: 'center',
        backgroundColor: '#fff',
        elevation: 2, // Shadow for depth
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        marginTop: 20,
        justifyContent: 'space-between',
    },
    headerText: {
        fontWeight: '700',
        color: '#70ac3b',
        flex: 1, // Text ko center karne ke liye help karega
        textAlign: 'center'
    },
    backButton: {
        padding: 5,
    },
    container: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 30,
    },
    inputSection: {
        marginTop: 5,
    },
    input: {
        marginBottom: 10, // Reduced from 16
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    readOnlyInput: {
        backgroundColor: '#fafafa',
        fontSize: 12, // Address thora chota dikhay
    },
    dropdownSection: {
        marginBottom: 12,
    },
    buttonContainer: {
        marginTop: 10,
    },
    saveButton: {
        borderRadius: 8,
        backgroundColor: '#70ac3b',
    },
    cancelButton: {
        marginTop: 10,
        borderRadius: 8,
        borderColor: '#ccc', // Subdued border
    },
    buttonHeight: {
        height: 48,
    },
});