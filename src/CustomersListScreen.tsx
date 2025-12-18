import React, { useEffect, useState } from 'react';
import { 
    View, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    Alert, 
    PermissionsAndroid, 
    Platform, 
    SafeAreaView, // 🛑 Added for professional layout
    StatusBar 
} from 'react-native';
import { Text, TextInput, Provider as PaperProvider, MD3LightTheme as DefaultTheme, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import Geolocation from 'react-native-geolocation-service';

// ✅ Working Icon Library
import Feather from 'react-native-vector-icons/Feather';

const BASE_URL = "http://38.242.201.229";

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#70ac3b',
        onPrimary: '#ffffff',
    },
};

export default function CustomerListScreen() {
    const { token } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [visitLoading, setVisitLoading] = useState(false);
    const [visitStatus, setVisitStatus] = useState<Record<number, number>>({});

    useEffect(() => {
        const loadVisitFlags = async () => {
            try {
                const flags = await AsyncStorage.getItem("@VisitFlags");
                if (flags) {
                    const parsedFlags = JSON.parse(flags);
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
    }, []);

    useEffect(() => {
        if (token) {
            fetchCustomers();
        }
    }, [token]);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/api/customers/by-city`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCustomers(response.data.customers); 
        } catch (error) {
            Alert.alert("Error", "Failed to load customer list.");
        } finally {
            setLoading(false);
        }
    };

    const requestLocationPermission = async () => {
        if (Platform.OS === 'ios') {
            const auth = await Geolocation.requestAuthorization("whenInUse");
            return auth === "granted";
        }
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return false;
    };

    const handleVisit = async (customer_id: number) => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            Alert.alert("Permission Denied", "Location permission is required.");
            return;
        }

        setVisitLoading(true);

        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const payload = {
                        customer_id,
                        latitude,
                        longitude,
                        purpose: "Visit",
                        date: new Date().toISOString().split("T")[0],
                        remarks: "Visit logged from mobile app.",
                    };

                    await axios.post(
                        `${BASE_URL}/api/visits/create-visit`,
                        payload,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    Alert.alert("Success", "Visit marked successfully!");
                    const updatedFlags = { ...visitStatus, [customer_id]: Date.now() };
                    setVisitStatus(updatedFlags);
                    await AsyncStorage.setItem("@VisitFlags", JSON.stringify(updatedFlags));
                } catch (apiError) {
                    Alert.alert("Error", "Server error marking visit.");
                } finally {
                    setVisitLoading(false);
                }
            },
            (error) => {
                setVisitLoading(false);
                Alert.alert("Location Error", "GPS signal slow or off.");
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    const isVisitedRecently = (customer_id: number) => {
        const lastTime = visitStatus[customer_id];
        if (!lastTime) return false;
        const hoursPassed = (Date.now() - lastTime) / (1000 * 60 * 60);
        return hoursPassed < 24;
    };

    const filteredCustomers = customers.filter((item: any) =>
        item.customer_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <PaperProvider theme={theme}>
            {/* 🛑 SafeAreaView prevents content from hiding under status bar/notch */}
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#f4f4f4" />
                
                <View style={styles.container}>
                    {/* Header Title with proper top margin */}
                    <View style={styles.headerContainer}>
                        <Text variant="headlineSmall" style={styles.headerText}>
                           Customer List
                        </Text>
                    </View>

                    {/* Search Box with Feather Icon */}
                    <TextInput
                        placeholder="Search by name..."
                        value={search}
                        onChangeText={setSearch}
                        mode="outlined"
                        outlineColor="#ddd"
                        activeOutlineColor={theme.colors.primary}
                        style={styles.searchBox}
                        // 🛑 Feather Search Icon
                        left={<TextInput.Icon icon={() => <Feather name="search" size={20} color="#777" />} />}
                    />

                    {loading ? (
                        <ActivityIndicator animating={true} color={theme.colors.primary} size="large" style={{ marginTop: 50 }} />
                    ) : (
                        <FlatList
                            data={filteredCustomers}
                            keyExtractor={(item: any) => item.id.toString()}
                            onRefresh={fetchCustomers}
                            refreshing={loading}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={<Text style={styles.emptyText}>No customers found.</Text>}
                            renderItem={({ item }) => (
                                <View style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <Text style={styles.name}>{item.customer_name}</Text>
                                        <Text style={styles.badge}>{item.type}</Text> 
                                    </View>
                                    
                                    <View style={styles.detailRow}>
                                        <Feather name="phone" size={14} color="#666" style={{marginRight: 5}} />
                                        <Text style={styles.details}>{item.contact}</Text>
                                    </View>
                                    
                                    <View style={styles.detailRow}>
                                        <Feather name="map-pin" size={14} color="#666" style={{marginRight: 5}} />
                                        <Text style={styles.details}>{item.area}, {item.tehsil}</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={[
                                            styles.visitBtn,
                                            isVisitedRecently(item.id) ? styles.btnVisited : styles.btnVisit,
                                            visitLoading && { opacity: 0.7 }
                                        ]}
                                        onPress={() => !visitLoading && handleVisit(item.id)}
                                        disabled={visitLoading}
                                    >
                                        <Text style={styles.visitBtnText}>
                                            {isVisitedRecently(item.id) ? "✅ Visited Today" : "Mark Visit"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    )}
                </View>
            </SafeAreaView>
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f4f4f4',
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    headerContainer: {
        paddingVertical: 15,
        marginTop: Platform.OS === 'android' ? 10 : 0,
        alignItems: 'center',
    },
    headerText: {
        fontWeight: 'bold',
        color: '#70ac3b',
        letterSpacing: 0.5,
    },
    searchBox: {
        marginBottom: 10,
        backgroundColor: '#fff',
        height: 50,
    },
    listContent: {
        paddingTop: 10,
        paddingBottom: 30,
    },
    card: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    name: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#222',
        flex: 1,
    },
    badge: {
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 11,
        color: '#70ac3b',
        fontWeight: 'bold',
        overflow: 'hidden',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    details: {
        color: "#555",
        fontSize: 14,
    },
    visitBtn: {
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 12,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    btnVisit: {
        backgroundColor: "#4072fdff",
    },
    btnVisited: {
        backgroundColor: "#28a745",
    },
    visitBtnText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 15,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 30,
        color: '#999',
    }
});