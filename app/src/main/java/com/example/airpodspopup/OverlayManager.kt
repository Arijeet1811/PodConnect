package com.example.airpodspopup

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

/**
 * Manages direct injection and dismissal of the Jetpack Compose AirPods popup
 * into the real Android WindowManager service using TYPE_APPLICATION_OVERLAY.
 *
 * Runs over any screen: Android Home Screen, System Launcher, and third-party apps.
 * Implements full Lifecycle, SavedStateRegistry, and ViewModelStore bridges
 * so ComposeView executes stably outside an Activity from a background Service.
 */
class OverlayManager(private val context: Context) {

    companion object {
        private const val TAG = "OverlayManager"
        private const val AUTO_DISMISS_DELAY_MS = 5500L // 5.5s Apple auto-dismiss timer
    }

    private val windowManager: WindowManager =
        context.getSystemService(Context.WINDOW_SERVICE) as WindowManager

    private val mainHandler = Handler(Looper.getMainLooper())

    private var activeComposeView: ComposeView? = null
    private var activeLifecycleBridge: OverlayLifecycleBridge? = null
    private var autoDismissRunnable: Runnable? = null

    /**
     * Verifies if the app has permission to draw system overlays (SYSTEM_ALERT_WINDOW).
     */
    fun canDrawOverlays(): Boolean {
        return Settings.canDrawOverlays(context)
    }

    /**
     * Injects the floating iOS-style AirPods card directly onto the phone screen
     * using Android WindowManager TYPE_APPLICATION_OVERLAY.
     */
    fun showPopup(deviceName: String, batteryLevel: Int) {
        if (!canDrawOverlays()) {
            Log.w(TAG, "Cannot show overlay: SYSTEM_ALERT_WINDOW permission not granted")
            return
        }

        // Must run on the Main UI thread
        mainHandler.post {
            // Dismiss any pre-existing overlay cleanly
            dismissCurrentPopup(immediate = true)

            try {
                // Construct dedicated Lifecycle and SavedState bridge for Compose outside Activity
                val bridge = OverlayLifecycleBridge().apply {
                    onCreate()
                    onStart()
                    onResume()
                }
                activeLifecycleBridge = bridge

                val composeView = ComposeView(context).apply {
                    // Set fully transparent native background
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

                // WindowManager Layout Parameters:
                // - TYPE_APPLICATION_OVERLAY: Draws above all apps and launcher
                // - FLAG_NOT_FOCUSABLE: Does not trap key events or navigation
                // - FLAG_LAYOUT_IN_SCREEN: Extends to display boundaries
                // - PixelFormat.TRANSLUCENT: Entire background is 100% transparent
                // - Gravity.BOTTOM: Anchors card to the bottom of the real physical display
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
                Log.d(TAG, "Real WindowManager overlay attached successfully over system screen")

                // Schedule 5.5-second auto dismiss timer
                scheduleAutoDismiss()

            } catch (e: Exception) {
                Log.e(TAG, "Failed to attach overlay to WindowManager: ${e.message}", e)
                dismissCurrentPopup(immediate = true)
            }
        }
    }

    /**
     * Schedules the automatic 5.5-second dismissal timer on the Main Looper.
     */
    private fun scheduleAutoDismiss() {
        cancelAutoDismiss()
        val runnable = Runnable {
            Log.d(TAG, "Auto-dismiss timer elapsed (5.5s)")
            dismissCurrentPopup(immediate = false)
        }
        autoDismissRunnable = runnable
        mainHandler.postDelayed(runnable, AUTO_DISMISS_DELAY_MS)
    }

    /**
     * Cancels any pending auto-dismiss runnable.
     */
    private fun cancelAutoDismiss() {
        autoDismissRunnable?.let {
            mainHandler.removeCallbacks(it)
            autoDismissRunnable = null
        }
    }

    /**
     * Removes and unmounts the Compose overlay view from WindowManager.
     */
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
                Log.e(TAG, "Error removing overlay view: ${e.message}", e)
            } finally {
                activeComposeView = null
                activeLifecycleBridge = null
            }
        }

        if (immediate) {
            cleanupBlock()
        } else {
            // Short delay to allow Compose slide-down exit animation to complete
            mainHandler.postDelayed({ cleanupBlock() }, 360L)
        }
    }

    /**
     * Custom LifecycleOwner, SavedStateRegistryOwner, and ViewModelStoreOwner
     * bridge specifically engineered to host ComposeView inside WindowManager.
     */
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
}
