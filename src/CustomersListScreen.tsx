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
import { Text, TextInput, Provider as PaperProvider, MD3LightTheme as DefaultTheme, ActivityIndicator, Modal, Portal, RadioButton, Button as PaperButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import Geolocation from 'react-native-geolocation-service';
import { useNavigation } from '@react-navigation/native';

// 🛑 1. Translation Import
import { useTranslation } from 'react-i18next';

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
    const navigation = useNavigation();
    // 🛑 2. Hook Initialize
    const { t } = useTranslation();


    const [customers, setCustomers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [visitLoading, setVisitLoading] = useState(false);
    const [visitStatus, setVisitStatus] = useState<Record<number, number>>({});


    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedPurpose, setSelectedPurpose] = useState('New'); // Default: New
    const [activeCustomerId, setActiveCustomerId] = useState<number | null>(null);

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
            const response = await axios.get(`${BASE_URL}/api/customers/team-customers`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCustomers(response.data);
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


    // 🛑 Step 1: Pehle sirf Modal dikhayen
    const openVisitModal = (customer_id: number) => {
        setActiveCustomerId(customer_id);
        setIsModalVisible(true);
    };

    // const handleVisit = async (customer_id: number) => {
    //     const hasPermission = await requestLocationPermission();
    //     if (!hasPermission) {
    //         Alert.alert("Permission Denied", "Location permission is required.");
    //         return;
    //     }

    //     setVisitLoading(true);

    //     Geolocation.getCurrentPosition(
    //         async (position) => {
    //             const { latitude, longitude } = position.coords;
    //             try {
    //                 const payload = {
    //                     customer_id,
    //                     latitude,
    //                     longitude,
    //                     purpose: "Visit",
    //                     date: new Date().toISOString().split("T")[0],
    //                     remarks: "Visit logged from mobile app.",
    //                 };

    //                 await axios.post(
    //                     `${BASE_URL}/api/visits/create-visit`,
    //                     payload,
    //                     { headers: { Authorization: `Bearer ${token}` } }
    //                 );

    //                 Alert.alert("Success", "Visit marked successfully!");
    //                 const updatedFlags = { ...visitStatus, [customer_id]: Date.now() };
    //                 setVisitStatus(updatedFlags);
    //                 await AsyncStorage.setItem("@VisitFlags", JSON.stringify(updatedFlags));
    //             } catch (apiError) {
    //                 Alert.alert("Error", "Server error marking visit.");
    //             } finally {
    //                 setVisitLoading(false);
    //             }
    //         },
    //         (error) => {
    //             setVisitLoading(false);
    //             Alert.alert("Location Error", "GPS signal slow or off.");
    //         },
    //         { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    //     );
    // };


    // 🛑 Step 2: Confirmation ke baad asal API call
    const confirmAndMarkVisit = async () => {
        if (activeCustomerId === null) return;

        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            Alert.alert(t('error'), t('location_err'));
            return;
        }

        setIsModalVisible(false); // Modal band kar dein
        setVisitLoading(true);

        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const payload = {
                        customer_id: activeCustomerId,
                        latitude,
                        longitude,
                        purpose: selectedPurpose, // 🛑 Payload mein selected value (New/Old/Mature) ja rahi hai
                        date: new Date().toISOString().split("T")[0],
                        remarks: `${t('success')}, ${t('mark_visit')} ${selectedPurpose}.`,
                    };


                    console.log("payload ........ ", payload)

                    await axios.post(
                        `${BASE_URL}/api/visits/create-visit`,
                        payload,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );

                    Alert.alert("Success", `Visit marked as ${selectedPurpose}!`);
                    const updatedFlags = { ...visitStatus, [activeCustomerId]: Date.now() };
                    setVisitStatus(updatedFlags);
                    await AsyncStorage.setItem("@VisitFlags", JSON.stringify(updatedFlags));
                } catch (apiError) {
                    Alert.alert(t('error'), t('error'));
                } finally {
                    setVisitLoading(false);
                    setActiveCustomerId(null);
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

    // 1. Aaj ki raat (12:00 AM) ka time nikalna
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); 

    // 2. Check: Kya visit aaj ki raat 12 baje ke baad hui hai?
    // Agar visit kal raat 11:59 par bhi hui hogi, tab bhi ye aaj 12:00 AM par reset ho jayega.
    return lastTime >= startOfToday.getTime();
};

    const filteredCustomers = customers.filter((item: any) =>
        item.customer_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <PaperProvider theme={theme}>
            {/* 🛑 SafeAreaView prevents content from hiding under status bar/notch */}
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="#f4f4f4" />


                {/* 🛑 Portal ke andar Modal design kiya gaya hai */}
                <Portal>
                    <Modal
                        visible={isModalVisible}
                        onDismiss={() => setIsModalVisible(false)}
                        contentContainerStyle={styles.modalContent}
                    >
                        <Text style={styles.modalTitle}>{t('select_purpose')}</Text>

                        {/* 🛑 Radio Button Group Logic */}
                        <RadioButton.Group onValueChange={newValue => setSelectedPurpose(newValue)} value={selectedPurpose}>
                            <View style={styles.radioRow}>
                                <RadioButton value="New" color={theme.colors.primary} />
                                <Text>{t('purpose_new')}</Text>
                            </View>
                            <View style={styles.radioRow}>
                                <RadioButton value="Old" color={theme.colors.primary} />
                                <Text>{t('purpose_old')}</Text>
                            </View>
                            <View style={styles.radioRow}>
                                <RadioButton value="Mature" color={theme.colors.primary} />
                                <Text>{t('purpose_mature')}</Text>
                            </View>
                        </RadioButton.Group>

                        <View style={styles.modalActions}>
                            <PaperButton onPress={() => setIsModalVisible(false)}>{t('cancel')}</PaperButton>
                            <PaperButton mode="contained" onPress={confirmAndMarkVisit}>{t('confirm')}</PaperButton>
                        </View>
                    </Modal>
                </Portal>

                <View style={styles.container}>
                    {/* Header Title with proper top margin */}
                    <View style={styles.headerContainer}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}
                        >
                            <Feather name="arrow-left" size={24} color="#70ac3b" />
                        </TouchableOpacity>
                        <Text variant="headlineSmall" style={styles.headerText}>
                            {t('cust_list_header')}
                        </Text>
                    </View>

                    {/* Search Box with Feather Icon */}
                    <TextInput
                        placeholder={t('search_placeholder')}
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
                                        <Feather name="phone" size={14} color="#666" style={{ marginRight: 5 }} />
                                        <Text style={styles.details}>{item.contact}</Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Feather name="map-pin" size={14} color="#666" style={{ marginRight: 5 }} />
                                        <Text style={styles.details}>{item.area}, {item.tehsil}</Text>
                                    </View>

                                    <TouchableOpacity
                                        style={[
                                            styles.visitBtn,
                                            isVisitedRecently(item.id) ? styles.btnVisited : styles.btnVisit,
                                            visitLoading && { opacity: 0.7 }
                                        ]}
                                        // 🛑 Button press par ab Modal khulega
                                        onPress={() => !visitLoading && !isVisitedRecently(item.id) && openVisitModal(item.id)}
                                        disabled={visitLoading || isVisitedRecently(item.id)}
                                    >
                                        <Text style={styles.visitBtnText}>
                                            {isVisitedRecently(item.id) ? t('visited_today') : t('mark_visit')}
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

// const styles = StyleSheet.create({
//     safeArea: {
//         flex: 1,
//         backgroundColor: '#f4f4f4',
//     },
//     container: {
//         flex: 1,
//         paddingHorizontal: 16,
//     },
//     headerContainer: {
//         paddingVertical: 15,
//         marginTop: Platform.OS === 'android' ? 10 : 0,
//         alignItems: 'center',
//     },
//     headerText: {
//         fontWeight: 'bold',
//         color: '#70ac3b',
//         letterSpacing: 0.5,
//     },
//     searchBox: {
//         marginBottom: 10,
//         backgroundColor: '#fff',
//         height: 50,
//     },
//     listContent: {
//         paddingTop: 10,
//         paddingBottom: 30,
//     },
//     card: {
//         backgroundColor: "#fff",
//         padding: 16,
//         borderRadius: 12,
//         marginBottom: 12,
//         elevation: 2,
//         shadowColor: "#000",
//         shadowOffset: { width: 0, height: 1 },
//         shadowOpacity: 0.1,
//         shadowRadius: 3,
//     },
//     cardHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'flex-start',
//         marginBottom: 8,
//     },
//     name: {
//         fontSize: 17,
//         fontWeight: 'bold',
//         color: '#222',
//         flex: 1,
//     },
//     badge: {
//         backgroundColor: '#f0f0f0',
//         paddingHorizontal: 8,
//         paddingVertical: 2,
//         borderRadius: 4,
//         fontSize: 11,
//         color: '#70ac3b',
//         fontWeight: 'bold',
//         overflow: 'hidden',
//     },
//     detailRow: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         marginBottom: 4,
//     },
//     details: {
//         color: "#555",
//         fontSize: 14,
//     },
//     visitBtn: {
//         paddingVertical: 12,
//         borderRadius: 8,
//         marginTop: 12,
//         alignItems: 'center',
//         flexDirection: 'row',
//         justifyContent: 'center',
//     },
//     btnVisit: {
//         backgroundColor: "#4072fdff",
//     },
//     btnVisited: {
//         backgroundColor: "#28a745",
//     },
//     visitBtnText: {
//         color: "#fff",
//         fontWeight: "bold",
//         fontSize: 15,
//     },
//     emptyText: {
//         textAlign: 'center',
//         marginTop: 30,
//         color: '#999',
//     }
// });



const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f4f4f4' },
    container: { flex: 1, paddingHorizontal: 16 },
    headerContainer: {flexDirection: 'row', paddingVertical: 15, marginTop: Platform.OS === 'android' ? 10 : 0, alignItems: 'center', justifyContent: 'space-between', },
    headerText: { fontWeight: 'bold', color: '#70ac3b' , flex:1, textAlign: 'center', marginRight: 24 },
    backButton: {
        padding: 5,
    },
    searchBox: { marginBottom: 10, backgroundColor: '#fff', height: 50 },
    listContent: { paddingTop: 10, paddingBottom: 30 },
    card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    name: { fontSize: 17, fontWeight: 'bold', color: '#222', flex: 1 },
    badge: { backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 11, color: '#70ac3b', fontWeight: 'bold' },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    details: { color: "#555", fontSize: 14 },
    visitBtn: { paddingVertical: 12, borderRadius: 8, marginTop: 12, alignItems: 'center', justifyContent: 'center' },
    btnVisit: { backgroundColor: "#3b83acff" }, // 🛑 Button color green set kiya
    btnVisited: { backgroundColor: "#28a745" }, // 🛑 Already visited ka dark green
    visitBtnText: { color: "#fff", fontWeight: "bold", fontSize: 15 },
    // 🛑 Modal Styles
    modalContent: { backgroundColor: 'white', padding: 25, margin: 20, borderRadius: 15 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#70ac3b', marginBottom: 20, textAlign: 'center' },
    radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }
});