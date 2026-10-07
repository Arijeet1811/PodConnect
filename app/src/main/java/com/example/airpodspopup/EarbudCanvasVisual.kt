package com.example.airpodspopup

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
import androidx.compose.ui.graphics.drawscope.rotate
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
    // Procedural bezier path for the organically sculpted in-ear chamber
    val headPath = Path().apply {
        // Start near the stem neck junction
        moveTo(stemLeft, stemTop + 4f * scale)
        // Sweep out to lower ear lobe cushion
        cubicTo(
            stemLeft - 22f * scale, stemTop + 6f * scale,
            headCenterX - headRadiusX - 10f * scale, headCenterY + 18f * scale,
            headCenterX - headRadiusX, headCenterY + 4f * scale
        )
        // Sweep over acoustic tip towards outer curvature
        cubicTo(
            headCenterX - headRadiusX + 4f * scale, headCenterY - headRadiusY + 4f * scale,
            headCenterX - 18f * scale, headCenterY - headRadiusY,
            headCenterX, headCenterY - headRadiusY
        )
        // Sweep around top crown
        cubicTo(
            headCenterX + 28f * scale, headCenterY - headRadiusY,
            headCenterX + headRadiusX + 6f * scale, headCenterY - 14f * scale,
            headCenterX + headRadiusX, headCenterY + 8f * scale
        )
        // Sweep down back toward stem neck
        cubicTo(
            headCenterX + headRadiusX - 4f * scale, headCenterY + 28f * scale,
            stemLeft + stemWidth + 6f * scale, stemTop - 2f * scale,
            stemLeft + stemWidth, stemTop + 8f * scale
        )
        close()
    }

    // Volumetric 3D Radial Brush simulating spherical gloss & studio bounce light
    val headVolumeBrush = Brush.radialGradient(
        colors = listOf(
            Color(0xFFFFFFFF), // Specular light highlight spot
            Color(0xFFF7F8FA), // Upper body shine
            Color(0xFFECEFF2), // Acoustic body midtone
            Color(0xFFD6DBE2)  // Deep perimeter drop shadow
        ),
        center = Offset(headCenterX - 8f * scale, headCenterY - 12f * scale),
        radius = headRadiusX * 1.35f
    )
    drawPath(path = headPath, brush = headVolumeBrush)

    // Head subtle ambient perimeter outline
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

    // Elliptical speaker port base (dark recessed cavity)
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

    // Metallic speaker mesh gradient
    val meshBrush = Brush.radialGradient(
        colors = listOf(
            Color(0xFF383A3D), // Mesh center specular glint
            Color(0xFF1E2022), // Acoustic woven mesh dark gray
            Color(0xFF111213)  // Deep interior cavity black
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

    // Acoustic grill perimeter silver bezel ring
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

    drawPath(
        path = topVentPath,
        color = Color(0xFF222428)
    )
    drawPath(
        path = topVentPath,
        color = Color(0x22FFFFFF),
        style = Stroke(width = 0.6f * scale)
    )

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

    // 8. GLOSSY SPECULAR HIGHLIGHT CURVES (Apple signature sheen)
    // Primary gloss highlight along the curvature
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

    // Secondary stem linear gloss highlight line
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
}
