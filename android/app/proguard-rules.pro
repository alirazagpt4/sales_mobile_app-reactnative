## React Native App Ke Liye Universal ProGuard Rules

# 1. Application ke zaroori entry points ko bachana (Aapka Fix)
-keep public class com.sales_dvr.MainActivity { *; }
-keep public class com.sales_dvr.MainApplication { *; }
-keep public class com.sales_dvr.BuildConfig { *; }

# 2. Saari Activities, Fragments, aur Views ko bachana
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Fragment
-keep public class * extends androidx.fragment.app.Fragment
-keep public class * extends android.view.View { public <init>(android.content.Context); public <init>(android.content.Context, android.util.AttributeSet); public <init>(android.content.Context, android.util.AttributeSet, int); }

# 3. React Native Bridge, Modules, aur JS Bundling ko bachana
-keep class com.facebook.react.bridge.JavaScriptModule { public *; }
-keep class com.facebook.react.bridge.NativeModule { public *; }
-keep class com.facebook.react.modules.** { *; }
-keep class * extends com.facebook.react.bridge.BaseJavaModule { public *; }
-keep class * implements com.facebook.react.bridge.JavaScriptModule { public *; }
-keep class * implements com.facebook.react.bridge.NativeModule { public *; }

# 4. Third-Party Libraries (Aapki apps mein commonly use hoti hain)
-keep class com.reactnativecommunity.asyncstorage.** { *; }
-keep class com.imagepicker.** { *; }
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.oblador.vectoricons.** { *; }

# 5. Networking aur Serialization (Axios ke liye zaroori)
-dontwarn okio.**
-dontwarn okhttp3.**
-dontwarn retrofit2.**
-keepattributes Signature
-keepattributes *Annotation*


# 🛑 CRITICAL FIX FOR mqt_v_native CRASH 🛑

# 1. react-native-screens aur uske dependencies
-keep class com.swmansion.rnscreens.** { *; }

# 2. react-native-safe-area-context (Yeh aam taur par mqt crash karta hai)
-keep class com.th3rdwave.safeareacontext.** { *; }

# 3. react-native-vector-icons (Agar aap isko use kar rahe hain)
-keep class com.oblador.vectoricons.** { *; }

# 4. Zaroori AndroidX libraries jo Native modules use karte hain
-dontwarn androidx.core.view.**
-keep class androidx.core.view.ViewCompat$OnUnhandledKeyEventListenerWrapper { *; }
-keep class androidx.core.view.** { *; }

# 🛑 CRITICAL FIX FOR mqt_v_native (Native Module Method Missing)
# Zaroori hai ki Native modules ki saari methods bachi rahen
-keep class com.facebook.react.modules.core.Timing$TimerGuard { *; } 
-keep class ** implements com.facebook.react.TurboReactPackage { public *; }


# 🚨 RISKY/MAZBOOT FIX: Sabhi com.facebook classes ko keep karein
# Yeh file size badha dega, lekin crash nahi hoga.
-keep class com.facebook.** { *; }