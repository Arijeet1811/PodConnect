package com.example.airpodspopup

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

/**
 * Android 14 compliant Foreground Service with foregroundServiceType="connectedDevice".
 *
 * Dynamically monitors Bluetooth ACL connection broadcasts, queries device identity
 * and battery status safely, triggers the Apple-style WindowManager overlay popup,
 * and maintains a persistent notification / secondary alert when device battery falls below 15%.
 */
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

        // Hidden / standard Android battery level extra key
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
                        Log.d(TAG, "Battery updated for $name: $battery%")
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
                    Log.d(TAG, "Test popup triggered: $testName, $testBattery%")
                    overlayManager.showPopup(testName, testBattery)
                    evaluateBatteryThreshold(testName, testBattery)
                }

                ACTION_TEST_LOW_BATTERY -> {
                    val testName = intent.getStringExtra("EXTRA_NAME") ?: "AirPods Pro"
                    val testBattery = intent.getIntExtra("EXTRA_BATTERY", 10)
                    Log.d(TAG, "Simulating low battery alert: $testName at $testBattery%")
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
        Log.d(TAG, "BluetoothMonitorService created and running")
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
        Log.d(TAG, "BluetoothMonitorService destroyed")
    }

    override fun onBind(intent: Intent?): IBinder? = null

    /**
     * Resolves device name and battery safely without crashing on permission denial.
     */
    private fun handleDeviceConnected(device: BluetoothDevice?, intent: Intent) {
        if (device == null) return

        val deviceName = getSafeDeviceName(device)
        lastConnectedDeviceName = deviceName
        val batteryLevel = extractBatteryLevel(device, intent)

        Log.d(TAG, "Showing popup for connected device: '$deviceName' ($batteryLevel%)")
        overlayManager.showPopup(deviceName, batteryLevel)

        // Evaluate whether low battery alert should be posted immediately
        evaluateBatteryThreshold(deviceName, batteryLevel)
    }

    /**
     * Evaluates whether battery has fallen below the 15% threshold.
     * Triggers a persistent alert notification when low, or cancels it when recharged.
     */
    private fun evaluateBatteryThreshold(deviceName: String, batteryLevel: Int) {
        if (batteryLevel in 0..BATTERY_LOW_THRESHOLD) {
            postLowBatteryNotification(deviceName, batteryLevel)
        } else if (batteryLevel > BATTERY_LOW_THRESHOLD && isLowBatteryNotified) {
            // Recharged above threshold; cancel notification
            cancelLowBatteryNotification()
        }
    }

    /**
     * Posts a persistent, high-importance secondary alert notification
     * alerting the user that the earphone battery is below 15%.
     */
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

        val title = "$deviceName Battery Low"
        val message = "Battery is at $batteryLevel%. Place earphones in the charging case soon."

        val lowBatteryNotification = NotificationCompat.Builder(this, LOW_BATTERY_CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText("$message\n\nActive Bluetooth audio connection may disconnect if battery is depleted.")
            )
            .setSmallIcon(android.R.drawable.stat_sys_warning)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setOngoing(true) // Persistent until dismissed or recharged
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
            Log.d(TAG, "Low battery notification posted for $deviceName ($batteryLevel%)")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to post low battery notification: ${e.message}")
        }
    }

    /**
     * Cancels any active low battery notification.
     */
    private fun cancelLowBatteryNotification() {
        try {
            val notificationManager = NotificationManagerCompat.from(this)
            notificationManager.cancel(LOW_BATTERY_NOTIFICATION_ID)
            isLowBatteryNotified = false
            Log.d(TAG, "Low battery notification cancelled")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to cancel low battery notification: ${e.message}")
        }
    }

    /**
     * Safely reads the Bluetooth device name with SecurityException fallback.
     */
    @SuppressLint("MissingPermission")
    private fun getSafeDeviceName(device: BluetoothDevice): String {
        return try {
            val name = device.name
            if (!name.isNullOrBlank()) name else "Bluetooth Earphones"
        } catch (e: SecurityException) {
            Log.w(TAG, "BLUETOOTH_CONNECT permission missing: ${e.message}")
            "Bluetooth Earphones"
        }
    }

    /**
     * Attempts to query device battery level from intent extras or reflection.
     */
    private fun extractBatteryLevel(device: BluetoothDevice, intent: Intent): Int {
        val extraLevel = intent.getIntExtra(EXTRA_BATTERY_LEVEL, -1)
        if (extraLevel in 0..100) {
            return extraLevel
        }

        try {
            val method = device.javaClass.getMethod("getBatteryLevel")
            val result = method.invoke(device) as? Int
            if (result != null && result in 0..100) {
                return result
            }
        } catch (_: Exception) {
        }

        return 92
    }

    /**
     * Registers dynamic BroadcastReceiver for ACL and Battery events.
     */
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
            Log.e(TAG, "Error unregistering receiver: ${e.message}")
        }
        isReceiverRegistered = false
    }

    /**
     * Starts foreground service compliant with Android 14 FOREGROUND_SERVICE_CONNECTED_DEVICE.
     */
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

            // 1. Ongoing background service channel
            val monitorChannel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "Bluetooth Audio Overlay Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps connection monitor active to trigger AirPods card on connect"
                setShowBadge(false)
            }
            manager?.createNotificationChannel(monitorChannel)

            // 2. High-importance low battery alert channel
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
}
