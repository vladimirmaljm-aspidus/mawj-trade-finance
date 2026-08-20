"use client";

import { useState } from "react";
import { ScanFace, Fingerprint, ShieldCheck } from "lucide-react";
import { useMbanking } from "@/lib/mbanking/store";

export function LockScreen() {
  const setUnlocked = useMbanking((s) => s.setUnlocked);
  const [scanning, setScanning] = useState(false);

  const unlock = () => {
    setScanning(true);
    // Simulated biometric scan.
    setTimeout(() => setUnlocked(true), 1100);
  };

  return (
    <div
      className="premium-navy-card fixed inset-0 z-[200] flex flex-col items-center justify-center px-8 text-center text-white"
      style={{ backgroundColor: "#0f172a" }}
    >
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-[1rem] border border-amber-500/30 bg-white/5 text-2xl font-black text-amber-400">
          A
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400/80">
          Aspidus DMCC
        </p>
        <h1 className="mt-2 text-2xl font-black tracking-tight">Corporate Treasury</h1>
        <p className="mt-2 max-w-xs text-xs font-medium text-slate-400">
          Your session is encrypted. Verify your identity to access liquidity.
        </p>

        <button
          onClick={unlock}
          disabled={scanning}
          className="active-scale mt-12 flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10 disabled:opacity-80"
          aria-label="Unlock with Face ID"
        >
          {scanning ? (
            <ScanFace className="h-12 w-12 animate-pulse text-amber-400" />
          ) : (
            <Fingerprint className="h-12 w-12 text-white" />
          )}
        </button>

        <p className="mt-6 text-xs font-bold uppercase tracking-widest text-slate-400">
          {scanning ? "Scanning…" : "Tap to authenticate"}
        </p>

        <div className="mt-10 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400/80">
          <ShieldCheck className="h-3.5 w-3.5" />
          Bank-grade encryption
        </div>
      </div>

      <p className="absolute bottom-8 text-[9px] font-bold uppercase tracking-widest text-slate-500">
        Aspidus Vault v1.0 · DMCC Regulated
      </p>
    </div>
  );
}
