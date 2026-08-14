import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { X, ScanLine, RefreshCw, Zap } from "lucide-react";

// ── Web Audio beep — no audio file needed ─────────────────────────
const playBeep = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.value = 2046; // C6 — clean high beep

    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    // Audio not supported — fail silently
  }
};

const QRScanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const scannedRef = useRef(false); // prevents firing twice on same code
  const [status, setStatus] = useState("starting");
  const [errorMsg, setErrorMsg] = useState("");
  const [flash, setFlash] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);

  useEffect(() => {
    startScanner();
    return () => destroyScanner();
  }, []);

  const startScanner = async () => {
    setStatus("starting");
    scannedRef.current = false;

    try {
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          // Prevent firing multiple times on the same QR code
          if (scannedRef.current) return;
          scannedRef.current = true;

          // Beep immediately on detection
          playBeep();

          // Stop the scanner
          scanner.stop();

          // Pass decoded text up to parent
          onScan(result.data);
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true, // draws outline around detected QR
          highlightCodeOutline: true, // draws outline on the QR modules
          preferredCamera: "environment", // back camera
          maxScansPerSecond: 15, // fast scanning
          calculateScanRegion: (video) => {
            // Focus scan on center square of the frame
            const size = Math.min(video.videoWidth, video.videoHeight) * 0.7;
            const x = (video.videoWidth - size) / 2;
            const y = (video.videoHeight - size) / 2;
            return { x, y, width: size, height: size };
          },
        },
      );

      scannerRef.current = scanner;

      await scanner.start();

      // Check if flash/torch is available on this device
      const flashAvailable = await QrScanner.hasCamera();
      setHasFlash(flashAvailable);

      setStatus("scanning");
    } catch (err) {
      console.error("Scanner error:", err);
      if (
        err?.name === "NotAllowedError" ||
        String(err).includes("permission")
      ) {
        setErrorMsg(
          "Camera permission denied. Please allow camera access and try again.",
        );
      } else if (err?.name === "NotFoundError") {
        setErrorMsg("No camera found on this device.");
      } else {
        setErrorMsg("Could not start camera. Try again.");
      }
      setStatus("error");
    }
  };

  const destroyScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
  };

  const handleClose = () => {
    destroyScanner();
    onClose();
  };

  const toggleFlash = async () => {
    if (!scannerRef.current) return;
    try {
      await scannerRef.current.toggleFlash();
      setFlash((f) => !f);
    } catch (_) {}
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/70 shrink-0">
        <div className="flex items-center gap-2">
          <ScanLine size={17} className="text-primary-400" />
          <span className="text-white font-display font-600 text-sm">
            Scan Product QR
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Flash toggle */}
          {status === "scanning" && (
            <button
              onClick={toggleFlash}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors
                ${flash ? "bg-gold-500 text-white" : "bg-white/10 text-white hover:bg-white/20"}`}
            >
              <Zap size={16} />
            </button>
          )}
          <button
            onClick={handleClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Camera view ──────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {/* Video — qr-scanner renders into this */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Starting overlay */}
        {status === "starting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-4">
            <div className="w-10 h-10 border-4 border-primary-400 border-t-transparent rounded-full spin" />
            <p className="text-white text-sm font-body">Starting camera...</p>
          </div>
        )}

        {/* Error overlay */}
        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 px-8 text-center gap-5">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <ScanLine size={32} className="text-white/40" />
            </div>
            <p className="text-white text-sm font-body leading-relaxed">
              {errorMsg}
            </p>
            <button
              onClick={startScanner}
              className="btn-secondary gap-2 text-sm"
            >
              <RefreshCw size={15} /> Try Again
            </button>
          </div>
        )}

        {/* Aim overlay — shown while actively scanning */}
        {status === "scanning" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {/* Dark vignette around aim box */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Aim box — clear window */}
            <div
              className="relative bg-transparent z-10"
              style={{
                width: "68vw",
                height: "68vw",
                maxWidth: 280,
                maxHeight: 280,
              }}
            >
              {/* Clear cutout effect */}
              <div className="absolute inset-0 bg-transparent border-0" />

              {/* Corner brackets */}
              <span className="absolute top-0 left-0 w-9 h-9 border-t-4 border-l-4 border-primary-400 rounded-tl-lg" />
              <span className="absolute top-0 right-0 w-9 h-9 border-t-4 border-r-4 border-primary-400 rounded-tr-lg" />
              <span className="absolute bottom-0 left-0 w-9 h-9 border-b-4 border-l-4 border-primary-400 rounded-bl-lg" />
              <span className="absolute bottom-0 right-0 w-9 h-9 border-b-4 border-r-4 border-primary-400 rounded-br-lg" />

              {/* Animated scan line */}
              <span className="absolute left-3 right-3 h-0.5 bg-primary-400 opacity-80 rounded-full animate-scanline" />
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom hint ───────────────────────────────────────────── */}
      <div className="shrink-0 bg-black/70 px-4 py-5 text-center">
        {status === "scanning" && (
          <>
            <p className="text-white/80 text-sm font-body">
              Point at a VerifyIt QR code
            </p>
            <p className="text-white/40 text-xs font-body mt-1">
              Hold steady — scanning automatically
            </p>
          </>
        )}
        {status === "starting" && (
          <p className="text-white/50 text-sm font-body">
            Requesting camera...
          </p>
        )}
        {status === "error" && (
          <p className="text-white/50 text-sm font-body">Camera unavailable</p>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
