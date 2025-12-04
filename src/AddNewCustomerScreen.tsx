// imports 
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import {
    Text,
    TextInput,
    Button,
    Provider as PaperProvider,
    MD3LightTheme as DefaultTheme,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// ✅ Correct Import
import { Dropdown } from 'react-native-paper-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Customer } from './models/customerModel';
import { useAuth } from './context/AuthContext';
import axios from 'axios';



type RootStackParamList = {
    Visits: undefined;
    AddNewCustomer: undefined;
    CustomerList: undefined;
    // ... doosri screens
};

const API_URL = "http://38.242.201.229";

type AddCustomerNav = NativeStackNavigationProp<RootStackParamList, 'AddNewCustomer'>;

// Paper Theme
const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#007bff', // Blue color
        onPrimary: '#ffffff',
    },
};


// AsyncStorage key
const CUSTOMERS_STORAGE_KEY = '@Customers';


export default function AddNewCustomerScreen() {
    const { token } = useAuth();
    console.log("Auth Token in AddNewCustomerScreen:", token);


    const navigation = useNavigation<AddCustomerNav>();

    // State Hooks for Form Fields
    const [customerName, setCustomerName] = useState('');
    const [contact, setContact] = useState('');
    const [area, setArea] = useState('');
    const [tehsil, setTehsil] = useState('');
    const [bagsPotential, setBagsPotential] = useState('');

    // Dropdown States (Enabled)
    const [customerType, setCustomerType] = useState<string | undefined>(undefined);
    const [visitStatus, setVisitStatus] = useState<string | undefined>(undefined);

    const [loading, setLoading] = useState(false);


    // Form Validation (Simple)
    const validateForm = () => {
        if (!customerName || !contact || !area || !tehsil || !customerType || !visitStatus) {
            Alert.alert('Error', 'Please fill all required fields.');
            return false;
        }
        // Contact number ki basic validation (example ke liye)
        const contactRegex = /^\d{11}$/;
        if (!contactRegex.test(contact)) {
            Alert.alert('Error', 'Contact number must be 11 digits.');
            return false;
        }
        return true;
    };


    // Customer Data Save Function
    const handleSaveCustomer = async () => {
        if (!validateForm()) return;

        if (!token) {
            Alert.alert('Error', 'User not authenticated. Please log in again.');
            return;
        }





        setLoading(true);

        try {
            // 1. New Customer Object banana
            const payload = {
                customer_name: customerName.trim(),
                contact: contact.trim(),
                area: area.trim(),
                tehsil: tehsil.trim(),
                bags_potential: 0,    // agar future me input chahiye ho toh field bana lena
                type: customerType === "Farmer" ? "Farmer" : "Dealer",
            };

            // ✅ Console Log: Naye Customer ka Data show karega
            console.log("--- New Customer Data to Save ---");
            console.log("Sending payload:", payload);
            console.log("----------------------------------");


            // // 2. Existing Customers ko AsyncStorage se nikalna
            // const existingData = await AsyncStorage.getItem(CUSTOMERS_STORAGE_KEY);
            // let customers: Customer[] = existingData ? JSON.parse(existingData) : [];

            // // 3. New Customer ko array mein shamil karna
            // customers.push(newCustomer);


            // 4. Update kiye gaye array ko wapis AsyncStorage mein save karna
            await AsyncStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(payload));

            // Success message
            // Alert.alert('Success', 'Customer added successfully! Moving to list...');


            // 🌟 API CALL TO SAVE CUSTOMER ON SERVER

            try {

                const response = await axios.post(`${API_URL}/api/customers/create-customer`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log("📥 Response Data:", response.data);

                Alert.alert('Success', 'Customer added successfully! Moving to list...');
                // 🌟 2 SECOND KA DELAY AUR NAVIGATION LOGIC
                setTimeout(() => {
                    setLoading(false);
                    // ✅ Customer List screen par move karein
                    navigation.navigate('CustomerList');
                }, 2000); // 2000 milliseconds = 2 seconds


                setCustomerName('');
                setContact('');
                setArea('');
                setTehsil('');
                setBagsPotential('');
                setCustomerType(undefined);
                setVisitStatus(undefined);



            } catch (error) {
                console.error('API Error:', error);
                Alert.alert('Error', 'Failed to save customer data to server.');
                setLoading(false);

            }



        } catch (error) {
            console.error('Error saving customer:', error);
            Alert.alert('Error', 'Failed to save customer data.');
        }
        // Note: finally block hata diya gaya hai kyunki setLoading(false) 
        // timeout aur catch dono mein use ho raha hai.
    };


    return (
        <PaperProvider theme={theme}>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <Text variant="headlineMedium" style={styles.headerText}>
                    ➕ Add New Customer
                </Text>
                
                <TextInput
                    label="Customer Name"
                    value={customerName}
                    onChangeText={setCustomerName}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Amir Dogar"
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
                />
                <TextInput
                    label="Area"
                    value={area}
                    onChangeText={setArea}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Jhipal 73 chak"
                />
                <TextInput
                    label="Tehsil"
                    value={tehsil}
                    onChangeText={setTehsil}
                    mode="outlined"
                    style={styles.input}
                    placeholder="e.g., Faisalabad"
                />

                <TextInput
                    label="Bags Potential"
                    value={bagsPotential}
                    onChangeText={setBagsPotential}
                    mode="outlined"
                    style={styles.input}
                    keyboardType="numeric"
                />

                
                <View style={[styles.dropdownContainer, { zIndex: 11 }]}>
                    <Dropdown
                        label="Customer Type"
                        value={customerType}
                        onSelect={setCustomerType}
                        options={[
                            { label: 'Farmer', value: 'Farmer' },
                            { label: 'Dealer', value: 'Dealer' },
                        ]}
                    />
                </View>

               
                <View style={[styles.dropdownContainer, { zIndex: 10 }]}>

                    <Dropdown
                        label="Visit Status"
                        value={visitStatus}
                        onSelect={(val) => val && setVisitStatus(val)}
                        options={[
                            { label: 'Visit', value: 'visit' },
                            { label: 'Mature', value: 'mature' },
                        ]}
                    />
                </View>

              
                <Button
                    mode="contained"
                    onPress={handleSaveCustomer}
                    style={styles.saveButton}
                    loading={loading}
                    disabled={loading}
                    contentStyle={styles.saveButtonContent}
                >
                    {loading ? 'Saving Data...' : 'Save Customer'}
                </Button>

                <Button
                    mode="text"
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    disabled={loading}
                >
                    Cancel
                </Button>

            </ScrollView>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        padding: 20,
    },
    headerText: {
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#28a745',
        textAlign: 'center',
    },
    input: {
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    dropdownContainer: {
        marginBottom: 15,
        ...(Platform.OS === 'android' && { zIndex: 10 }),
    },
    dropdown: {
        // Dropdown list ke liye style
    },
    saveButton: {
        marginTop: 20,
        backgroundColor: '#28a745',
        borderRadius: 8,
    },
    saveButtonContent: {
        paddingVertical: 8,
    },
    backButton: {
        marginTop: 10,
    }
});