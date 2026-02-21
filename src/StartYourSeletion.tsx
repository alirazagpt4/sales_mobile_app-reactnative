import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://38.242.201.229/api/startday";

export default function StartYourSelection() {
    const navigation = useNavigation<any>();
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [isActionDone, setIsActionDone] = useState(false); // Buttons disable karne ke liye

    useEffect(() => {
        const initialize = async () => {
            const savedToken = await AsyncStorage.getItem("token");
            setToken(savedToken);

            // 🛑 Check if already submitted today
            const lastSubmissionDate = await AsyncStorage.getItem("last_submission_date");
            const today = new Date().toLocaleDateString(); // e.g., "2/21/2026"

            if (lastSubmissionDate === today) {
                setIsActionDone(true);
            }
        };
        initialize();
    }, []);

    const markSuccessInStorage = async () => {
        const today = new Date().toLocaleDateString();
        await AsyncStorage.setItem("last_submission_date", today);
        setIsActionDone(true);
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

            await markSuccessInStorage(); // 🛑 Save date on success
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
                        {isActionDone ? "Already Marked" : t('start_day')}
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
                        {isActionDone ? "Already Marked" : t('take_leave')}
                    </Text>
                </TouchableOpacity>

                {isActionDone && (
                    <Text style={styles.infoText}>You have already updated your status for today.</Text>
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