import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert, PermissionsAndroid, Platform } from 'react-native';
import { Text, TextInput, Provider as PaperProvider, MD3LightTheme as DefaultTheme, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
// ✅ CLI Geolocation Import
import Geolocation from 'react-native-geolocation-service';

// Context (Make sure path is correct)
// import { useAuth } from './context/AuthContext'; 
// Agar context file alag hai to path check karlena, abhi main dummy token use kr rha hu agar context nahi hai to.

const BASE_URL = "http://38.242.201.229";

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#007bff',
        onPrimary: '#ffffff',
    },
};

export default function CustomerListScreen() {
    // const { token } = useAuth(); // Agar AuthContext bana hua hai to uncomment karein
     const {token } = useAuth()// Token state

    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [visitLoading, setVisitLoading] = useState(false); // Visit saving indicator
    const [visitStatus, setVisitStatus] = useState<Record<number, number>>({}); // Stores timestamp

    // 📌 Load Visit Flags (Local Status)
    useEffect(() => {
        const loadVisitFlags = async () => {
            try {
                const flags = await AsyncStorage.getItem("@VisitFlags");
                if (flags) {
                    const parsedFlags = JSON.parse(flags);
                    // ✅ FIX: String keys ko number keys mein convert karein
                    const fixedFlags = Object.keys(parsedFlags).reduce((acc, key) => {
                        acc[parseInt(key)] = parsedFlags[key];
                        return acc;
                    }, {} as Record<number, number>);
                    setVisitStatus(fixedFlags);
                }
            } catch (e) {
                console.error("Error loading visit flags:", e);
            }
        };
        loadVisitFlags();
    }, []); // Dependency array empty rakheinge

    // 📌 Load Customers jab Token mil jaye
    useEffect(() => {
        if (token) {
            fetchCustomers();
        }
    }, [token]);

    // 📌 Save Visit Flags Helper
    const saveVisitFlags = async (flags: any) => {
        await AsyncStorage.setItem("@VisitFlags", JSON.stringify(flags));
    };

    // 📌 Fetch Customers API
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/api/customers/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // API response structure check karein. Agar { customers: [...] } hai to:
            setCustomers(response.data.customers || response.data); 
        } catch (error) {
            console.log("Error fetching customers:", error);
            Alert.alert("Error", "Failed to load customer list.");
        } finally {
            setLoading(false);
        }
    };

    // 📌 Permission Request Function (Android Only)
    const requestLocationPermission = async () => {
        if (Platform.OS === 'ios') {
            const auth = await Geolocation.requestAuthorization("whenInUse");
            return auth === "granted";
        }

        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Location Permission",
                    message: "App needs access to your location to mark visits.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return false;
    };

    // 🔥 Visit Handler (CLI Logic)
    const handleVisit = async (customer_id: number) => {
        // 1. Check Permission
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            Alert.alert("Permission Denied", "Location permission is required to mark a visit.");
            return;
        }

        setVisitLoading(true);

        // 2. Get Current Position
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log("Location Fetched:", latitude, longitude);

                // 3. API Call inside Success Callback
                try {
                    const payload = {
                        customer_id,
                        latitude,
                        longitude,
                        purpose: "Visit",
                        date: new Date().toISOString().split("T")[0],
                        remarks: "Visit logged from mobile app.",
                    };

                    console.log("Sending Payload:", payload);

                    const response = await axios.post(
                        `${BASE_URL}/api/visits/create-visit`,
                        payload,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );

                    console.log("Visit Created:", response.data);

                    Alert.alert("Success", "Visit created successfully!");

                    // 4. Mark Green Locally
                    const updatedFlags = { ...visitStatus, [customer_id]: Date.now() };
                    setVisitStatus(updatedFlags);
                    saveVisitFlags(updatedFlags);

                } catch (apiError: any) {
                    console.log("API Error:", apiError);
                    Alert.alert("Error", "Failed to create visit on server.");
                } finally {
                    setVisitLoading(false);
                }
            },
            (error) => {
                // Location Error
                console.log("Location Error:", error);
                setVisitLoading(false);
                Alert.alert("Location Error", "Could not fetch location. Please ensure GPS is on.");
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    // 🔥 24 HOURS CHECK LOGIC
    const isVisitedRecently = (customer_id: number) => {
        const lastTime = visitStatus[customer_id];
        if (!lastTime) return false;

        const hoursPassed = (Date.now() - lastTime) / (1000 * 60 * 60);
        return hoursPassed < 24; // Returns true if visited within last 24 hours
    };

    // 🔎 Search Filter
    const filteredCustomers = customers.filter((item: any) =>
        item.customer_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <PaperProvider theme={theme}>
            <View style={styles.container}>
                <Text variant="headlineMedium" style={styles.headerText}>
                    📋 Customer List
                </Text>

                <TextInput
                    label="Search Customer"
                    value={search}
                    onChangeText={setSearch}
                    mode="outlined"
                    style={styles.searchBox}
                    left={<TextInput.Icon icon="magnify" />}
                />

                {loading ? (
                    <ActivityIndicator animating={true} color={theme.colors.primary} size="large" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={filteredCustomers}
                        keyExtractor={(item: any) => item.id.toString()}
                        refreshing={loading}
                        onRefresh={fetchCustomers}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No customers found.</Text>}
                        renderItem={({ item }) => (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.name}>{item.customer_name}</Text>
                                    <Text style={styles.badge}>{item.type}</Text> 
                                </View>
                                
                                <Text style={styles.details}>📞 {item.contact}</Text>
                                <Text style={styles.details}>📍 {item.area}, {item.tehsil}</Text>

                                <TouchableOpacity
                                    style={[
                                        styles.visitBtn,
                                        isVisitedRecently(item.id) ? styles.btnVisited : styles.btnVisit,
                                        visitLoading && { opacity: 0.5 } // Disable visual if processing
                                    ]}
                                    onPress={() => !visitLoading && handleVisit(item.id)}
                                    disabled={visitLoading}
                                >
                                    <Text style={styles.visitBtnText}>
                                        {isVisitedRecently(item.id) ? "✅ Visited Today" : "📍 Mark Visit"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                )}
            </View>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f4f4f4',
    },
    headerText: {
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#007bff',
    },
    searchBox: {
        marginBottom: 15,
        backgroundColor: '#fff',
    },
    card: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 3, // Android shadow
        shadowColor: "#000", // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    badge: {
        backgroundColor: '#e0e0e0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 12,
        color: '#555',
    },
    details: {
        color: "#666",
        fontSize: 14,
        marginBottom: 2,
    },
    visitBtn: {
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 12,
        alignItems: 'center',
    },
    btnVisit: {
        backgroundColor: "#007bff",
    },
    btnVisited: {
        backgroundColor: "#28a745", // Green
    },
    visitBtnText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});