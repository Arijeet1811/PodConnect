export interface ProjectFile {
  path: string;
  name: string;
  language: string;
  category: 'workflow' | 'gradle' | 'manifest' | 'kotlin' | 'docs';
  description: string;
  content: string;
}

export const PROJECT_FILES: ProjectFile[] = [
  {
    path: ".github/workflows/build.yml",
    name: "build.yml",
    language: "yaml",
    category: "workflow",
    description: "GitHub Actions CI/CD workflow to build assembleDebug APK and upload as downloadable artifact",
    content: `name: Build Android APK

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    name: Build Debug APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'

      - name: Grant Execute Permission to Gradlew
        run: chmod +x gradlew

      - name: Build Debug APK with Gradle
        run: ./gradlew assembleDebug --stacktrace

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-debug
          path: app/build/outputs/apk/debug/app-debug.apk
          retention-days: 14`
  },
  {
    path: "gradle/wrapper/gradle-wrapper.properties",
    name: "gradle-wrapper.properties",
    language: "properties",
    category: "gradle",
    description: "Configures Gradle 8.7 distribution binaries for AGP 8.4.2 compatibility",
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`
  },
  {
    path: "settings.gradle.kts",
    name: "settings.gradle.kts",
    language: "kotlin",
    category: "gradle",
    description: "Root repository definitions and module inclusion (:app)",
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "AirPodsPopupAndroid"
include(":app")`
  },
  {
    path: "build.gradle.kts",
    name: "build.gradle.kts (Project)",
    language: "kotlin",
    category: "gradle",
    description: "Top-level Gradle build configuration declaring AGP 8.4.2 and Kotlin 1.9.24",
    content: `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id("com.android.application") version "8.4.2" apply false
    id("org.jetbrains.kotlin.android") version "1.9.24" apply false
}

tasks.register("clean", Delete::class) {
    delete(rootProject.layout.buildDirectory)
}`
  },
  {
    path: "app/build.gradle.kts",
    name: "app/build.gradle.kts (Module)",
    language: "kotlin",
    category: "gradle",
    description: "App module build file: compileSdk 34, Compose 1.5.14, Java 17, and Jetpack dependencies",
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.example.airpodspopup"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.airpodspopup"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            isMinifyEnabled = false
            applicationIdSuffix = ""
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.05.00")
    implementation(composeBom)
    androidTestImplementation(composeBom)

    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.0")
    implementation("androidx.savedstate:savedstate-ktx:1.2.1")
    implementation("androidx.activity:activity-compose:1.9.0")

    // Jetpack Compose
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}`
  },
  {
    path: "app/src/main/AndroidManifest.xml",
    name: "AndroidManifest.xml",
    language: "xml",
    category: "manifest",
    description: "App permissions: SYSTEM_ALERT_WINDOW, BLUETOOTH_CONNECT, FOREGROUND_SERVICE_CONNECTED_DEVICE",
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- System Overlay Window permission for floating over any screen -->
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

    <!-- Bluetooth permissions -->
    <uses-permission
        android:name="android.permission.BLUETOOTH"
        android:maxSdkVersion="30" />
    <uses-permission
        android:name="android.permission.BLUETOOTH_ADMIN"
        android:maxSdkVersion="30" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

    <!-- Foreground Service permissions for background monitor on Android 14+ -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <!-- Haptic feedback vibration permission -->
    <uses-permission android:name="android.permission.VIBRATE" />

    <!-- Boot completed to keep service alive -->
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <application
        android:allowBackup="true"
        android:icon="@android:drawable/stat_sys_data_bluetooth"
        android:label="AirPods Popup"
        android:roundIcon="@android:drawable/stat_sys_data_bluetooth"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.Light.NoActionBar">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".BluetoothMonitorService"
            android:exported="false"
            android:foregroundServiceType="connectedDevice" />

    </application>

</manifest>`
  },
  {
    path: "app/src/main/java/com/example/airpodspopup/EarbudCanvasVisual.kt",
    name: "EarbudCanvasVisual.kt",
    language: "kotlin",
    category: "kotlin",
    description: "100% procedural 3D glossy earbud rendered via Jetpack Compose Canvas (zero external bitmaps)",
    content: `package com.example.airpodspopup

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.RoundRect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Procedural 3D Earbud Visual rendered entirely using Jetpack Compose Canvas.
 * No external drawables, assets, or bitmap PNGs are required.
 *
 * Utilizes multi-stop linear gradients, radial ambient occlusion, specular highlights,
 * acoustic mesh elliptical cutouts, stem chrome charging contacts, and acoustic vents.
 */
@Composable
fun EarbudCanvasVisual(
    modifier: Modifier = Modifier,
    size: Dp = 190.dp,
    isLeft: Boolean = false
) {
    Box(
        modifier = modifier.size(size),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val canvasWidth = this.size.width
            val canvasHeight = this.size.height

            // Flip horizontally if rendering Left earbud
            if (isLeft) {
                // Mirror across the center X axis
                drawContext.canvas.save()
                drawContext.transform.scale(-1f, 1f, Offset(canvasWidth / 2f, canvasHeight / 2f))
            }

            drawSingleEarbud(canvasWidth, canvasHeight)

            if (isLeft) {
                drawContext.canvas.restore()
            }
        }
    }
}

/**
 * Renders the procedural glossy 3D earbud on the DrawScope.
 */
private fun DrawScope.drawSingleEarbud(width: Float, height: Float) {
    val scale = width / 200f // Baseline coordinates normalized to 200x200

    // Center coordinates
    val headCenterX = 118f * scale
    val headCenterY = 64f * scale
    val headRadiusX = 42f * scale
    val headRadiusY = 38f * scale

    // 1. STEM DROP SHADOW / AMBIENT OCCLUSION
    val stemShadowPath = Path().apply {
        moveTo(headCenterX - 8f * scale, headCenterY + 22f * scale)
        lineTo(headCenterX + 6f * scale, headCenterY + 22f * scale)
        lineTo(headCenterX - 4f * scale, 172f * scale)
        lineTo(headCenterX - 18f * scale, 172f * scale)
        close()
    }
    drawPath(
        path = stemShadowPath,
        color = Color(0x18000000)
    )

    // 2. STEM CYLINDER
    val stemLeft = headCenterX - 14f * scale
    val stemTop = headCenterY + 16f * scale
    val stemWidth = 18f * scale
    val stemHeight = 114f * scale
    val stemCorner = 9f * scale

    // Stem body gradient (glossy cylindrical plastic with light source from top-left)
    val stemBrush = Brush.horizontalGradient(
        colors = listOf(
            Color(0xFFE2E4E8), // Left shadow rim
            Color(0xFFF9FAFB), // Specular light highlight
            Color(0xFFFFFFFF), // Core white
            Color(0xFFEFF1F5), // Ambient midtone
            Color(0xFFD8DCE2)  // Right bounce drop shadow
        ),
        startX = stemLeft,
        endX = stemLeft + stemWidth
    )

    drawRoundRect(
        brush = stemBrush,
        topLeft = Offset(stemLeft, stemTop),
        size = Size(stemWidth, stemHeight),
        cornerRadius = CornerRadius(stemCorner, stemCorner)
    )

    // Stem subtle ambient outline
    drawRoundRect(
        color = Color(0x1F000000),
        topLeft = Offset(stemLeft, stemTop),
        size = Size(stemWidth, stemHeight),
        cornerRadius = CornerRadius(stemCorner, stemCorner),
        style = Stroke(width = 0.75f * scale)
    )

    // 3. STEM BOTTOM CHROME CHARGING CONTACT & MICROPHONE
    val chromeHeight = 11f * scale
    val chromeTop = stemTop + stemHeight - chromeHeight

    val chromeBrush = Brush.verticalGradient(
        colors = listOf(
            Color(0xFFCCCCCC), // Shadow boundary
            Color(0xFFECEFF1), // Chrome reflection
            Color(0xFFB0B7BD), // Dark chrome band
            Color(0xFFE0E0E0), // Base highlight
            Color(0xFF909498)  // Bottom edge
        ),
        startY = chromeTop,
        endY = chromeTop + chromeHeight
    )

    drawRoundRect(
        brush = chromeBrush,
        topLeft = Offset(stemLeft, chromeTop),
        size = Size(stemWidth, chromeHeight),
        cornerRadius = CornerRadius(stemCorner, stemCorner)
    )

    // Insulator slit between chrome contacts
    drawRoundRect(
        color = Color(0xFF333333),
        topLeft = Offset(stemLeft + 2f * scale, chromeTop + chromeHeight - 3f * scale),
        size = Size(stemWidth - 4f * scale, 1.2f * scale),
        cornerRadius = CornerRadius(1f * scale, 1f * scale)
    )

    // Bottom microphone acoustic grill cutout
    drawCircle(
        color = Color(0xFF222426),
        radius = 2.4f * scale,
        center = Offset(stemLeft + stemWidth / 2f, chromeTop + chromeHeight - 1.5f * scale)
    )

    // 4. MAIN BULBOUS ACOUSTIC HEAD
    val headPath = Path().apply {
        moveTo(stemLeft, stemTop + 4f * scale)
        cubicTo(
            stemLeft - 22f * scale, stemTop + 6f * scale,
            headCenterX - headRadiusX - 10f * scale, headCenterY + 18f * scale,
            headCenterX - headRadiusX, headCenterY + 4f * scale
        )
        cubicTo(
            headCenterX - headRadiusX + 4f * scale, headCenterY - headRadiusY + 4f * scale,
            headCenterX - 18f * scale, headCenterY - headRadiusY,
            headCenterX, headCenterY - headRadiusY
        )
        cubicTo(
            headCenterX + 28f * scale, headCenterY - headRadiusY,
            headCenterX + headRadiusX + 6f * scale, headCenterY - 14f * scale,
            headCenterX + headRadiusX, headCenterY + 8f * scale
        )
        cubicTo(
            headCenterX + headRadiusX - 4f * scale, headCenterY + 28f * scale,
            stemLeft + stemWidth + 6f * scale, stemTop - 2f * scale,
            stemLeft + stemWidth, stemTop + 8f * scale
        )
        close()
    }

    val headVolumeBrush = Brush.radialGradient(
        colors = listOf(
            Color(0xFFFFFFFF),
            Color(0xFFF7F8FA),
            Color(0xFFECEFF2),
            Color(0xFFD6DBE2)
        ),
        center = Offset(headCenterX - 8f * scale, headCenterY - 12f * scale),
        radius = headRadiusX * 1.35f
    )
    drawPath(path = headPath, brush = headVolumeBrush)

    drawPath(
        path = headPath,
        color = Color(0x1C000000),
        style = Stroke(width = 0.8f * scale)
    )

    // 5. IN-EAR SOUND OUTLET SPEAKER GRILLE (BLACK ACOUSTIC MESH)
    val grillCenterX = headCenterX - 20f * scale
    val grillCenterY = headCenterY + 4f * scale
    val grillRadiusX = 12f * scale
    val grillRadiusY = 17f * scale

    val grillPath = Path().apply {
        addOval(
            Rect(
                grillCenterX - grillRadiusX,
                grillCenterY - grillRadiusY,
                grillCenterX + grillRadiusX,
                grillCenterY + grillRadiusY
            )
        )
    }

    val meshBrush = Brush.radialGradient(
        colors = listOf(
            Color(0xFF383A3D),
            Color(0xFF1E2022),
            Color(0xFF111213)
        ),
        center = Offset(grillCenterX, grillCenterY),
        radius = grillRadiusY
    )
    drawPath(path = grillPath, brush = meshBrush)

    // Micro acoustic vent dot pattern inside the sound outlet
    val ventDotColor = Color(0x66FFFFFF)
    val dotRadius = 0.75f * scale
    drawCircle(color = ventDotColor, radius = dotRadius, center = Offset(grillCenterX - 4f * scale, grillCenterY - 4f * scale))
    drawCircle(color = ventDotColor, radius = dotRadius, center = Offset(grillCenterX, grillCenterY - 6f * scale))
    drawCircle(color = ventDotColor, radius = dotRadius, center = Offset(grillCenterX + 4f * scale, grillCenterY - 4f * scale))
    drawCircle(color = ventDotColor, radius = dotRadius, center = Offset(grillCenterX - 5f * scale, grillCenterY))
    drawCircle(color = ventDotColor, radius = dotRadius, center = Offset(grillCenterX, grillCenterY))
    drawCircle(color = ventDotColor, radius = dotRadius, center = Offset(grillCenterX + 5f * scale, grillCenterY))
    drawCircle(color = ventDotColor, radius = dotRadius, center = Offset(grillCenterX - 3f * scale, grillCenterY + 5f * scale))
    drawCircle(color = ventDotColor, radius = dotRadius, center = Offset(grillCenterX + 3f * scale, grillCenterY + 5f * scale))

    drawPath(
        path = grillPath,
        color = Color(0x33A0A5AA),
        style = Stroke(width = 1.2f * scale)
    )

    // 6. EXTERNAL PRESSURE EQUALIZATION VENT (Top-back pill grille)
    val topVentX = headCenterX + 16f * scale
    val topVentY = headCenterY - 18f * scale
    val topVentWidth = 14f * scale
    val topVentHeight = 4.5f * scale

    val topVentPath = Path().apply {
        addRoundRect(
            RoundRect(
                rect = Rect(
                    topVentX - topVentWidth / 2f,
                    topVentY - topVentHeight / 2f,
                    topVentX + topVentWidth / 2f,
                    topVentY + topVentHeight / 2f
                ),
                cornerRadius = CornerRadius(topVentHeight / 2f, topVentHeight / 2f)
            )
        )
    }

    drawPath(path = topVentPath, color = Color(0xFF222428))
    drawPath(path = topVentPath, color = Color(0x22FFFFFF), style = Stroke(width = 0.6f * scale))

    // 7. STEM OPTICAL SENSOR / REAR BEAMFORMING MICROPHONE
    val stemSensorY = stemTop + 24f * scale
    val stemSensorPath = Path().apply {
        addRoundRect(
            RoundRect(
                rect = Rect(
                    stemLeft + 3f * scale,
                    stemSensorY,
                    stemLeft + 6.5f * scale,
                    stemSensorY + 9f * scale
                ),
                cornerRadius = CornerRadius(1.8f * scale, 1.8f * scale)
            )
        )
    }
    drawPath(path = stemSensorPath, color = Color(0xFF2B2D31))

    // 8. GLOSSY SPECULAR HIGHLIGHT CURVES
    val glossPath = Path().apply {
        moveTo(headCenterX - 14f * scale, headCenterY - 30f * scale)
        cubicTo(
            headCenterX, headCenterY - 32f * scale,
            headCenterX + 24f * scale, headCenterY - 26f * scale,
            headCenterX + 34f * scale, headCenterY - 4f * scale
        )
    }
    drawPath(
        path = glossPath,
        brush = Brush.linearGradient(
            colors = listOf(
                Color(0x00FFFFFF),
                Color(0xDDFFFFFF),
                Color(0x00FFFFFF)
            )
        ),
        style = Stroke(width = 3.5f * scale, cap = StrokeCap.Round)
    )

    drawLine(
        brush = Brush.verticalGradient(
            colors = listOf(
                Color(0x00FFFFFF),
                Color(0xC0FFFFFF),
                Color(0x90FFFFFF),
                Color(0x00FFFFFF)
            ),
            startY = stemTop + 8f * scale,
            endY = stemTop + stemHeight - 16f * scale
        ),
        start = Offset(stemLeft + 3.5f * scale, stemTop + 8f * scale),
        end = Offset(stemLeft + 3.5f * scale, stemTop + stemHeight - 16f * scale),
        strokeWidth = 2.2f * scale,
        cap = StrokeCap.Round
    )
}`
  },
  {
    path: "app/src/main/java/com/example/airpodspopup/EarphonePopupCard.kt",
    name: "EarphonePopupCard.kt",
    language: "kotlin",
    category: "kotlin",
    description: "Sliding Apple connection card with secondary UI low battery state (<= 15%), hover physics, and taptic haptics",
    content: `package com.example.airpodspopup

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.BatteryAlert
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.roundToInt

@Composable
fun EarphonePopupCard(
    deviceName: String,
    batteryLevel: Int,
    onDismiss: () -> Unit
) {
    val context = LocalContext.current
    var isVisible by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        isVisible = true
    }

    val dismissWithHaptic: () -> Unit = {
        performAppleTapticFeedback(context)
        isVisible = false
        onDismiss()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Transparent)
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                onClick = dismissWithHaptic
            ),
        contentAlignment = Alignment.BottomCenter
    ) {
        AnimatedVisibility(
            visible = isVisible,
            enter = slideInVertically(
                initialOffsetY = { fullHeight -> fullHeight },
                animationSpec = tween(durationMillis = 420, easing = FastOutSlowInEasing)
            ) + fadeIn(animationSpec = tween(280)),
            exit = slideOutVertically(
                targetOffsetY = { fullHeight -> fullHeight },
                animationSpec = tween(durationMillis = 320, easing = FastOutSlowInEasing)
            ) + fadeOut(animationSpec = tween(220))
        ) {
            CardContent(
                deviceName = deviceName,
                batteryLevel = batteryLevel,
                onOkClicked = dismissWithHaptic
            )
        }
    }
}

@Composable
private fun CardContent(
    deviceName: String,
    batteryLevel: Int,
    onOkClicked: () -> Unit
) {
    val isCriticalLowBattery = batteryLevel in 0..15

    val infiniteTransition = rememberInfiniteTransition(label = "AirPodHoverTransition")
    val hoverProgress by infiniteTransition.animateFloat(
        initialValue = -1f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "HoverOffset"
    )

    val earbudVerticalOffset = (hoverProgress * -7f).dp
    val shadowScaleX = 1f + (hoverProgress * 0.12f)
    val shadowAlpha = 0.38f - (hoverProgress * 0.14f)

    Surface(
        modifier = Modifier
            .padding(horizontal = 20.dp, vertical = 28.dp)
            .fillMaxWidth()
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                onClick = { }
            )
            .shadow(
                elevation = 28.dp,
                shape = RoundedCornerShape(38.dp),
                ambientColor = if (isCriticalLowBattery) Color(0x33FF9500) else Color(0x33000000),
                spotColor = if (isCriticalLowBattery) Color(0x40FF9500) else Color(0x40000000)
            ),
        shape = RoundedCornerShape(38.dp),
        color = Color(0xFFFCFCFE),
        border = if (isCriticalLowBattery) BorderStroke(1.5.dp, Color(0x55FF9500)) else null
    ) {
        Column(
            modifier = Modifier
                .padding(top = 28.dp, bottom = 24.dp, start = 24.dp, end = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = deviceName.ifBlank { "AirPods Pro" },
                fontSize = 21.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF1D1D1F),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(4.dp))

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Icon(
                    imageVector = Icons.Rounded.CheckCircle,
                    contentDescription = null,
                    tint = Color(0xFF34C759),
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "Connected",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF86868B)
                )
            }

            if (isCriticalLowBattery) {
                Spacer(modifier = Modifier.height(10.dp))
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFFFFF4E5))
                        .padding(horizontal = 12.dp, vertical = 5.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Warning,
                        contentDescription = null,
                        tint = Color(0xFFFF9500),
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Battery below 15% • Place in case soon",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFFB35900)
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp),
                contentAlignment = Alignment.Center
            ) {
                Canvas(
                    modifier = Modifier
                        .size(width = 170.dp, height = 30.dp)
                        .align(Alignment.BottomCenter)
                        .offset(y = (-10).dp)
                        .scale(scaleX = shadowScaleX, scaleY = 1f)
                        .alpha(shadowAlpha)
                ) {
                    drawOval(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                Color(0x70000000),
                                Color(0x30000000),
                                Color(0x00000000)
                            ),
                            center = Offset(size.width / 2f, size.height / 2f),
                            radius = size.width / 2f
                        )
                    )
                }

                Row(
                    modifier = Modifier
                        .offset { IntOffset(0, earbudVerticalOffset.roundToPx()) },
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    EarbudCanvasVisual(
                        modifier = Modifier.offset(x = 10.dp),
                        size = 155.dp,
                        isLeft = true
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    EarbudCanvasVisual(
                        modifier = Modifier.offset(x = (-10).dp),
                        size = 155.dp,
                        isLeft = false
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            BatteryCapsule(batteryLevel = batteryLevel)

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = onOkClicked,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = CircleShape,
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isCriticalLowBattery) Color(0xFFFF9500) else Color(0xFF0071E3),
                    contentColor = Color.White
                ),
                elevation = ButtonDefaults.buttonElevation(defaultElevation = 0.dp)
            ) {
                Text(
                    text = "Done",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}

@Composable
private fun BatteryCapsule(batteryLevel: Int) {
    val displayPercent = if (batteryLevel in 0..100) batteryLevel else 95
    val isCritical = displayPercent <= 15
    val isLowBattery = displayPercent <= 20
    val batteryColor = when {
        isCritical -> Color(0xFFFF3B30)
        isLowBattery -> Color(0xFFFF9500)
        else -> Color(0xFF34C759)
    }

    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(if (isCritical) Color(0xFFFFF0ED) else Color(0xFFF2F2F7))
            .padding(horizontal = 14.dp, vertical = 7.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        if (isCritical) {
            Icon(
                imageVector = Icons.Rounded.BatteryAlert,
                contentDescription = "Battery Alert",
                tint = batteryColor,
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(5.dp))
        } else {
            Box(
                modifier = Modifier
                    .width(24.dp)
                    .height(12.dp)
                    .clip(RoundedCornerShape(3.dp))
                    .background(Color(0xFFD1D1D6))
                    .padding(1.2.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize(fraction = (displayPercent / 100f).coerceIn(0.08f, 1f))
                        .clip(RoundedCornerShape(2.dp))
                        .background(batteryColor)
                )
            }
            Spacer(modifier = Modifier.width(7.dp))
        }

        Text(
            text = "\${displayPercent}%",
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = if (isCritical) Color(0xFFD70015) else Color(0xFF1D1D1F)
        )
    }
}

private fun performAppleTapticFeedback(context: Context) {
    try {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            val vibrator = vibratorManager?.defaultVibrator
            vibrator?.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK))
        } else {
            @Suppress("DEPRECATION")
            val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                vibrator?.vibrate(VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK))
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(28L)
            }
        }
    } catch (_: Exception) {}
}`
  },
  {
    path: "app/src/main/java/com/example/airpodspopup/OverlayManager.kt",
    name: "OverlayManager.kt",
    language: "kotlin",
    category: "kotlin",
    description: "WindowManager injection using TYPE_APPLICATION_OVERLAY, custom LifecycleOwner bridge, 5.5s timer",
    content: `package com.example.airpodspopup

import android.content.Context
import android.graphics.PixelFormat
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.Log
import android.view.Gravity
import android.view.WindowManager
import androidx.compose.ui.platform.ComposeView
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LifecycleRegistry
import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.setViewTreeLifecycleOwner
import androidx.lifecycle.setViewTreeViewModelStoreOwner
import androidx.savedstate.SavedStateRegistry
import androidx.savedstate.SavedStateRegistryController
import androidx.savedstate.SavedStateRegistryOwner
import androidx.savedstate.setViewTreeSavedStateRegistryOwner

class OverlayManager(private val context: Context) {

    companion object {
        private const val TAG = "OverlayManager"
        private const val AUTO_DISMISS_DELAY_MS = 5500L
    }

    private val windowManager: WindowManager =
        context.getSystemService(Context.WINDOW_SERVICE) as WindowManager

    private val mainHandler = Handler(Looper.getMainLooper())

    private var activeComposeView: ComposeView? = null
    private var activeLifecycleBridge: OverlayLifecycleBridge? = null
    private var autoDismissRunnable: Runnable? = null

    fun canDrawOverlays(): Boolean = Settings.canDrawOverlays(context)

    fun showPopup(deviceName: String, batteryLevel: Int) {
        if (!canDrawOverlays()) {
            Log.w(TAG, "Cannot show overlay: SYSTEM_ALERT_WINDOW permission not granted")
            return
        }

        mainHandler.post {
            dismissCurrentPopup(immediate = true)

            try {
                val bridge = OverlayLifecycleBridge().apply {
                    onCreate()
                    onStart()
                    onResume()
                }
                activeLifecycleBridge = bridge

                val composeView = ComposeView(context).apply {
                    setBackgroundColor(android.graphics.Color.TRANSPARENT)
                    setViewTreeLifecycleOwner(bridge)
                    setViewTreeViewModelStoreOwner(bridge)
                    setViewTreeSavedStateRegistryOwner(bridge)

                    setContent {
                        EarphonePopupCard(
                            deviceName = deviceName,
                            batteryLevel = batteryLevel,
                            onDismiss = {
                                dismissCurrentPopup(immediate = false)
                            }
                        )
                    }
                }

                activeComposeView = composeView

                val layoutParams = WindowManager.LayoutParams(
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.MATCH_PARENT,
                    WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
                    WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                            WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                            WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS,
                    PixelFormat.TRANSLUCENT
                ).apply {
                    gravity = Gravity.BOTTOM or Gravity.CENTER_HORIZONTAL
                }

                windowManager.addView(composeView, layoutParams)
                scheduleAutoDismiss()

            } catch (e: Exception) {
                Log.e(TAG, "Failed to attach overlay to WindowManager: \${e.message}", e)
                dismissCurrentPopup(immediate = true)
            }
        }
    }

    private fun scheduleAutoDismiss() {
        cancelAutoDismiss()
        val runnable = Runnable {
            dismissCurrentPopup(immediate = false)
        }
        autoDismissRunnable = runnable
        mainHandler.postDelayed(runnable, AUTO_DISMISS_DELAY_MS)
    }

    private fun cancelAutoDismiss() {
        autoDismissRunnable?.let {
            mainHandler.removeCallbacks(it)
            autoDismissRunnable = null
        }
    }

    fun dismissCurrentPopup(immediate: Boolean = false) {
        cancelAutoDismiss()

        val view = activeComposeView ?: return
        val bridge = activeLifecycleBridge

        val cleanupBlock = {
            try {
                if (view.isAttachedToWindow) {
                    windowManager.removeViewImmediate(view)
                }
                bridge?.onPause()
                bridge?.onStop()
                bridge?.onDestroy()
            } catch (e: Exception) {
                Log.e(TAG, "Error detaching overlay view: \${e.message}", e)
            } finally {
                activeComposeView = null
                activeLifecycleBridge = null
            }
        }

        if (immediate) {
            cleanupBlock()
        } else {
            mainHandler.postDelayed({ cleanupBlock() }, 360L)
        }
    }

    private class OverlayLifecycleBridge : LifecycleOwner, ViewModelStoreOwner, SavedStateRegistryOwner {
        private val lifecycleRegistry = LifecycleRegistry(this)
        private val savedStateRegistryController = SavedStateRegistryController.create(this)
        private val viewModelStoreInstance = ViewModelStore()

        override val lifecycle: Lifecycle get() = lifecycleRegistry
        override val viewModelStore: ViewModelStore get() = viewModelStoreInstance
        override val savedStateRegistry: SavedStateRegistry get() = savedStateRegistryController.savedStateRegistry

        fun onCreate() {
            savedStateRegistryController.performRestore(Bundle())
            lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_CREATE)
        }
        fun onStart() = lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_START)
        fun onResume() = lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_RESUME)
        fun onPause() = lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_PAUSE)
        fun onStop() = lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_STOP)
        fun onDestroy() {
            lifecycleRegistry.handleLifecycleEvent(Lifecycle.Event.ON_DESTROY)
            viewModelStoreInstance.clear()
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/example/airpodspopup/BluetoothMonitorService.kt",
    name: "BluetoothMonitorService.kt",
    language: "kotlin",
    category: "kotlin",
    description: "Android 14 Foreground Service + BroadcastReceiver for ACL and persistent low battery (<15%) notification",
    content: `package com.example.airpodspopup

import android.annotation.SuppressLint
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.bluetooth.BluetoothDevice
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

class BluetoothMonitorService : Service() {

    companion object {
        private const val TAG = "BluetoothMonitorService"
        private const val NOTIFICATION_CHANNEL_ID = "airpods_monitor_channel"
        private const val LOW_BATTERY_CHANNEL_ID = "airpods_low_battery_channel"
        private const val NOTIFICATION_ID = 1001
        private const val LOW_BATTERY_NOTIFICATION_ID = 2002

        const val ACTION_START_SERVICE = "com.example.airpodspopup.ACTION_START"
        const val ACTION_STOP_SERVICE = "com.example.airpodspopup.ACTION_STOP"
        const val ACTION_TEST_POPUP = "com.example.airpodspopup.ACTION_TEST_POPUP"
        const val ACTION_TEST_LOW_BATTERY = "com.example.airpodspopup.ACTION_TEST_LOW_BATTERY"
        const val ACTION_DISMISS_LOW_BATTERY = "com.example.airpodspopup.ACTION_DISMISS_LOW_BATTERY"

        const val BATTERY_LOW_THRESHOLD = 15

        private const val EXTRA_BATTERY_LEVEL = "android.bluetooth.device.extra.BATTERY_LEVEL"
        private const val ACTION_BATTERY_CHANGED = "android.bluetooth.device.action.BATTERY_LEVEL_CHANGED"
    }

    private lateinit var overlayManager: OverlayManager
    private var isReceiverRegistered = false
    private var lastConnectedDeviceName: String = "AirPods Pro"
    private var isLowBatteryNotified = false

    private val bluetoothReceiver = object : BroadcastReceiver() {
        @SuppressLint("MissingPermission")
        override fun onReceive(context: Context?, intent: Intent?) {
            val action = intent?.action ?: return
            Log.d(TAG, "Broadcast received: $action")

            when (action) {
                BluetoothDevice.ACTION_ACL_CONNECTED -> {
                    val device: BluetoothDevice? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice::class.java)
                    } else {
                        @Suppress("DEPRECATION")
                        intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
                    }
                    handleDeviceConnected(device, intent)
                }

                ACTION_BATTERY_CHANGED -> {
                    val device: BluetoothDevice? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE, BluetoothDevice::class.java)
                    } else {
                        @Suppress("DEPRECATION")
                        intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE)
                    }
                    val battery = intent.getIntExtra(EXTRA_BATTERY_LEVEL, -1)
                    if (device != null && battery in 0..100) {
                        val name = getSafeDeviceName(device)
                        lastConnectedDeviceName = name
                        Log.d(TAG, "Battery updated for \${name}: \${battery}%")
                        evaluateBatteryThreshold(name, battery)
                    }
                }

                BluetoothDevice.ACTION_ACL_DISCONNECTED -> {
                    Log.d(TAG, "Bluetooth device disconnected")
                    cancelLowBatteryNotification()
                }

                ACTION_DISMISS_LOW_BATTERY -> {
                    Log.d(TAG, "User dismissed low battery notification")
                    cancelLowBatteryNotification()
                }

                ACTION_TEST_POPUP -> {
                    val testName = intent.getStringExtra("EXTRA_NAME") ?: "AirPods Pro"
                    val testBattery = intent.getIntExtra("EXTRA_BATTERY", 94)
                    overlayManager.showPopup(testName, testBattery)
                    evaluateBatteryThreshold(testName, testBattery)
                }

                ACTION_TEST_LOW_BATTERY -> {
                    val testName = intent.getStringExtra("EXTRA_NAME") ?: "AirPods Pro"
                    val testBattery = intent.getIntExtra("EXTRA_BATTERY", 10)
                    postLowBatteryNotification(testName, testBattery)
                }
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        overlayManager = OverlayManager(applicationContext)
        createNotificationChannels()
        startAsForegroundService()
        registerBluetoothReceiver()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP_SERVICE -> {
                cancelLowBatteryNotification()
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_TEST_POPUP -> {
                val testName = intent.getStringExtra("EXTRA_NAME") ?: "AirPods Pro"
                val testBattery = intent.getIntExtra("EXTRA_BATTERY", 94)
                overlayManager.showPopup(testName, testBattery)
                evaluateBatteryThreshold(testName, testBattery)
            }
            ACTION_TEST_LOW_BATTERY -> {
                val testName = intent.getStringExtra("EXTRA_NAME") ?: "AirPods Pro"
                val testBattery = intent.getIntExtra("EXTRA_BATTERY", 10)
                postLowBatteryNotification(testName, testBattery)
            }
            ACTION_DISMISS_LOW_BATTERY -> {
                cancelLowBatteryNotification()
            }
        }
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        unregisterBluetoothReceiver()
        cancelLowBatteryNotification()
        overlayManager.dismissCurrentPopup(immediate = true)
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun handleDeviceConnected(device: BluetoothDevice?, intent: Intent) {
        if (device == null) return
        val deviceName = getSafeDeviceName(device)
        lastConnectedDeviceName = deviceName
        val batteryLevel = extractBatteryLevel(device, intent)
        overlayManager.showPopup(deviceName, batteryLevel)
        evaluateBatteryThreshold(deviceName, batteryLevel)
    }

    private fun evaluateBatteryThreshold(deviceName: String, batteryLevel: Int) {
        if (batteryLevel in 0..BATTERY_LOW_THRESHOLD) {
            postLowBatteryNotification(deviceName, batteryLevel)
        } else if (batteryLevel > BATTERY_LOW_THRESHOLD && isLowBatteryNotified) {
            cancelLowBatteryNotification()
        }
    }

    @SuppressLint("MissingPermission")
    private fun postLowBatteryNotification(deviceName: String, batteryLevel: Int) {
        val openAppIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val dismissIntent = PendingIntent.getService(
            this,
            1,
            Intent(this, BluetoothMonitorService::class.java).apply {
                action = ACTION_DISMISS_LOW_BATTERY
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val title = "\${deviceName} Battery Low"
        val message = "Battery is at \${batteryLevel}%. Place earphones in the charging case soon."

        val lowBatteryNotification = NotificationCompat.Builder(this, LOW_BATTERY_CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText("\${message}\\n\\nActive Bluetooth audio connection may disconnect if battery is depleted.")
            )
            .setSmallIcon(android.R.drawable.stat_sys_warning)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setOngoing(true)
            .setAutoCancel(false)
            .setContentIntent(openAppIntent)
            .addAction(
                android.R.drawable.ic_menu_close_clear_cancel,
                "Dismiss",
                dismissIntent
            )
            .build()

        try {
            val notificationManager = NotificationManagerCompat.from(this)
            notificationManager.notify(LOW_BATTERY_NOTIFICATION_ID, lowBatteryNotification)
            isLowBatteryNotified = true
        } catch (e: Exception) {
            Log.w(TAG, "Failed to post low battery notification: \${e.message}")
        }
    }

    private fun cancelLowBatteryNotification() {
        try {
            val notificationManager = NotificationManagerCompat.from(this)
            notificationManager.cancel(LOW_BATTERY_NOTIFICATION_ID)
            isLowBatteryNotified = false
        } catch (e: Exception) {
            Log.w(TAG, "Failed to cancel low battery notification: \${e.message}")
        }
    }

    @SuppressLint("MissingPermission")
    private fun getSafeDeviceName(device: BluetoothDevice): String {
        return try {
            val name = device.name
            if (!name.isNullOrBlank()) name else "Bluetooth Earphones"
        } catch (e: SecurityException) {
            Log.w(TAG, "BLUETOOTH_CONNECT permission missing: \${e.message}")
            "Bluetooth Earphones"
        }
    }

    private fun extractBatteryLevel(device: BluetoothDevice, intent: Intent): Int {
        val extraLevel = intent.getIntExtra(EXTRA_BATTERY_LEVEL, -1)
        if (extraLevel in 0..100) return extraLevel

        try {
            val method = device.javaClass.getMethod("getBatteryLevel")
            val result = method.invoke(device) as? Int
            if (result != null && result in 0..100) return result
        } catch (_: Exception) {}

        return 92
    }

    private fun registerBluetoothReceiver() {
        if (isReceiverRegistered) return
        val filter = IntentFilter().apply {
            addAction(BluetoothDevice.ACTION_ACL_CONNECTED)
            addAction(BluetoothDevice.ACTION_ACL_DISCONNECTED)
            addAction(ACTION_BATTERY_CHANGED)
            addAction(ACTION_TEST_POPUP)
            addAction(ACTION_TEST_LOW_BATTERY)
            addAction(ACTION_DISMISS_LOW_BATTERY)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(bluetoothReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(bluetoothReceiver, filter)
        }
        isReceiverRegistered = true
    }

    private fun unregisterBluetoothReceiver() {
        if (!isReceiverRegistered) return
        try {
            unregisterReceiver(bluetoothReceiver)
        } catch (e: Exception) {
            Log.e(TAG, "Error unregistering receiver: \${e.message}")
        }
        isReceiverRegistered = false
    }

    private fun startAsForegroundService() {
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification: Notification = NotificationCompat.Builder(this, NOTIFICATION_CHANNEL_ID)
            .setContentTitle("AirPods Card Monitor Active")
            .setContentText("Monitoring Bluetooth device connections in the background")
            .setSmallIcon(android.R.drawable.stat_sys_data_bluetooth)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(pendingIntent)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_CONNECTED_DEVICE
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(NotificationManager::class.java)

            val monitorChannel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "Bluetooth Audio Overlay Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps connection monitor active to trigger AirPods card on connect"
                setShowBadge(false)
            }
            manager?.createNotificationChannel(monitorChannel)

            val lowBatteryChannel = NotificationChannel(
                LOW_BATTERY_CHANNEL_ID,
                "AirPods Low Battery Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Persistent alert when connected earphone battery falls below 15%"
                enableVibration(true)
                setShowBadge(true)
            }
            manager?.createNotificationChannel(lowBatteryChannel)
        }
    }
}`
  },
  {
    path: "app/src/main/java/com/example/airpodspopup/MainActivity.kt",
    name: "MainActivity.kt",
    language: "kotlin",
    category: "kotlin",
    description: "App launcher: permission checks, low-battery alert triggers, Sandbox simulator, and service toggle",
    content: `package com.example.airpodspopup

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.BatteryAlert
import androidx.compose.material.icons.rounded.Bluetooth
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Layers
import androidx.compose.material.icons.rounded.Notifications
import androidx.compose.material.icons.rounded.Visibility
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import kotlin.math.roundToInt

class MainActivity : ComponentActivity() {

    private val requestBluetoothPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { }

    private val requestNotificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            AppDashboard(
                onRequestOverlayPermission = { requestOverlayPermission() },
                onRequestBluetoothPermission = { requestBluetoothPermission() },
                onRequestNotificationPermission = { requestNotificationPermission() },
                onTriggerTestPopupOverHomeScreen = { name, battery ->
                    triggerTestPopupOverHomeScreen(name, battery)
                },
                onTriggerTestLowBattery = { name, battery -> triggerTestLowBattery(name, battery) },
                onToggleService = { enable -> toggleService(enable) }
            )
        }
    }

    private fun requestOverlayPermission() {
        if (!Settings.canDrawOverlays(this)) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            )
            startActivity(intent)
        }
    }

    private fun requestBluetoothPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            requestBluetoothPermissionLauncher.launch(Manifest.permission.BLUETOOTH_CONNECT)
        }
    }

    private fun requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    /**
     * Minimizes this Activity to the real Android Home Screen / Launcher,
     * then injects the WindowManager overlay over the physical display.
     */
    private fun triggerTestPopupOverHomeScreen(name: String, battery: Int) {
        val overlayManager = OverlayManager(applicationContext)
        if (!overlayManager.canDrawOverlays()) {
            requestOverlayPermission()
            return
        }

        // Minimize this activity so real home screen or background app is visible
        moveTaskToBack(true)

        Handler(Looper.getMainLooper()).postDelayed({
            overlayManager.showPopup(name, battery)
        }, 250L)
    }

    private fun triggerTestLowBattery(name: String, battery: Int) {
        val serviceIntent = Intent(this, BluetoothMonitorService::class.java).apply {
            action = BluetoothMonitorService.ACTION_TEST_LOW_BATTERY
            putExtra("EXTRA_NAME", name)
            putExtra("EXTRA_BATTERY", battery)
        }
        ContextCompat.startForegroundService(this, serviceIntent)
    }

    private fun toggleService(enable: Boolean) {
        val serviceIntent = Intent(this, BluetoothMonitorService::class.java).apply {
            action = if (enable) {
                BluetoothMonitorService.ACTION_START_SERVICE
            } else {
                BluetoothMonitorService.ACTION_STOP_SERVICE
            }
        }
        if (enable) {
            ContextCompat.startForegroundService(this, serviceIntent)
        } else {
            startService(serviceIntent)
        }
    }
}

@Composable
fun AppDashboard(
    onRequestOverlayPermission: () -> Unit,
    onRequestBluetoothPermission: () -> Unit,
    onRequestNotificationPermission: () -> Unit,
    onTriggerTestPopupOverHomeScreen: (String, Int) -> Unit,
    onTriggerTestLowBattery: (String, Int) -> Unit,
    onToggleService: (Boolean) -> Unit
) {
    val context = LocalContext.current
    var hasOverlayPermission by remember { mutableStateOf(false) }
    var hasBluetoothPermission by remember { mutableStateOf(false) }
    var hasNotificationPermission by remember { mutableStateOf(false) }
    var isServiceRunning by remember { mutableStateOf(false) }

    var customDeviceName by remember { mutableStateOf("AirPods Pro") }
    var customBatteryLevel by remember { mutableFloatStateOf(94f) }

    fun checkPermissions() {
        hasOverlayPermission = Settings.canDrawOverlays(context)
        hasBluetoothPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.BLUETOOTH_CONNECT
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
        hasNotificationPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
    }

    LaunchedEffect(Unit) {
        checkPermissions()
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color(0xFFF2F2F7)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 24.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF0071E3)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Bluetooth,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(26.dp)
                    )
                }
                Spacer(modifier = Modifier.width(14.dp))
                Column {
                    Text(
                        text = "AirPods Card for Android",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1D1D1F)
                    )
                    Text(
                        text = "iOS Connection Animation & Low-Battery Alerts",
                        fontSize = 13.sp,
                        color = Color(0xFF86868B)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Procedural 3D Canvas Preview",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF1D1D1F)
                    )
                    Text(
                        text = "Zero bitmap images • 100% Vector & Gradients",
                        fontSize = 12.sp,
                        color = Color(0xFF86868B)
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        EarbudCanvasVisual(size = 120.dp, isLeft = true)
                        Spacer(modifier = Modifier.width(8.dp))
                        EarbudCanvasVisual(size = 120.dp, isLeft = false)
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "SYSTEM PERMISSIONS",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF6E6E73),
                modifier = Modifier.padding(start = 6.dp, bottom = 8.dp)
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    PermissionRow(
                        title = "Draw Over Other Apps",
                        subtitle = "Required for the floating popup card",
                        icon = Icons.Rounded.Layers,
                        isGranted = hasOverlayPermission,
                        onRequest = onRequestOverlayPermission
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    PermissionRow(
                        title = "Bluetooth Connect",
                        subtitle = "Detects connected earphones & battery",
                        icon = Icons.Rounded.Bluetooth,
                        isGranted = hasBluetoothPermission,
                        onRequest = onRequestBluetoothPermission
                    )

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        Spacer(modifier = Modifier.height(14.dp))
                        PermissionRow(
                            title = "Notifications",
                            subtitle = "Maintains monitor & persistent low battery alert",
                            icon = Icons.Rounded.Notifications,
                            isGranted = hasNotificationPermission,
                            onRequest = onRequestNotificationPermission
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Background Earbud Listener",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF1D1D1F)
                        )
                        Text(
                            text = if (isServiceRunning) "Monitoring connection & low battery (< 15%)" else "Service is stopped",
                            fontSize = 13.sp,
                            color = if (isServiceRunning) Color(0xFF34C759) else Color(0xFF86868B)
                        )
                    }

                    Switch(
                        checked = isServiceRunning,
                        onCheckedChange = { checked ->
                            isServiceRunning = checked
                            onToggleService(checked)
                        },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = Color(0xFF34C759)
                        )
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "LOW BATTERY ALERT SYSTEM (< 15%)",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF6E6E73),
                modifier = Modifier.padding(start = 6.dp, bottom = 8.dp)
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(Color(0xFFFFF4E5)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.BatteryAlert,
                                contentDescription = null,
                                tint = Color(0xFFFF9500),
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Persistent Low-Battery Notification",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF1D1D1F)
                            )
                            Text(
                                text = "Triggers even when connection card is not active",
                                fontSize = 12.sp,
                                color = Color(0xFF86868B)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "When battery drops below 15%, a high-priority system notification informs you with actions to charge or open the app.",
                        fontSize = 13.sp,
                        color = Color(0xFF48484A),
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = {
                            onTriggerTestLowBattery(customDeviceName, 10)
                        },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFFF9500),
                            contentColor = Color.White
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.Notifications,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Test Low Battery Notification (10%)",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "SANDBOX TESTER",
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF6E6E73),
                modifier = Modifier.padding(start = 6.dp, bottom = 8.dp)
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "Device Simulation Parameters",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF1D1D1F)
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = customDeviceName,
                        onValueChange = { customDeviceName = it },
                        label = { Text("Earphone Name") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFF0071E3),
                            unfocusedBorderColor = Color(0xFFE5E5EA)
                        )
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Simulated Battery Level",
                            fontSize = 14.sp,
                            color = Color(0xFF1D1D1F)
                        )
                        val isCritical = customBatteryLevel <= 15f
                        val isLow = customBatteryLevel <= 20f
                        Text(
                            text = "\${customBatteryLevel.roundToInt()}%" + if (isCritical) " (Alert < 15%)" else if (isLow) " (Low)" else "",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = when {
                                isCritical -> Color(0xFFFF3B30)
                                isLow -> Color(0xFFFF9500)
                                else -> Color(0xFF34C759)
                            }
                        )
                    }

                    Slider(
                        value = customBatteryLevel,
                        onValueChange = { customBatteryLevel = it },
                        valueRange = 0f..100f,
                        colors = SliderDefaults.colors(
                            thumbColor = if (customBatteryLevel <= 15) Color(0xFFFF3B30) else Color(0xFF0071E3),
                            activeTrackColor = if (customBatteryLevel <= 15) Color(0xFFFF3B30) else Color(0xFF0071E3)
                        )
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { customBatteryLevel = 10f },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Quick 10% (Alert)", fontSize = 12.sp)
                        }
                        OutlinedButton(
                            onClick = { customBatteryLevel = 90f },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Quick 90%", fontSize = 12.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = {
                            onTriggerTestPopupOverHomeScreen(
                                customDeviceName,
                                customBatteryLevel.roundToInt()
                            )
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF0071E3)
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.Visibility,
                            contentDescription = null,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Test Floating Popup (Overlay)",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(30.dp))
        }
    }
}

@Composable
private fun PermissionRow(
    title: String,
    subtitle: String,
    icon: ImageVector,
    isGranted: Boolean,
    onRequest: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            modifier = Modifier.weight(1f),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(if (isGranted) Color(0x1A34C759) else Color(0x1AFF9500)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = if (isGranted) Color(0xFF34C759) else Color(0xFFFF9500),
                    modifier = Modifier.size(22.dp)
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = title,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF1D1D1F)
                )
                Text(
                    text = subtitle,
                    fontSize = 12.sp,
                    color = Color(0xFF86868B)
                )
            }
        }

        if (isGranted) {
            Icon(
                imageVector = Icons.Rounded.CheckCircle,
                contentDescription = "Granted",
                tint = Color(0xFF34C759),
                modifier = Modifier.size(24.dp)
            )
        } else {
            Button(
                onClick = onRequest,
                shape = CircleShape,
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFE5E5EA),
                    contentColor = Color(0xFF0071E3)
                ),
                elevation = ButtonDefaults.buttonElevation(defaultElevation = 0.dp)
            ) {
                Text(
                    text = "Grant",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}`
  }
];
