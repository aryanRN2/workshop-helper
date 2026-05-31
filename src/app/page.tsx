"use client";

import { useState } from "react";
import { GraduationCap, Heart } from "lucide-react";
import GcsCanvas3D from "@/components/GcsCanvas3D";
import Guides from "@/components/Guides";
import CodeGenerator from "@/components/CodeGenerator";

export default function Home() {
  const [rollNumber, setRollNumber] = useState("24F2001627");

  return (
    <main className="relative min-h-screen z-10">
      {/* 3D background */}
      <GcsCanvas3D />

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-10 md:gap-16">
        {/* Header */}
        <header className="text-center flex flex-col items-center gap-3">
          <span className="bg-gradient-to-r from-[#00d2ff] to-[#a155e8] text-black font-extrabold text-[0.7rem] md:text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-[0_4px_15px_rgba(0,210,255,0.3)]">
            Day 2 Pipeline Helper
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#a155e8] to-[#00d2ff] bg-clip-text text-transparent">
            IITM GCP Workshop Guide
          </h1>
          <p className="text-[var(--text-muted)] text-sm md:text-base max-w-xl font-light">
            Generate custom deployment scripts, download assets, and troubleshoot error messages to secure your workshop certificate.
          </p>
        </header>

        {/* Configuration Card */}
        <section className="glass-panel p-6 md:p-8 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00d2ff] to-transparent" />
          <div className="w-full max-w-lg text-center flex flex-col gap-3">
            <label className="text-xs md:text-sm font-bold uppercase tracking-wider text-white">
              Step 0: Enter Your Roll Number
            </label>
            <div className="relative flex items-center">
              <GraduationCap className="absolute left-5 text-[#00d2ff]" size={20} />
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 24F2001627"
                className="w-full bg-black/40 border-2 border-[var(--border-color)] rounded-xl py-4 pl-14 pr-6 text-sm md:text-base font-mono text-white focus:outline-none focus:border-[#00d2ff] focus:shadow-[0_0_15px_rgba(0,210,255,0.15)] transition-all"
              />
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              This will instantly customize all file generators and steps below.
            </p>
          </div>
        </section>

        {/* Workspace Layout */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Guides Panel */}
          <div className="lg:col-span-7 flex flex-col">
            <Guides rollNumber={rollNumber} />
          </div>

          {/* Generator Panel */}
          <div className="lg:col-span-5 flex flex-col">
            <CodeGenerator rollNumber={rollNumber} />
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center border-t border-[var(--border-color)] pt-8 flex items-center justify-center gap-2 text-xs md:text-sm text-[var(--text-muted)]">
          <span>Built with</span>
          <Heart size={14} className="text-[#ef4444] fill-[#ef4444]" />
          <span>to help classmates succeed.</span>
        </footer>
      </div>
    </main>
  );
}
