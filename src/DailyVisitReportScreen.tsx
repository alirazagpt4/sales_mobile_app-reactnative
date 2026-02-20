import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Platform, StatusBar } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Divider, 
  Provider as PaperProvider, 
  MD3LightTheme as DefaultTheme, 
  TextInput 
} from 'react-native-paper';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import { useTranslation } from 'react-i18next';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Ionicons from 'react-native-vector-icons/Ionicons';

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: "#70ac3b" },
};

export default function DailyVisitReportScreen() {
  const { token, user } = useAuth();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [isFromPickerVisible, setFromPickerVisibility] = useState(false);
  const [isToPickerVisible, setToPickerVisibility] = useState(false);

  const getVisitTypeLabel = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'new') return "Regular Visit";
    if (t === 'old') return "Follow up Visit";
    if (t === 'mature') return "Mature Order";
    return type;
  };

  const fetchReport = async () => {
    if (!token) {
      Alert.alert("Error", "Session expired. Please login again.");
      return;
    }
    setLoading(true);
    try {
      const baseUrl = "http://38.242.201.229/api";
      const response = await axios.get(`${baseUrl}/reports/my-report`, {
        params: { fromDate, toDate },
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(response.data);
    } catch (error: any) {
      Alert.alert("Error", "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f9f9f9" />
        
        <View style={styles.container}>
          
          {/* --- Input Section --- */}
          <Card style={styles.filterCard}>
            <Card.Content>
              <TextInput
                label="Full Name"
                value={user?.fullname || "Ali Afzal"}
                disabled
                mode="outlined"
                style={styles.input}
                outlineColor="#70ac3b"
                textColor="#333"
              />

              <View style={styles.dateContainer}>
                <TouchableOpacity onPress={() => setFromPickerVisibility(true)} style={styles.dateColumn}>
                  <Text style={styles.labelCenter}>FROM DATE</Text>
                  <View style={styles.dateBox}>
                    <Ionicons name="calendar-sharp" size={14} color="#70ac3b" />
                    <Text style={styles.dateText}>{fromDate}</Text>
                  </View>
                </TouchableOpacity>

                <View style={styles.dateSeparator} />

                <TouchableOpacity onPress={() => setToPickerVisibility(true)} style={styles.dateColumn}>
                  <Text style={styles.labelCenter}>TO DATE</Text>
                  <View style={styles.dateBox}>
                    <Ionicons name="calendar-sharp" size={14} color="#70ac3b" />
                    <Text style={styles.dateText}>{toDate}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <Button 
                mode="contained" 
                onPress={fetchReport} 
                loading={loading} 
                style={styles.generateBtn}
                labelStyle={{ fontWeight: '700', letterSpacing: 1 }}
              >
                GENERATE REPORT
              </Button>
            </Card.Content>
          </Card>

          {/* --- Results Section --- */}
          {loading ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="small" color="#70ac3b" />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
              {reportData?.report.map((day: any, index: number) => (
                <View key={index} style={styles.dayWrapper}>
                  
                  {/* Clean Header - No Emojis */}
                  <View style={styles.mainDateHeader}>
                    <Text style={styles.dateMainText}>{day.date}</Text>
                    <View style={styles.subHeaderRow}>
                      <Text style={styles.subHeaderText}>START TIME: {day.day_start_time}</Text>
                      <View style={styles.dot} />
                      <Text style={styles.subHeaderText}>METER: {day.meter_reading}</Text>
                    </View>
                  </View>

                  {day.activities.map((act: any, idx: number) => (
                    <Card key={idx} style={styles.visitCard}>
                      <Card.Content>
                        <View style={styles.infoGrid}>
                          <View style={{flex: 1.2}}>
                            <Text style={styles.fieldLabel}>CUSTOMER NAME</Text>
                            <Text style={styles.fieldValue}>{act.customer_name}</Text>
                          </View>
                          <View style={{flex: 1, alignItems: 'flex-end'}}>
                            <Text style={styles.fieldLabel}>TIME</Text>
                            <Text style={styles.fieldValue}>{act.time}</Text>
                          </View>
                        </View>

                        <Divider style={styles.divider} />

                        <View style={styles.infoGrid}>
                          <View style={{flex: 1}}>
                            <Text style={styles.fieldLabel}>CITY</Text>
                            <Text style={styles.fieldValue}>{act.city}</Text>
                          </View>
                          <View style={{flex: 1.5, alignItems: 'flex-end'}}>
                            <Text style={styles.fieldLabel}>VISIT TYPE</Text>
                            <Text style={[styles.fieldValue, {color: '#70ac3b'}]}>
                              {getVisitTypeLabel(act.purpose)}
                            </Text>
                          </View>
                        </View>
                            
                             <Divider style={styles.divider} />

                         <View style={styles.infoGrid}>
                         
                          <View style={{flex: 1.5, alignItems: 'flex-center'}}>
                            <Text style={styles.fieldLabel}>CUSTOMER TYPE</Text>
                            <Text style={[styles.fieldValue, {color: '#70ac3b'}]}>
                              {getVisitTypeLabel(act.type)}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.potentialBox}>
                          <Text style={styles.potentialLabel}>BAG POTENTIAL</Text>
                          <Text style={styles.potentialValue}>{act.bags}</Text>
                        </View>
                      </Card.Content>
                    </Card>
                  ))}
                </View>
              ))}
            </ScrollView>
          )}

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
        </View>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9f9f9' },
  container: { 
    flex: 1, 
    paddingTop: 30, // Screen ko mazeed niche shift kiya
  },
  filterCard: { 
    marginHorizontal: 15, 
    marginBottom: 25, 
    elevation: 2, 
    borderRadius: 8, 
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#eee'
  },
  input: { marginBottom: 15, backgroundColor: '#fff', height: 50 },
  
  dateContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  dateColumn: { alignItems: 'center', flex: 1 },
  labelCenter: { fontSize: 9, color: '#aaa', fontWeight: 'bold', marginBottom: 5, letterSpacing: 0.5 },
  dateBox: { flexDirection: 'row', alignItems: 'center', padding: 6, width: '90%', justifyContent: 'center' },
  dateText: { marginLeft: 5, fontSize: 13, fontWeight: '700', color: '#444' },
  dateSeparator: { width: 1, height: 20, backgroundColor: '#eee', marginHorizontal: 5 },
  
  generateBtn: { borderRadius: 4, height: 48, justifyContent: 'center' },
  
  scrollArea: { paddingHorizontal: 15, paddingBottom: 40 },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  dayWrapper: { marginBottom: 30 },
  mainDateHeader: { alignItems: 'center', marginBottom: 15 },
  dateMainText: { fontSize: 16, fontWeight: 'bold', color: '#333', letterSpacing: 0.5 },
  subHeaderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  subHeaderText: { fontSize: 10, color: '#888', fontWeight: 'bold', letterSpacing: 0.5 },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#ccc', marginHorizontal: 12 },

  visitCard: { marginBottom: 12, borderRadius: 4, borderLeftWidth: 3, borderLeftColor: '#70ac3b', backgroundColor: '#fff', elevation: 1 },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  fieldLabel: { fontSize: 8, color: '#aaa', fontWeight: 'bold', letterSpacing: 0.3 },
  fieldValue: { fontSize: 13, color: '#333', fontWeight: '600', marginTop: 1 },
  divider: { marginVertical: 8, backgroundColor: '#f8f8f8' },
  
  potentialBox: { 
    marginTop: 10, 
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  potentialLabel: { fontSize: 9, color: '#888', fontWeight: 'bold' },
  potentialValue: { fontSize: 14, fontWeight: 'bold', color: '#70ac3b' }
});