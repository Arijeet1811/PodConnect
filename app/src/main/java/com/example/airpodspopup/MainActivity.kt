package com.example.airpodspopup

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
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
import androidx.compose.material.icons.rounded.PlayArrow
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
     * Minimizes the Activity back to the real Android Home Screen / Launcher,
     * then attaches the WindowManager overlay so the user sees the real popup
     * directly over their real Android phone screen.
     */
    private fun triggerTestPopupOverHomeScreen(name: String, battery: Int) {
        val overlayManager = OverlayManager(applicationContext)
        if (!overlayManager.canDrawOverlays()) {
            requestOverlayPermission()
            return
        }

        // Minimize this activity to show real home screen underneath
        moveTaskToBack(true)

        // Delay 250ms so launcher animation settles, then inject real WindowManager overlay
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
            // Header
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
                        text = "AirPods Popup for Android",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1D1D1F)
                    )
                    Text(
                        text = "Real WindowManager Overlay (TYPE_APPLICATION_OVERLAY)",
                        fontSize = 13.sp,
                        color = Color(0xFF86868B)
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Procedural Canvas Component Display
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
                        text = "Procedural 3D Canvas Vector Earbud",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF1D1D1F)
                    )
                    Text(
                        text = "Zero bitmap images • Rendered purely with Compose Canvas",
                        fontSize = 12.sp,
                        color = Color(0xFF86868B)
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Row(
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        EarbudCanvasVisual(size = 130.dp, isLeft = true)
                        Spacer(modifier = Modifier.width(12.dp))
                        EarbudCanvasVisual(size = 130.dp, isLeft = false)
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // System Permissions Section
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
                        subtitle = "Required for WindowManager system overlay",
                        icon = Icons.Rounded.Layers,
                        isGranted = hasOverlayPermission,
                        onRequest = onRequestOverlayPermission
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    PermissionRow(
                        title = "Bluetooth Connect",
                        subtitle = "Detects connected earphones and battery",
                        icon = Icons.Rounded.Bluetooth,
                        isGranted = hasBluetoothPermission,
                        onRequest = onRequestBluetoothPermission
                    )

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        Spacer(modifier = Modifier.height(14.dp))
                        PermissionRow(
                            title = "Notifications",
                            subtitle = "Maintains Foreground Service and alerts",
                            icon = Icons.Rounded.Notifications,
                            isGranted = hasNotificationPermission,
                            onRequest = onRequestNotificationPermission
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Background Service Control Card
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
                            text = "Background Bluetooth Monitor",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF1D1D1F)
                        )
                        Text(
                            text = if (isServiceRunning) "Actively listening for ACL connections & low battery" else "Service is stopped",
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

            // Test Real Overlay on Home Screen
            Text(
                text = "REAL SYSTEM OVERLAY TEST",
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
                        text = "Test Real Overlay on Android OS",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF1D1D1F)
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Tapping below minimizes this activity and immediately triggers the real WindowManager overlay over your phone's Home Screen / Launcher.",
                        fontSize = 13.sp,
                        color = Color(0xFF6E6E73),
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))

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

                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Battery Level",
                            fontSize = 14.sp,
                            color = Color(0xFF1D1D1F)
                        )
                        Text(
                            text = "${customBatteryLevel.roundToInt()}%",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (customBatteryLevel <= 15) Color(0xFFFF3B30) else if (customBatteryLevel <= 20) Color(0xFFFF9500) else Color(0xFF34C759)
                        )
                    }

                    Slider(
                        value = customBatteryLevel,
                        onValueChange = { customBatteryLevel = it },
                        valueRange = 0f..100f,
                        colors = SliderDefaults.colors(
                            thumbColor = Color(0xFF0071E3),
                            activeTrackColor = Color(0xFF0071E3)
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
                            Text("Set 10% (Low Alert)", fontSize = 12.sp)
                        }
                        OutlinedButton(
                            onClick = { customBatteryLevel = 94f },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Set 94%", fontSize = 12.sp)
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
                            .height(52.dp),
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
                            text = "Test Real Overlay (Minimize to Launcher)",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Button(
                        onClick = {
                            onTriggerTestLowBattery(customDeviceName, 10)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(44.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFFF9500)
                        )
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.BatteryAlert,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Test Persistent Low-Battery Notification (10%)",
                            fontSize = 13.sp,
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
}
