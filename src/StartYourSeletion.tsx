import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://38.242.201.229/api/startday";

export default function StartYourSelection() {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [isActionDone, setIsActionDone] = useState(false);
    const [markedType, setMarkedType] = useState<string | null>(null);

    useFocusEffect(
        React.useCallback(() => {
            const checkStatus = async () => {
                const savedToken = await AsyncStorage.getItem("token");
                setToken(savedToken);

                const lastDate = await AsyncStorage.getItem("last_submission_date");
                const savedType = await AsyncStorage.getItem("submission_type");
                const today = new Date().toLocaleDateString();

                // 🛑 Yahan check karein ke date aaj ki hai ya nahi
                if (lastDate === today) {
                    setIsActionDone(true);
                    setMarkedType(savedType);
                } else {
                    // Agar date purani hai toh reset karein (Naye din ke liye)
                    setIsActionDone(false);
                    setMarkedType(null);
                }
            };
            checkStatus();
        }, [])
    );

    const markSuccessInStorage = async (selectedType: 'work' | 'leave') => {
        const today = new Date().toLocaleDateString();
        await AsyncStorage.setItem("last_submission_date", today);
        await AsyncStorage.setItem("submission_type", selectedType);
        setIsActionDone(true);
        setMarkedType(selectedType);
    };

    const submitLeaveAPI = async () => {
        setLoading(true);
        try {
            const payloadData = { isLeave: true, meterReadings: null, location: null };
            const formData = new FormData();
            formData.append("data", JSON.stringify(payloadData));

            await axios.post(API_URL, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
            });

            await markSuccessInStorage('leave'); 
            Alert.alert(t('success'), "Leave marked for today!");
            navigation.replace("Main");
        } catch (error) {
            Alert.alert("Error", "Failed to mark leave.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.mainTitle}>{t('select_option')}</Text>

                {/* Start Day Button */}
                <TouchableOpacity 
                    style={[styles.button, isActionDone && styles.disabledButton]}
                    onPress={() => !isActionDone && navigation.navigate('StartDay')}
                    disabled={isActionDone}
                >
                    <Ionicons name="speedometer-outline" size={28} color={isActionDone ? "#999" : "#70ac3b"} style={styles.icon} />
                    <Text style={[styles.buttonText, isActionDone && styles.disabledText]}>
                        {isActionDone && markedType === 'work' ? "Already Marked" : t('start_day')}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.orText}>OR</Text>

                {/* Take Leave Button */}
                <TouchableOpacity 
                    style={[styles.button, isActionDone && styles.disabledButton]}
                    onPress={() => !isActionDone && Alert.alert("Confirm", "Mark leave?", [{text: "No"}, {text: "Yes", onPress: submitLeaveAPI}])}
                    disabled={isActionDone}
                >
                    <Ionicons name="calendar-outline" size={28} color={isActionDone ? "#999" : "#70ac3b"} style={styles.icon} />
                    <Text style={[styles.buttonText, isActionDone && styles.disabledText]}>
                        {isActionDone && markedType === 'leave' ? "Already Marked" : t('take_leave')}
                    </Text>
                </TouchableOpacity>

                {isActionDone && (
                    <Text style={styles.infoText}>
                        {markedType === 'work' ? "You have started your day." : "You are on leave today."}
                    </Text>
                )}

                <TouchableOpacity style={styles.goBack} onPress={() => navigation.goBack()}>
                    <Text style={styles.goBackText}>{t('go_back')}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    content: { flex: 1, paddingHorizontal: 30, justifyContent: 'center', alignItems: 'center' },
    mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#70ac3b', marginBottom: 50 },
    button: {
        flexDirection: 'row',
        backgroundColor: '#dcedc8',
        width: '100%',
        paddingVertical: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#c5e1a5',
    },
    disabledButton: {
        backgroundColor: '#f0f0f0',
        borderColor: '#ddd',
    },
    disabledText: {
        color: '#999',
    },
    icon: { marginRight: 15 },
    buttonText: { fontSize: 20, fontWeight: 'bold', color: '#70ac3b' },
    orText: { marginVertical: 25, fontSize: 18, fontWeight: 'bold', color: '#555' },
    infoText: { marginTop: 20, color: '#666', fontStyle: 'italic' },
    goBack: { marginTop: 50 },
    goBackText: { fontSize: 16, color: '#70ac3b', fontWeight: '600', textDecorationLine: 'underline' }
});