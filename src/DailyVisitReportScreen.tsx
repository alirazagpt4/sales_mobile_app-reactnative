import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, StatusBar } from 'react-native';
import {
  Text,
  Card,
  Button,
  Divider,
  Provider as PaperProvider,
  MD3LightTheme as DefaultTheme,
  Portal,
  Modal
} from 'react-native-paper';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Ionicons from 'react-native-vector-icons/Ionicons';

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: "#70ac3b" },
};




export default function DailyVisitReportScreen() {
  const { token, user } = useAuth();
  const [team, setTeam] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [isFromPickerVisible, setFromPickerVisibility] = useState(false);
  const [isToPickerVisible, setToPickerVisibility] = useState(false);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await axios.get("http://38.242.201.229/api/users/my-team-list", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setTeam(response.data.teamMembers);
        const currentUser = response.data.teamMembers.find((m: any) => m.id === user?.id);
        setSelectedUser(currentUser || response.data.teamMembers[0]);
      } catch (error) {
        console.error("Team load failed", error);
      }
    };
    if (token) fetchTeam();
  }, [token]);

  // 1. Function ko update karein taake wo ID accept kare
  const fetchReport = async (overrideId?: any) => {
    // Logic: Agar overrideId directly number/string hai toh wahi lo, 
    // agar object hai toh .id lo, warna state use karo.
    let idToUse;

    if (overrideId) {
      idToUse = typeof overrideId === 'object' ? overrideId.id : overrideId;
    } else {
      idToUse = selectedUser?.id;
    }

    if (!idToUse) return Alert.alert("Wait", "Please select a member");

    setReportData(null);
    setLoading(true);

    // DEBUG: Terminal mein check karein ke ab ID sahi ja rahi hai
    console.log("DEBUG: Final ID being sent to API ->", idToUse);

    try {
      const response = await axios.get("http://38.242.201.229/api/reports/my-report", {
        params: {
          fromDate,
          toDate,
          targetUserId: idToUse // <--- Ab yahan hamesha clean ID jayegi
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setReportData(response.data);
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert("Error", "Report fetch failed");
    } finally {
      setLoading(false);
    }
  };


const formatVisitPurpose = (purpose: string): string => {
  const purposeMap = {
    'New': 'Regular Visit',
    'Old': 'Follow Up Visit',
    'Mature': 'Mature Order',
    'NewPotentialCustomer': 'New Customer Visit'
  };

  // 🔴 'as keyof typeof purposeMap' lagane se indexing error khatam ho jayega
  return purposeMap[purpose as keyof typeof purposeMap] || purpose || 'Regular Visit';
};

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f9f9f9" />

        {/* Modal MUST be inside Portal but OUTSIDE of other Views for best behavior */}
        <Portal>
          <Modal
            visible={showUserPicker}
            onDismiss={() => setShowUserPicker(false)}
            contentContainerStyle={styles.modalStyle}
          >
            <Text style={styles.modalTitle}>Select Team Member</Text>
            <Divider style={{ marginBottom: 10 }} />
            <ScrollView style={{ maxHeight: 400 }}>
              {team.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={styles.memberItem}
                  onPress={() => {
                    setSelectedUser(member);
                    setShowUserPicker(false);
                    // Direct ID bhej rahe hain, function ab isay handle kar lega
                    fetchReport(member.id);
                  }}
                >
                  <Text style={[styles.memberText, selectedUser?.id === member.id && { color: '#70ac3b', fontWeight: 'bold' }]}>
                    {member.name}
                  </Text>
                  {selectedUser?.id === member.id && <Ionicons name="checkmark-circle" size={20} color="#70ac3b" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button mode="text" onPress={() => setShowUserPicker(false)} style={{ marginTop: 10 }}>Close</Button>
          </Modal>
        </Portal>

        <View style={styles.container}>
          {/* Top Filter Card */}
          <Card style={styles.filterCard}>
            <Card.Content>
              <Text style={styles.fieldLabel}>TEAM MEMBER</Text>
              <TouchableOpacity onPress={() => setShowUserPicker(true)} style={styles.pickerTrigger}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="person-outline" size={18} color="#70ac3b" style={{ marginRight: 10 }} />
                  <Text style={styles.pickerText}>{selectedUser ? selectedUser.name : "Select Member"}</Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              <View style={styles.dateContainer}>
                <TouchableOpacity onPress={() => setFromPickerVisibility(true)} style={styles.dateColumn}>
                  <Text style={styles.labelCenter}>FROM DATE</Text>
                  <View style={styles.dateBox}>
                    <Ionicons name="calendar-outline" size={16} color="#70ac3b" />
                    <Text style={styles.dateText}>{fromDate}</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.dateSeparator} />

                <TouchableOpacity onPress={() => setToPickerVisibility(true)} style={styles.dateColumn}>
                  <Text style={styles.labelCenter}>TO DATE</Text>
                  <View style={styles.dateBox}>
                    <Ionicons name="calendar-outline" size={16} color="#70ac3b" />
                    <Text style={styles.dateText}>{toDate}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <Button mode="contained" onPress={() => fetchReport()} loading={loading} style={styles.generateBtn}>
                GENERATE REPORT
              </Button>
            </Card.Content>
          </Card>

          {/* Results Area */}
          {loading ? (
            <ActivityIndicator size="large" color="#70ac3b" style={{ marginTop: 50 }} />
          ) : (reportData?.report?.length === 0 || !reportData) ? (

            /* 🕵️‍♂️ Full Screen Empty State - Jab kuch bhi record na ho */
            <View style={styles.noDataContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="search-outline" size={70} color="#bbb" />
                <View style={styles.emojiOverlay}>
                  <Ionicons name="alert-circle" size={24} color="#ffa000" />
                </View>
              </View>

              <Text style={styles.noDataTitle}>No Activity Recorded</Text>
              <Text style={styles.noDataSub}>
                We couldn't find any logs for <Text style={{ fontWeight: 'bold', color: '#333' }}>{selectedUser?.name || 'this user'}</Text> during this period. No attendance, leaves, or visits were found.
              </Text>

              <Button
                mode="contained"
                onPress={() => fetchReport()}
                style={styles.retryButton}
                icon="refresh"
              >
                RETRY SEARCH
              </Button>
            </View>

          ) : (
            /* 📜 Report List (Agar data hai) */
            <ScrollView contentContainerStyle={styles.scrollArea}>
              {reportData?.report?.map((day: any, index: number) => (
                <View key={index} style={styles.dayWrapper}>

                  {/* Header Section */}
                  <View style={[styles.mainDateHeader, day.is_leave && { borderLeftColor: '#f44336' }]}>
                    <Text style={styles.dateMainText}>{day.date}</Text>
                    <Text style={styles.subHeaderText}>
                      {day.is_leave ? (
                        <Text style={{ color: '#f44336', fontWeight: 'bold' }}>STATUS: {day.status}</Text>
                      ) : day.meter_reading && day.meter_reading !== "N/A" ? (
                        `START: ${day.day_start_time}  |  METER: ${day.meter_reading}`
                      ) : (
                        <Text style={{ color: '#ffa000', fontWeight: 'bold' }}>⚠️ STATUS: INACTIVE / NO ENTRY</Text>
                      )}
                    </Text>
                  </View>

                  {/* Activities Logic */}
                  {day.activities && day.activities.length > 0 ? (
                    day.activities.map((act: any, idx: number) => (
                      <Card key={idx} style={styles.visitCard}>
                        <Card.Content>
                          <View style={styles.infoGrid}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.fieldLabel}>CUSTOMER</Text>
                              <Text style={styles.fieldValue}>{act.customer_name}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                              <Text style={styles.fieldLabel}>TIME</Text>
                              <Text style={styles.fieldValue}>{act.time}</Text>
                            </View>
                          </View>

                          <Divider style={styles.divider} />

                          <View style={styles.infoGrid}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.fieldLabel}>CITY</Text>
                              <Text style={styles.fieldValue}>{act.city}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                              <Text style={styles.fieldLabel}>PURPOSE</Text>
                              <Text style={[styles.fieldValue, { color: '#70ac3b' }]}>{formatVisitPurpose(act.purpose)}</Text>
                            </View>
                          </View>

                          <View style={styles.potentialBox}>
                            <Text style={styles.potentialLabel}>BAGS POTENTIAL: <Text style={{ color: '#70ac3b' }}>{act.bags}</Text></Text>
                          </View>
                        </Card.Content>
                      </Card>
                    ))
                  ) : (
                    /* Small box if day exists but no visits */
                    <View style={styles.noActivitySmall}>
                      <Ionicons name="information-circle-outline" size={16} color="#aaa" style={{ marginRight: 5 }} />
                      <Text style={styles.noActivityText}>No field visits reported for this date.</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Date Pickers */}
        <DateTimePickerModal
          isVisible={isFromPickerVisible}
          mode="date"
          onConfirm={(date) => { setFromDate(date.toISOString().split('T')[0]); setFromPickerVisibility(false); }}
          onCancel={() => setFromPickerVisibility(false)}
        />
        <DateTimePickerModal
          isVisible={isToPickerVisible}
          mode="date"
          onConfirm={(date) => { setToDate(date.toISOString().split('T')[0]); setToPickerVisibility(false); }}
          onCancel={() => setToPickerVisibility(false)}
        />
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
  container: { flex: 1, paddingTop: 10 },
  filterCard: { margin: 15, elevation: 4, borderRadius: 12, backgroundColor: '#fff' },
  fieldLabel: { fontSize: 10, color: '#999', fontWeight: 'bold', marginBottom: 5, letterSpacing: 1 },
  pickerTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 20
  },
  pickerText: { fontSize: 15, color: '#333', fontWeight: '500' },
  dateContainer: { flexDirection: 'row', marginBottom: 20 },
  dateColumn: { flex: 1, alignItems: 'center' },
  labelCenter: { fontSize: 10, color: '#999', fontWeight: 'bold', marginBottom: 5 },
  dateBox: { flexDirection: 'row', alignItems: 'center' },
  dateText: { marginLeft: 8, fontSize: 14, fontWeight: 'bold', color: '#444' },
  dateSeparator: { width: 1, backgroundColor: '#eee', marginHorizontal: 10 },
  generateBtn: { borderRadius: 8, height: 48, justifyContent: 'center' },

  // Results
  scrollArea: { padding: 15 },
  dayWrapper: { marginBottom: 25 },
  mainDateHeader: { marginBottom: 15, borderLeftWidth: 4, borderLeftColor: '#70ac3b', paddingLeft: 10 },
  dateMainText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  subHeaderText: { fontSize: 11, color: '#777', marginTop: 2 },
  visitCard: { marginBottom: 10, borderRadius: 8, elevation: 1 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  fieldValue: { fontSize: 14, color: '#333', fontWeight: '600', marginTop: 2 },
  divider: { marginVertical: 10, opacity: 0.5 },
  potentialBox: { marginTop: 10, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#eee' },
  potentialLabel: { fontSize: 12, fontWeight: 'bold', color: '#666' },

  // Modal Styles
  modalStyle: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 15, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333', textAlign: 'center' },
  memberItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  memberText: { fontSize: 16, color: '#444' },
  noDataContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  noDataTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  noDataSub: { fontSize: 14, color: '#777', textAlign: 'center' },
  emptyIconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emojiOverlay: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    elevation: 5
  },
  noActivitySmall: {
    backgroundColor: '#fcfcfc',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
    alignItems: 'center'
  },
  noActivityText: {
    color: '#aaa',
    fontSize: 13,
    fontStyle: 'italic'
  }

});
