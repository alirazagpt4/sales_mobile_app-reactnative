import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const savedLng = await AsyncStorage.getItem('user-language');
      callback(savedLng || 'en');
    } catch (error) {
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng) => {
    try {
      await AsyncStorage.setItem('user-language', lng);
    } catch (error) {}
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    fallbackLng: 'en',
    resources: {
      en: {
        translation: {
          // LoginScreen.tsx
          login: "Login",
          name: "Name",
          password: "Password",
          logging_in: "Logging in...",

          // MainScreen.tsx
          welcome_back: "Welcome Back",
          start_day: "Start Day",
          visits: "Visits",
          day_started_already: "Day already started!",
          logout_message: "Are you sure you want to log out?",
          logout_btn: "Logout",


          // StartDayScreen.tsx (🛑 Nayi Keys Yahan Hain)
          start_day_header: "Start Your Day",
          take_picture: "Take Picture",
          photo_captured: "Photo Captured",
          enter_readings: "Enter Meter Readings",
          save_checkin: "Save Check-in",
          capturing: "Capturing...",
          waiting_location: "Waiting for location...",
          start_day_success: "Start day saved successfully!",
          no_internet: "No Internet Connection!",
          incomplete_data: "Please provide readings and photo.",

          // VisitsScreen.tsx
          mark_visit_header:"Mark Visit",
          new_customer: "New Customer",
          existing_customer: "Existing Customer",
          select_customer: "Select Customer",
          go_back: "Go Back",

          // AddNewCustomerScreen.tsx
          add_cust_header: "Add New Customer",
          cust_name: "Customer Name",
          cust_type: "Customer Type",
          contact: "Contact",
          area_village: "Area / Village",
          tehsil: "Tehsil",
          bags_potential: "Bags Potential",
          city_auto: "City",
          location_info: "Location Information",
          district: "District",
          division: "Division",
          province: "Province",
          region: "Region",
          saving: "Saving...",
          save_customer: "Save Customer",

          // CustomerListScreen.tsx
          cust_list_header: "Customer List",
          search_placeholder: "Search by name...",
          mark_visit: "Mark Visit",
          visited_today: "✅ Visited Today",
          select_purpose: "Select Visit Purpose",
          purpose_new: "Customer Regular Visit",
          purpose_old: "Follow Up Visit",
          purpose_mature: "Mature Order",
          confirm: "Confirm",
          cancel: "Cancel",

          // Alerts & Messages
          success: "Success",
          error: "Error",
          location_err: "Location permission is required.",
          gps_error: "GPS signal slow or off.",
        },

        // reports
        reports: "Reports",
        DailyVisitReport: "Daily Visit Report",
        FromDate: "From Date",
        ToDate: "To Date",
        FullName: "Full Name",
        GenerateReport: "Generate Report"

      },
      ur: {
        translation: {
          // LoginScreen.tsx
          login: "لاگ ان",
          name: "نام",
          password: "پاس ورڈ",
          logging_in: "لاگ ان ہو رہا ہے...",

          // MainScreen.tsx
          welcome_back: "خوش آمدید",
          start_day: "دن شروع کریں",
          visits: "وزٹ",
          day_started_already: "دن پہلے ہی شروع ہو چکا ہے!",
          logout_message: "کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟",
          logout_btn: "لاگ آؤٹ",


          // StartDayScreen.tsx (🛑 Nayi Keys Urdu Mein)
          start_day_header: "اپنا دن شروع کریں",
          take_picture: "تصویر لیں",
          photo_captured: "تصویر لے لی گئی ہے",
          enter_readings: "میٹر کی ریڈنگ لکھیں",
          save_checkin: "چیک ان محفوظ کریں",
          capturing: "محفوظ ہو رہا ہے...",
          waiting_location: "لوکیشن کا انتظار ہے...",
          start_day_success: "آپ کا دن کامیابی سے شروع ہو گیا ہے!",
          no_internet: "انٹرنیٹ موجود نہیں ہے!",
          incomplete_data: "براہ کرم ریڈنگ اور تصویر فراہم کریں۔",

          // VisitsScreen.tsx
          mark_visit_header:"وزٹ مارک کریں",
          new_customer: "نیا گاہک",
          existing_customer: "موجودہ گاہک",
          select_customer: "گاہک منتخب کریں",
          go_back: "واپس جائیں",

          // AddNewCustomerScreen.tsx
          add_cust_header: "نیا گاہک شامل کریں",
          cust_name: "گاہک کا نام",
          cust_type: "گاہک کی قسم",
          contact: "فون نمبر",
          area_village: "علاقہ / گاؤں",
          tehsil: "تحصیل",
          bags_potential: "بوریوں کی گنجائش",
          city_auto: "شہر",
          district : "ضلع",
          division : "ڈویژن",
          province : "صوبہ",
          region : "ریجن",
          location_info: "لوکیشن کی معلومات",
          saving: "محفوظ ہو رہا ہے...",
          save_customer: "گاہک محفوظ کریں",

          // CustomerListScreen.tsx
          cust_list_header: "گاہکوں کی فہرست",
          search_placeholder: "نام سے تلاش کریں...",
          mark_visit: "وزٹ درج کریں",
          visited_today: "✅ آج کا وزٹ مکمل",
          select_purpose: "وزٹ کا مقصد منتخب کریں",
          purpose_new: "نیا (تازہ رابطہ)",
          purpose_old: "پرانا (فالو اپ)",
          purpose_mature: "میچور (آرڈر مل گیا)",
          confirm: "تصدیق کریں",
          cancel: "کینسل",

          // Alerts & Messages
          success: "کامیابی",
          error: "غلطی",
          location_err: "لوکیشن کی اجازت ضروری ہے۔",
          gps_error: "GPS سگنل کمزور یا بند ہے۔",

          // reports
          reports: "رپورٹس",
          DailyVisitReport: "روزانہ وزٹ رپورٹ",
          FromDate: "تاریخ سے",
          ToDate: "تاریخ تک",
          FullName: "پورا نام",
          GenerateReport: "رپورٹ بنائیں"
        },
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;