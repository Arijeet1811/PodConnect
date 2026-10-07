package com.example.airpodspopup

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
import androidx.compose.ui.draw.clip
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

/**
 * System-Level Apple AirPods Connection Card rendered into Android WindowManager.
 *
 * Requirements:
 * - 100% Transparent Root: No scrim or black backdrop; the real Android OS / launcher is visible.
 * - Anchored to Gravity.BOTTOM of the physical smartphone screen.
 * - Ultra-smooth sine-wave hovering animation for procedural 3D earbud visual.
 * - Dynamic ground shadow scaling based on vertical elevation.
 * - White squircle card with soft elevation shadow.
 * - Secondary UI low-battery alert state when battery <= 15%.
 * - Taptic click haptic feedback on dismissal.
 */
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

    // Root layout: Completely transparent background so real Android OS remains 100% visible
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

    // Sine-wave floating vertical offset animation
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

    // The ONLY visible element: Apple squircle white floating card
    Surface(
        modifier = Modifier
            .padding(horizontal = 20.dp, vertical = 28.dp)
            .fillMaxWidth()
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                onClick = { /* Consume clicks so card doesn't dismiss itself */ }
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
            // Device Name
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

            // Low-Battery Warning Chip
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

            // Procedural 3D Earbuds & Hover Physics
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp),
                contentAlignment = Alignment.Center
            ) {
                // Dynamic ground shadow that expands/contracts with vertical hover
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

                // Dual procedural earbuds hovering together
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

            // iOS-Style Battery Pill Capsule
            BatteryCapsule(batteryLevel = batteryLevel)

            Spacer(modifier = Modifier.height(24.dp))

            // "Done" Dismiss Button
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

/**
 * iOS-styled battery status capsule indicator.
 */
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
            text = "$displayPercent%",
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = if (isCritical) Color(0xFFD70015) else Color(0xFF1D1D1F)
        )
    }
}

/**
 * Produces an Apple-like taptic click haptic feedback on Android.
 */
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
}
