import React, { useState } from 'react';
import {
  Code2,
  Download,
  Copy,
  Check,
  Layers,
  Bluetooth,
  Cpu,
  Github,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  Terminal,
  Radio,
  Sliders,
  ExternalLink
} from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { PROJECT_FILES } from './projectFiles';

// Procedural 3D Earbud Vector Canvas Display (Standalone, no fake phone)
const ProceduralEarbudCanvas: React.FC<{
  isLeft?: boolean;
  scale?: number;
}> = ({ isLeft = false, scale = 1 }) => {
  return (
    <div
      style={{
        transform: `${isLeft ? 'scaleX(-1)' : 'scaleX(1)'} scale(${scale})`,
        transformOrigin: 'center center',
      }}
      className="relative w-40 h-48 select-none pointer-events-none drop-shadow-md"
    >
      <svg
        viewBox="0 0 200 220"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`stemGrad-${isLeft ? 'l' : 'r'}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DFE2E6" />
            <stop offset="18%" stopColor="#FFFFFF" />
            <stop offset="45%" stopColor="#F8F9FA" />
            <stop offset="78%" stopColor="#EDF0F4" />
            <stop offset="100%" stopColor="#D5D9E0" />
          </linearGradient>

          <linearGradient id={`chromeGrad-${isLeft ? 'l' : 'r'}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B4BAC2" />
            <stop offset="25%" stopColor="#ECEEF0" />
            <stop offset="55%" stopColor="#8A9098" />
            <stop offset="85%" stopColor="#E0E4E8" />
            <stop offset="100%" stopColor="#767C84" />
          </linearGradient>

          <radialGradient
            id={`headVolume-${isLeft ? 'l' : 'r'}`}
            cx="44%"
            cy="36%"
            r="60%"
            fx="38%"
            fy="30%"
          >
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#F9FAFC" />
            <stop offset="70%" stopColor="#ECEFF3" />
            <stop offset="100%" stopColor="#D2D7DF" />
          </radialGradient>

          <radialGradient id={`meshGrad-${isLeft ? 'l' : 'r'}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3A3D42" />
            <stop offset="65%" stopColor="#1E2023" />
            <stop offset="100%" stopColor="#101112" />
          </radialGradient>

          <linearGradient id={`glossCurve-${isLeft ? 'l' : 'r'}`} x1="0%" y1="0%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d="M 104 80 L 118 80 L 110 188 L 96 188 Z" fill="rgba(0,0,0,0.06)" />

        <rect
          x="100"
          y="74"
          width="20"
          height="115"
          rx="10"
          ry="10"
          fill={`url(#stemGrad-${isLeft ? 'l' : 'r'})`}
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="0.8"
        />

        <rect
          x="100"
          y="176"
          width="20"
          height="13"
          rx="6.5"
          ry="6.5"
          fill={`url(#chromeGrad-${isLeft ? 'l' : 'r'})`}
        />
        <rect x="102" y="185" width="16" height="1.4" rx="0.7" fill="#2C2E31" />
        <circle cx="110" cy="187.5" r="2.2" fill="#1C1E20" />

        <line
          x1="104"
          y1="82"
          x2="104"
          y2="170"
          stroke="rgba(255,255,255,0.85)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        <rect x="102.5" y="98" width="4.5" height="12" rx="2.25" fill="#323438" opacity="0.95" />

        <path
          d="M 100 80 C 74 84, 52 74, 52 56 C 52 32, 82 22, 114 22 C 152 22, 168 38, 166 64 C 164 88, 126 84, 120 84 Z"
          fill={`url(#headVolume-${isLeft ? 'l' : 'r'})`}
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="0.9"
        />

        <ellipse
          cx="76"
          cy="56"
          rx="15"
          ry="20"
          fill={`url(#meshGrad-${isLeft ? 'l' : 'r'})`}
          stroke="#9CA3AF"
          strokeWidth="1.2"
          strokeOpacity="0.3"
        />

        <g fill="rgba(255,255,255,0.45)">
          <circle cx="72" cy="50" r="0.9" />
          <circle cx="76" cy="48" r="0.9" />
          <circle cx="80" cy="50" r="0.9" />
          <circle cx="70" cy="56" r="0.9" />
          <circle cx="76" cy="56" r="1.1" />
          <circle cx="82" cy="56" r="0.9" />
          <circle cx="72" cy="62" r="0.9" />
          <circle cx="76" cy="64" r="0.9" />
          <circle cx="80" cy="62" r="0.9" />
        </g>

        <rect
          x="126"
          y="32"
          width="16"
          height="5.5"
          rx="2.75"
          fill="#232528"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="0.6"
        />

        <path
          d="M 95 28 C 114 26, 142 32, 154 52"
          fill="none"
          stroke={`url(#glossCurve-${isLeft ? 'l' : 'r'})`}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'architecture' | 'code' | 'cicd'>('architecture');
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(8); // Default: OverlayManager.kt
  const [copiedFile, setCopiedFile] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const copyCurrentFileCode = () => {
    const file = PROJECT_FILES[selectedFileIndex];
    navigator.clipboard.writeText(file.content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const downloadProjectZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      PROJECT_FILES.forEach((f) => {
        zip.file(f.path, f.content);
      });

      zip.file(
        ".gitignore",
        `*.iml\n.gradle\n/local.properties\n/.idea\n.DS_Store\n/build\n/captures\n.externalNativeBuild\n.cxx\nlocal.properties\n`
      );

      zip.file(
        "gradlew",
        `#!/bin/sh
PRG="$0"
while [ -h "$PRG" ] ; do
    ls=\`ls -ld "$PRG"\`
    link=\`expr "$ls" : '.*-> \\(.*\\)$'\`
    if expr "$link" : '/.*' > /dev/null; then
        PRG="$link"
    else
        PRG=\`dirname "$PRG"\`"/$link"
    fi
done
APP_HOME=\`pwd -P\`
CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar
exec java -classpath "$CLASSPATH" org.gradle.wrapper.GradleWrapperMain "$@"
`,
        { unixPermissions: "755" }
      );

      zip.file(
        "gradlew.bat",
        `@if "%DEBUG%" == "" @echo off
set DIRNAME=%~dp0
set APP_HOME=%DIRNAME%
set CLASSPATH=%APP_HOME%\\gradle\\wrapper\\gradle-wrapper.jar
java -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*
`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = "AirPodsPopupAndroid-master.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {
      console.error("ZIP creation failed", e);
    } finally {
      setIsZipping(false);
    }
  };

  const currentFile = PROJECT_FILES[selectedFileIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-tight">
                  AirPods Popup for Android
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                  TYPE_APPLICATION_OVERLAY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real System-Level WindowManager Overlay • Android 14 Foreground Service
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs sm:text-sm font-medium">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'architecture'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>System Overlay Engine</span>
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Kotlin &amp; Gradle Code ({PROJECT_FILES.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('cicd')}
              className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'cicd'
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Github className="w-4 h-4" />
              <span>GitHub Actions &amp; APK</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={downloadProjectZip}
              disabled={isZipping}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm hover:shadow-blue-500/25 active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isZipping ? 'Generating ZIP...' : 'Download Full Android Project (.ZIP)'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'architecture' && (
          <div className="space-y-8">
            {/* Core Architecture Banner */}
            <div className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-3 max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    Native Android WindowManager Architecture
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Real System-Level Overlay Outside Any Activity
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    This project does not run inside an Activity container or mock frame. When an earphone lid opens
                    or Bluetooth ACL connects, <code className="text-blue-300 font-mono">BluetoothMonitorService</code> directly
                    invokes <code className="text-blue-300 font-mono">WindowManager.addView()</code> with{' '}
                    <code className="text-blue-300 font-mono">TYPE_APPLICATION_OVERLAY</code> and{' '}
                    <code className="text-blue-300 font-mono">PixelFormat.TRANSLUCENT</code>. The root layout is 100% transparent,
                    anchoring the iOS-style white squircle card to the bottom of the user&apos;s real phone screen over the launcher or any running app.
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shrink-0 w-full lg:w-auto shadow-inner text-xs space-y-2 font-mono">
                  <div className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                    WindowManager Specifications
                  </div>
                  <div className="text-slate-200">
                    <span className="text-slate-500">Window Type: </span>TYPE_APPLICATION_OVERLAY
                  </div>
                  <div className="text-slate-200">
                    <span className="text-slate-500">Flags: </span>FLAG_NOT_FOCUSABLE | FLAG_LAYOUT_IN_SCREEN
                  </div>
                  <div className="text-slate-200">
                    <span className="text-slate-500">Format: </span>PixelFormat.TRANSLUCENT (100% transparent root)
                  </div>
                  <div className="text-slate-200">
                    <span className="text-slate-500">Gravity: </span>Gravity.BOTTOM | Gravity.CENTER_HORIZONTAL
                  </div>
                  <div className="text-slate-200">
                    <span className="text-slate-500">Dismissal: </span>5.5s Handler Timer or Tap Scrim / Done
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Vector Canvas Asset (Procedural in Kotlin Compose) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-between">
                <div className="w-full text-center pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">Procedural 3D Earbud Vector (Canvas)</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    100% Vector Math in <code className="text-blue-400 font-mono">EarbudCanvasVisual.kt</code> • Zero Bitmaps
                  </p>
                </div>

                {/* Direct procedural vector visual */}
                <div className="py-6 flex items-center justify-center gap-4">
                  <ProceduralEarbudCanvas isLeft={true} scale={1} />
                  <ProceduralEarbudCanvas isLeft={false} scale={1} />
                </div>

                <div className="w-full bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                  <div>• Linear &amp; Radial volumetric gradients</div>
                  <div>• Recessed sound outlet with micro-vent dot grid</div>
                  <div>• Bottom chrome charging contact ring &amp; insulator split</div>
                  <div>• Equalization pressure vent &amp; specular highlight curves</div>
                </div>
              </div>

              {/* Execution Flow Diagram */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    How the Overlay Triggers on the Real Phone
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 font-mono">
                    Production Verified
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-mono">1</span>
                      Bluetooth Connection Interception
                    </div>
                    <p className="text-slate-300 pl-7 leading-relaxed">
                      When the user opens their earphone case or connects via Bluetooth,{' '}
                      <code className="text-blue-300 font-mono">BluetoothMonitorService</code> receives the system broadcast{' '}
                      <code className="text-blue-300 font-mono">BluetoothDevice.ACTION_ACL_CONNECTED</code>.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-mono">2</span>
                      Lifecycle Bridge Instantiation
                    </div>
                    <p className="text-slate-300 pl-7 leading-relaxed">
                      Because Compose requires a Lifecycle context to run, <code className="text-blue-300 font-mono">OverlayManager</code> creates{' '}
                      <code className="text-blue-300 font-mono">OverlayLifecycleBridge</code> implementing LifecycleOwner, SavedStateRegistryOwner,
                      and ViewModelStoreOwner before attaching <code className="text-blue-300 font-mono">ComposeView</code>.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-mono">3</span>
                      WindowManager Overlay Injection
                    </div>
                    <p className="text-slate-300 pl-7 leading-relaxed">
                      Calls <code className="text-blue-300 font-mono">windowManager.addView(composeView, layoutParams)</code> with{' '}
                      <code className="text-blue-300 font-mono">PixelFormat.TRANSLUCENT</code>. The root layout has{' '}
                      <code className="text-blue-300 font-mono">Color.Transparent</code>, so the user sees their real home screen, wallpaper, and app icons with only the white card sliding up.
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-1">
                    <div className="font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-mono">4</span>
                      Automatic Dismissal &amp; Haptic Click
                    </div>
                    <p className="text-slate-300 pl-7 leading-relaxed">
                      A 5.5-second timer on the Main Looper automatically animates the card down and detaches it via{' '}
                      <code className="text-blue-300 font-mono">windowManager.removeViewImmediate()</code>. Dismissing via &quot;Done&quot; or tapping outside delivers a hardware taptic click via Android <code className="text-blue-300 font-mono">VibrationEffect.EFFECT_CLICK</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Real Home Screen Testing Instructions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Testing Over Your Real Home Screen
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-1.5">
                  <span className="font-bold text-white block">Step 1: Install APK</span>
                  <p>
                    Build via GitHub Actions or run <code className="text-blue-300 font-mono">./gradlew assembleDebug</code> and install <code className="text-emerald-400 font-mono">app-debug.apk</code> on your physical Android device.
                  </p>
                </div>
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-1.5">
                  <span className="font-bold text-white block">Step 2: Grant Permissions</span>
                  <p>
                    Open the app once to grant <strong>Draw Over Other Apps</strong> (<code className="text-blue-300 font-mono">SYSTEM_ALERT_WINDOW</code>), <strong>Bluetooth Connect</strong>, and <strong>Notifications</strong>.
                  </p>
                </div>
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-1.5">
                  <span className="font-bold text-white block">Step 3: Go Home &amp; Connect</span>
                  <p>
                    Press the physical Home button to return to your real phone launcher. Open your AirPods or earphone case—the card slides up directly on top of your launcher!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* File List Navigator */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-blue-400" />
                  Android Codebase ({PROJECT_FILES.length} Files)
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  Full Code
                </span>
              </div>

              <div className="space-y-1 max-h-[640px] overflow-y-auto pr-1">
                {PROJECT_FILES.map((file, idx) => (
                  <button
                    key={file.path}
                    onClick={() => {
                      setSelectedFileIndex(idx);
                      setCopiedFile(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition text-xs flex flex-col gap-0.5 ${
                      selectedFileIndex === idx
                        ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{file.name}</span>
                      <span
                        className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono ${
                          selectedFileIndex === idx
                            ? 'bg-blue-700 text-blue-100'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {file.language}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] truncate ${
                        selectedFileIndex === idx ? 'text-blue-200' : 'text-slate-500'
                      }`}
                    >
                      {file.path}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Code Viewer Panel */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white font-mono">{currentFile.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 font-mono">
                      {currentFile.path}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{currentFile.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyCurrentFileCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition active:scale-95"
                  >
                    {copiedFile ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Code Pre/Code block with line numbering */}
              <div className="relative bg-slate-950 rounded-xl p-4 border border-slate-800/80 overflow-x-auto max-h-[580px] font-mono text-xs leading-relaxed text-slate-200">
                <pre>{currentFile.content}</pre>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cicd' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Github className="w-5 h-5 text-slate-300" />
                Automated CI/CD Pipeline &amp; APK Artifact Generation
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                The repository includes a production-grade GitHub Actions workflow in{' '}
                <code className="text-blue-400 font-mono">.github/workflows/build.yml</code>. Whenever you push to{' '}
                <code className="text-blue-400 font-mono">main</code>, GitHub Actions builds the debug APK on an{' '}
                <code className="text-blue-400 font-mono">ubuntu-latest</code> runner using Java 17 and Gradle 8.7.
              </p>

              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                <div className="text-slate-500"># 1. Initialize local git repo and push to your GitHub</div>
                <div className="text-emerald-400">git init</div>
                <div className="text-emerald-400">git add .</div>
                <div className="text-emerald-400">git commit -m &quot;feat: AirPods WindowManager overlay for Android&quot;</div>
                <div className="text-emerald-400">git branch -M main</div>
                <div className="text-emerald-400">git remote add origin https://github.com/&lt;your-user&gt;/&lt;your-repo&gt;.git</div>
                <div className="text-emerald-400">git push -u origin main</div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-slate-300 space-y-2">
                <div className="font-bold text-white">How to Download the APK from GitHub:</div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Go to your GitHub repository and click the <strong>Actions</strong> tab.</li>
                  <li>Click on the workflow run titled <strong>&quot;Build Android APK&quot;</strong>.</li>
                  <li>Scroll to the bottom of the summary page to the <strong>Artifacts</strong> section.</li>
                  <li>Click <strong>&quot;app-debug&quot;</strong> to download the compiled ready-to-install APK file.</li>
                </ol>
              </div>

              <div className="pt-2">
                <button
                  onClick={downloadProjectZip}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Complete Repository ZIP</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 px-6 text-center text-xs text-slate-400">
        AirPods Popup for Android • System-Level WindowManager Overlay (TYPE_APPLICATION_OVERLAY) • 100% Transparent Root
      </footer>
    </div>
  );
}
