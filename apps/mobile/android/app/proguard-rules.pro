# Project specific ProGuard / R8 rules for Grand Bandhan Mobile

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**

# React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }
-keepclassmembers class com.swmansion.reanimated.** { *; }
-dontwarn com.swmansion.reanimated.**

# React Native Keychain
-keep class com.oblador.keychain.** { *; }
-dontwarn com.oblador.keychain.**

# React Native Screens & Gesture Handler
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.swmansion.gesturehandler.** { *; }

# React Native SVG
-keep class com.horcrux.svg.** { *; }
