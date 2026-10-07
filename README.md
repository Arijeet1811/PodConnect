# AirPods Popup for Android 🎧

A complete, production-grade Android application in Kotlin and Jetpack Compose that brings the iOS AirPods connection card experience to Android for any standard paired Bluetooth earphone.

When any paired Bluetooth device connects, an Apple-style bottom card slides up over any screen or app with an ultra-smooth 3D floating earbud, responsive hover physics, device details, battery status, haptic feedback, and an auto-dismiss timer.

---

## 🚀 Key Highlights & Architectural Modules

1. **Procedural 3D Canvas Visual (`EarbudCanvasVisual.kt`)**
   - **Zero external drawables or bitmap PNGs**: 100% vector-rendered using Jetpack Compose `Canvas`.
   - Multi-stop linear and radial gradient meshes simulating specular lighting, studio rim bounce, glossy polycarbonate, speaker grilles, acoustic sound ports, and bottom chrome charging contacts with insulator splits.

2. **Physics Hover & Apple UI Card (`EarphonePopupCard.kt`)**
   - Smooth sine-wave floating vertical offset animation.
   - Dynamic ground shadow beneath the earbuds that scales and modulates opacity in real-time based on earbud vertical elevation.
   - Apple-style squircle card geometry (`RoundedCornerShape(38.dp)`) with subtle studio drop shadow.
   - iOS battery capsule pill indicator (`XX%`) with adaptive green/amber color thresholds.
   - Apple Taptic click haptic feedback using Android `VibrationEffect.EFFECT_CLICK`.
   - Dismissible via tap on the backdrop scrim or by tapping "Done".

3. **WindowManager System Overlay (`OverlayManager.kt`)**
   - Direct injection of `ComposeView` into `WindowManager` using `WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY`.
   - Custom `OverlayLifecycleBridge` providing `LifecycleOwner`, `SavedStateRegistryOwner`, and `ViewModelStoreOwner` so Jetpack Compose runs stably outside an Activity.
   - 5.5-second auto-dismiss timer on the Main Looper (`android.os.Handler`).

4. **Android 14 Compliant Background Monitor & Low Battery Alert (`BluetoothMonitorService.kt`)**
   - Foreground Service with `foregroundServiceType="connectedDevice"`.
   - Dynamic `BroadcastReceiver` listening for `BluetoothDevice.ACTION_ACL_CONNECTED`, `ACTION_ACL_DISCONNECTED`, and battery updates.
   - **Persistent Low-Battery Notification (< 15%)**: When connected earphone battery falls below 15%, posts a high-priority persistent system notification on `airpods_low_battery_channel` with direct action buttons, even if the connection card is closed or inactive.
   - Automatically cancels notification once earphones are placed into the charging case or disconnected.

5. **Secondary UI Alert State (`EarphonePopupCard.kt`)**
   - When device battery is <= 15%, the popup card automatically enters an alert state with an amber glowing border, alert warning banner, and red/amber warning battery capsule.

5. **Permission & Sandbox Setup Activity (`MainActivity.kt`)**
   - Runtime permission management for `SYSTEM_ALERT_WINDOW`, `BLUETOOTH_CONNECT`, and `POST_NOTIFICATIONS` (Android 13+).
   - Real-time sandbox simulator allowing instant testing of the floating card with customizable device name and battery levels without physical earbuds.

6. **Automated CI/CD Build Pipeline (`.github/workflows/build.yml`)**
   - GitHub Actions workflow running on `ubuntu-latest`.
   - JDK 17 (Temurin) with Gradle build cache.
   - Compiles `./gradlew assembleDebug` and uploads `app-debug.apk` as a downloadable GitHub build artifact.

---

## 🛠️ Build Stack Specifications

- **Android Gradle Plugin (AGP)**: 8.4.2
- **Gradle**: 8.7
- **Kotlin**: 1.9.24
- **Compose Compiler Extension**: 1.5.14
- **Compose BOM**: 2024.05.00
- **Compile SDK**: 34 (Android 14)
- **Target SDK**: 34
- **Min SDK**: 26 (Android 8.0 Oreo)
- **Java Target**: 17

---

## 📦 Building the APK

### Via GitHub Actions:
Push this repository to GitHub on `main` or trigger the workflow under **Actions** → **Build Android APK**. The workflow will build and publish `app-debug.apk` in the run artifacts.

### Locally via Terminal:
```bash
chmod +x gradlew
./gradlew assembleDebug
```
The output APK is generated at:
`app/build/outputs/apk/debug/app-debug.apk`
