"use client";

import { useState } from "react";
import { GraduationCap, Heart, ExternalLink, User, Bot, Sparkles } from "lucide-react";
import GcsCanvas3D from "@/components/GcsCanvas3D";
import Guides from "@/components/Guides";
import CodeGenerator from "@/components/CodeGenerator";
import CommonIssues from "@/components/CommonIssues";
import AIChatbot from "@/components/AIChatbot";

export default function Home() {
  const [rollNumber, setRollNumber] = useState("24F2001627");

  return (
    <main className="relative min-h-screen z-10">
      {/* 3D background */}
      <GcsCanvas3D />

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-10 md:gap-16">
        {/* Header */}
        <header className="text-center flex flex-col items-center gap-3">
          <span className="bg-gradient-to-r from-[#0088cc] to-[#7a3ec8] text-white font-extrabold text-[0.7rem] md:text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-[0_4px_15px_rgba(0,136,204,0.15)]">
            {"Day 2 Pipeline Helper"}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#111827] via-[#7a3ec8] to-[#0088cc] bg-clip-text text-transparent">
            {"IITM GCP Workshop Guide"}
          </h1>
          <p className="text-[var(--text-muted)] text-sm md:text-base max-w-xl font-light">
            {"Generate customized pipeline files, download assets, and troubleshoot error messages to secure your workshop certificate."}
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("open-gcp-ai-mentor"))}
            className="mt-3 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#7a3ec8] text-white font-extrabold text-xs md:text-sm hover:scale-103 hover:shadow-[0_4px_25px_rgba(0,136,204,0.3)] active:scale-[0.98] transition-all cursor-pointer shadow-md group border-none"
          >
            <Bot size={18} className="animate-bounce" style={{ animationDuration: "2.5s" }} />
            {"Ask AI to Troubleshoot GCP Pipeline"}
            <Sparkles size={12} className="text-amber-300 animate-pulse" />
          </button>
        </header>

        {/* Configuration Card */}
        <section className="glass-panel p-6 md:p-8 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#0088cc] to-transparent" />
          <div className="w-full max-w-lg text-center flex flex-col gap-3">
            <label className="text-xs md:text-sm font-bold uppercase tracking-wider text-gray-800">
              {"Step 0: Enter Your Roll Number"}
            </label>
            <div className="relative flex items-center">
              <GraduationCap className="absolute left-5 text-[#0088cc]" size={20} />
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
                placeholder="e.g. 24F2001627"
                className="w-full bg-white/60 border-2 border-[var(--border-color)] rounded-xl py-4 pl-14 pr-6 text-sm md:text-base font-mono text-gray-900 focus:outline-none focus:border-[#0088cc] focus:shadow-[0_0_15px_rgba(0,136,204,0.15)] transition-all"
              />
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {"This will instantly customize all file generators and steps below."}
            </p>
          </div>
        </section>

        {/* Common Issues & Quick Pitfalls */}
        <CommonIssues />

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

        {/* About Me Section */}
        <section className="glass-panel p-6 md:p-8 relative overflow-hidden max-w-2xl mx-auto w-full">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#7a3ec8] to-transparent" />
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0088cc] to-[#7a3ec8] text-white flex items-center justify-center flex-shrink-0 shadow-[0_4px_15px_rgba(122,62,200,0.2)]">
              <User size={32} />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-lg font-bold text-gray-900 mb-1">{"About Me"}</h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                {"Hey, I'm Aryan Maurya! I created this visual helper app to simplify complex Google Cloud configurations for my IITM classmates. Check out my portfolio to see more of my software and system projects!"}
              </p>
              <a
                href="https://me-aryan.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0088cc] hover:text-[#7a3ec8] transition-colors"
              >
                {"View My Portfolio"} <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center border-t border-[var(--border-color)] pt-8 flex items-center justify-center gap-2 text-xs md:text-sm text-[var(--text-muted)]">
          <span>{"Built with"}</span>
          <Heart size={14} className="text-[#ef4444] fill-[#ef4444]" />
          <span>{"by Aryan Maurya to help classmates succeed."}</span>
        </footer>
      </div>
      
      {/* Floating AI Chatbot Assistant */}
      <AIChatbot />
    </main>
  );
}
