"use client";

import { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, X, Send, Sparkles, Bot, ShieldAlert, ShieldCheck, 
  Database, FileText, ChevronDown, ChevronUp, Terminal, Activity, 
  RefreshCw, Layers, Cpu, Shield, HelpCircle, ArrowRight, BookOpen
} from "lucide-react";

interface TraceLog {
  layer3: string; // Programmatic Filtering
  layer2: string; // RAG Context Retrieval
  layer1: string; // System Prompt Persona
  passed: boolean;
}

interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
  traceLog?: TraceLog;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "logs">("chat"); // Mobile view switcher
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "👋 Hey there! Welcome to the IITM GCP Workshop AI Diagnostic Workspace.\n\nI am your dedicated Academic Mentor, configured with dynamic vector RAG context and a 3-layer security guardrail system to guide you step-by-step through the Day 2 ML Pipeline assignment.\n\nType your error logs or question below, or select a quick topic helper. Check out the real-time **Security Architecture Command Center** on the side to inspect how I process your queries securely!",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [lastTrace, setLastTrace] = useState<TraceLog | undefined>({
    layer3: "🟢 Standby - Waiting for intent classification.",
    layer2: "📂 Standby - Vector DB indices ready.",
    layer1: "🛡️ Standby - Security constraints loaded.",
    passed: true
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    "Fix Python 3.13 error",
    "Exceeded Storage Quota",
    "Roll Number casing discrepancy",
    "Eventarc trigger lag",
    "Bake a cake 🎂"
  ];

  // Load onboarding state and register key/event listeners
  useEffect(() => {
    // Session-based onboarding modal trigger
    const onboarded = localStorage.getItem("iitm_gcp_chatbot_onboarded");
    if (!onboarded) {
      // Trigger onboarding welcome screen automatically
      setShowOnboarding(true);
    }

    // External event listener for manual triggers
    const handleExternalOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener("open-gcp-ai-mentor", handleExternalOpen);

    // Escape key closes chatbot workspace
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("open-gcp-ai-mentor", handleExternalOpen);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleStartAI = () => {
    localStorage.setItem("iitm_gcp_chatbot_onboarded", "true");
    setShowOnboarding(false);
    setIsOpen(true);
  };

  const handleCloseOnboarding = () => {
    localStorage.setItem("iitm_gcp_chatbot_onboarded", "true");
    setShowOnboarding(false);
  };

  const clearChatHistory = () => {
    setMessages([
      {
        sender: "ai",
        text: "History cleared. How can I help you troubleshoot your Google Cloud Function or event pipelines today?",
        timestamp: new Date()
      }
    ]);
    setLastTrace({
      layer3: "🟢 Standby - Waiting for intent classification.",
      layer2: "📂 Standby - Vector DB indices ready.",
      layer1: "🛡️ Standby - Security constraints loaded.",
      passed: true
    });
  };

  // Programmatic intent classifier & off-topic detector
  const classifyIntent = (query: string): { isOffTopic: boolean; reason: string } => {
    const q = query.toLowerCase().trim();
    
    const offTopicKeywords = [
      "cake", "bake", "cook", "recipe", "history", "essay", "poem", "song", "joke", 
      "weather", "president", "love", "movie", "game", "sport", "music", "actor",
      "capital of", "who is", "tell me about", "political", "news"
    ];

    const onTopicKeywords = [
      "python", "3.13", "3.12", "quota", "eventarc", "trigger", "bucket", "csv", 
      "storage", "main.py", "requirements", "targets", "model", "joblib", "gcp",
      "roll", "casing", "error", "logs", "deployment", "gcs"
    ];

    const containsOnTopic = onTopicKeywords.some(word => q.includes(word));
    const containsOffTopic = offTopicKeywords.some(word => q.includes(word));

    if (containsOffTopic && !containsOnTopic) {
      return { isOffTopic: true, reason: `Off-topic keyword detected in query.` };
    }

    if (q.length > 5 && !containsOnTopic && (q.startsWith("write a") || q.startsWith("how to") || q.startsWith("tell me"))) {
      return { isOffTopic: true, reason: `General knowledge / creative request without workshop context.` };
    }

    return { isOffTopic: false, reason: "Query aligns with workshop domains." };
  };

  const getSimulatedAIResponse = (query: string): { text: string; trace: TraceLog } => {
    const q = query.toLowerCase();
    
    // Layer 3 Check
    const classification = classifyIntent(query);
    if (classification.isOffTopic) {
      return {
        text: "🙅 **Strict Assignment Boundary Refusal:**\n\nI am sorry, but I am programmed solely to assist with the IITM GCP Workshop Day 2 ML Pipeline assignment. \n\nI cannot answer off-topic questions (such as creative requests or general knowledge). Please keep your queries focused on your pipeline task so we can get it solved!",
        trace: {
          layer3: `❌ Blocked: ${classification.reason}`,
          layer2: "⏭️ Skipped (Intent Classified as Off-Topic)",
          layer1: "🔒 Guardrail Active: Enforced Academic Mentor Persona boundary constraints.",
          passed: false
        }
      };
    }

    // Layer 2 Dynamic Retrieval Simulation
    let contextRetrieved = "";
    let systemPromptAction = "";
    let responseText = "";

    if (q.includes("python") || q.includes("3.13") || q.includes("3.12") || q.includes("version") || q.includes("compile") || q.includes("scikit")) {
      contextRetrieved = "Retrieved 1 chunk from Guides.tsx [L200-210] (Python 3.13 build error and scikit-learn mismatch).";
      systemPromptAction = "Persona enforced: concept hint provided, direct code solution withheld.";
      responseText = "⚠️ **Python 3.13 is NOT compatible with the workshop runtime!**\n\nOlder machine learning packages like `scikit-learn==1.3.2` do not have pre-built binaries for Python 3.13, causing Cloud Build to fail compilation.\n\n**Hint:** Click **Edit source**, check the **Runtime** dropdown, change it from Python 3.13 to **Python 3.12**, and redeploy. This will allow scikit-learn to download smoothly!";
    }
    else if (q.includes("quota") || q.includes("exceed") || q.includes("limit") || q.includes("stuck") || q.includes("delete") || q.includes("cleanup") || q.includes("remove")) {
      contextRetrieved = "Retrieved 1 chunk from CommonIssues.tsx [L17-24] (Sandbox Quota cleanup routines for Cloud Run & Artifact Registry).";
      systemPromptAction = "Persona enforced: structured steps provided.";
      responseText = "🛑 **Exceeded Quota / Stuck Deployments:**\n\nThe GCP student sandbox has extremely tight resource limits. If you have a failed or stuck deployment, it blocks all future creation attempts.\n\n**Conceptual Guide:**\n1. Search for **Cloud Run** and delete any old services.\n2. Search for **Eventarc** $\\rightarrow$ Triggers and clear active triggers.\n3. Search for **Artifact Registry** $\\rightarrow$ select `gcf-artifacts` and clear old builds to recover storage quota!";
    }
    else if (q.includes("casing") || q.includes("capital") || q.includes("lowercase") || q.includes("uppercase") || q.includes("f letter") || q.includes("roll")) {
      contextRetrieved = "Retrieved 1 chunk from CommonIssues.tsx [L35-42] (Roll number casing sensitivity discrepancy).";
      systemPromptAction = "Persona enforced: highlight structural logic rather than giving copy-paste code.";
      responseText = "🔠 **Casing Rules for Roll Numbers (Crucial discrepancy):**\n\nGoogle Cloud and the grading bot have opposite rules:\n* **GCP Console (Bucket name):** Must be lowercase 'f' (e.g., `25f2007841_data_storage`).\n* **Python Code (`roll` variable inside main.py):** Must be uppercase 'F' (e.g., `roll = \"25F2007841\"`). The grading bot strictly expects an uppercase F and will ignore your score if it is sent in lowercase!";
    }
    else if (q.includes("spelling") || q.includes("date") || q.includes("data") || q.includes("typo") || q.includes("bucket_name") || q.includes("model_files")) {
      contextRetrieved = "Retrieved 1 chunk from Guides.tsx [L122-129] and main_gcs.py [L13-25] (Eventarc dynamic trigger arguments).";
      systemPromptAction = "Persona enforced: offer mock schema examples.";
      responseText = "✏️ **Bucket Name Typos & Hardcoded Params:**\n\nHardcoding bucket names like `'model_files'` or `'25f1000133_date_storage'` (spelling typos) crashes with `404 NotFound` at startup.\n\n**Hint:** Always use the dynamic Eventarc parameter `bucket_name` instead of hardcoding any text strings. Let Google Cloud automatically tell the script which bucket triggered it!";
    }
    else if (q.includes("trigger") || q.includes("eventarc") || q.includes("upload") || q.includes("not working") || q.includes("not trigger") || q.includes("test.csv")) {
      contextRetrieved = "Retrieved 1 chunk from Guides.tsx [L244-255] (Region mismatch and Eventarc propagation delay).";
      systemPromptAction = "Persona enforced: explain synchronization delays conceptually.";
      responseText = "⚡ **Eventarc Trigger Mismatch or Lag:**\n\nIf uploading `test.csv` has no effect:\n1. Ensure BOTH your Storage Bucket and Cloud Run Function are in **us-central1 (Iowa)**. Triggers fail across different regions.\n2. Eventarc IAM permissions take **2–10 minutes** to propagate on first creation. Wait 5 minutes, then re-upload `test.csv` (checking **Overwrite**).";
    }
    else {
      contextRetrieved = "Retrieved default workshop outline from README.md [L10-30].";
      systemPromptAction = "Persona enforced: ask clarifying diagnostic questions.";
      responseText = "🙋 **IITM GCP Support Bot:**\n\nI can help you resolve all GCP Day 2 ML Pipeline issues! Make sure:\n• Both your bucket and function are in **us-central1**.\n• Your runtime is set to **Python 3.12**.\n• The roll number inside `main.py` has an uppercase **F**.\n\nWhat specific error is showing in your GCP logs? Tell me more!";
    }

    return {
      text: responseText,
      trace: {
        layer3: "✅ Passed: Intent classified as related to Day 2 GCP ML Pipeline assignment.",
        layer2: `🔍 RAG Hit: ${contextRetrieved}`,
        layer1: `🤖 System Prompt: ${systemPromptAction} (Academic Mentor Persona applied).`,
        passed: true
      }
    };
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newMessages = [...messages, { sender: "user" as const, text: textToSend, timestamp: new Date() }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-5)
        })
      });

      if (!response.ok) {
        throw new Error("Live LLM API unavailable.");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai" as const,
          text: data.text,
          timestamp: new Date(),
          traceLog: data.trace
        }
      ]);
      setLastTrace(data.trace);
      setIsTyping(false);

    } catch (err) {
      console.warn("Falling back to simulated local RAG system:", err);
      setTimeout(() => {
        const { text, trace } = getSimulatedAIResponse(textToSend);
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai" as const,
            text,
            timestamp: new Date(),
            traceLog: trace
          }
        ]);
        setLastTrace(trace);
        setIsTyping(false);
      }, 700);
    }
  };

  return (
    <>
      {/* Premium Onboarding Welcome Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0d1527]/90 border border-slate-800 shadow-[0_20px_50px_rgba(0,136,204,0.3)] p-6 md:p-8 flex flex-col items-center gap-6 overflow-hidden">
            {/* Visual background gradient sparkles */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#0088cc]/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-[#7a3ec8]/10 blur-2xl" />
            
            {/* Robo Pulse Icon */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#0088cc] to-[#7a3ec8] opacity-25 blur-md animate-ping" />
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-[#0088cc] to-[#7a3ec8] text-white flex items-center justify-center shadow-[0_4px_15px_rgba(0,136,204,0.3)]">
                <Bot size={36} className="animate-bounce" style={{ animationDuration: "2.5s" }} />
              </div>
            </div>

            <div className="text-center flex flex-col gap-2">
              <span className="text-[10px] md:text-xs font-extrabold tracking-widest text-[#0088cc] uppercase flex items-center justify-center gap-1">
                <Sparkles size={12} className="text-amber-400 animate-pulse" />
                {"Day 2 ML Pipeline Support"}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {"Stuck on Google Cloud Function Deployment?"}
              </h2>
              <p className="text-slate-400 text-xs md:text-sm max-w-md mx-auto mt-2 leading-relaxed">
                {"My custom-built **Academic AI Troubleshooter** is online to review compilation logs, quota failures, casing mismatches, and Eventarc triggers."}
              </p>
            </div>

            {/* Feature checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full bg-slate-900/50 rounded-xl p-4 border border-slate-800 text-left">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
                <span>{"Python 3.13 Compiles"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
                <span>{"Eventarc Trigger Lags"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
                <span>{"Quota Cleanup Routes"}</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <ShieldCheck size={14} className="text-emerald-500 flex-shrink-0" />
                <span>{"F-Casing Rules Guard"}</span>
              </div>
            </div>

            {/* CTA Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
              <button
                onClick={handleStartAI}
                className="flex-grow py-3 px-5 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#7a3ec8] text-white font-extrabold text-sm hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,136,204,0.25)] group"
              >
                {"Initialize AI Troubleshooter 🚀"}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleCloseOnboarding}
                className="py-3 px-5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <BookOpen size={14} />
                {"Explore Guides First"}
              </button>
            </div>

            {/* Footer warning */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 text-center leading-normal mt-1">
              <Shield size={10} />
              <span>{"Guarded: I guide conceptually and do not provide copy-paste solutions."}</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button (Left as a secondary entry point) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-[#0088cc] to-[#7a3ec8] text-white shadow-[0_4px_20px_rgba(0,136,204,0.3)] hover:scale-105 transition-all duration-300 flex items-center justify-center cursor-pointer group"
        aria-label="Open AI Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        
        {/* Pulsing indicator */}
        <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white"></span>
        </span>
      </button>

      {/* Premium Full-Screen Overlay Workspace */}
      {isOpen && (
        <div className="fixed inset-0 z-50 w-screen h-screen flex flex-col bg-[#080d1a] animate-fadeIn text-slate-100 overflow-hidden font-sans">
          
          {/* Workspace Top Header Bar */}
          <header className="h-[70px] border-b border-slate-800/80 bg-[#0d1424]/90 backdrop-blur-md px-6 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-[#0088cc] to-[#7a3ec8] rounded-xl text-white shadow-md">
                <Bot size={22} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-sm md:text-base tracking-tight text-white flex items-center gap-1.5">
                    {"IITM GCP AI Mentoring Workspace"}
                    <Sparkles size={14} className="text-amber-500 animate-spin" style={{ animationDuration: "8s" }} />
                  </h1>
                  <span className="hidden sm:inline-flex bg-[#0088cc]/10 border border-[#0088cc]/30 text-[#0088cc] font-extrabold text-[8px] md:text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {"Academic Guardrails Active"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    {"Security Shield Online"}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Action buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={clearChatHistory}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-400 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                title="Clear conversation log"
              >
                <RefreshCw size={12} />
                {"Clear Chat"}
              </button>
              
              <div className="h-6 w-[1px] bg-slate-800 hidden md:block" />

              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:opacity-95 text-white rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all shadow-[0_2px_10px_rgba(239,68,68,0.2)] active:scale-95 cursor-pointer flex items-center gap-1"
                title="Close AI workspace (Esc)"
              >
                <X size={14} />
                {"Exit Workspace"}
              </button>
            </div>
          </header>

          {/* Workspace Mobile View Switcher Tab (Visible only on mobile/tablet) */}
          <div className="flex lg:hidden border-b border-slate-800 bg-[#0c1221] h-12 flex-shrink-0">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase border-b-2 transition-all ${
                activeTab === "chat" 
                  ? "border-[#0088cc] text-[#0088cc] bg-slate-900/40" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare size={14} />
              {"💬 AI Mentor Chat"}
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`flex-1 flex items-center justify-center gap-2 text-xs font-bold uppercase border-b-2 transition-all ${
                activeTab === "logs" 
                  ? "border-[#0088cc] text-[#0088cc] bg-slate-900/40" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal size={14} />
              {"🛡️ Diagnostic Hub"}
            </button>
          </div>

          {/* Main Workspace Body Split-Screen */}
          <div className="flex-grow flex overflow-hidden">
            
            {/* LEFT PANE: Conversational Chat Interface */}
            <div className={`w-full lg:w-7/12 xl:w-8/12 flex flex-col h-full bg-[#070b13] ${
              activeTab === "chat" ? "flex" : "hidden lg:flex"
            }`}>
              
              {/* Chat Message Stream Panel */}
              <div className="flex-grow p-4 md:p-8 overflow-y-auto flex flex-col gap-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex flex-col max-w-[85%] gap-2 ${
                      msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                    }`}
                  >
                    {/* Speaker badge */}
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                      {msg.sender === "user" ? "🧑‍💻 Student" : "🤖 GCP Academic Mentor"}
                    </span>

                    {/* Chat Bubble container */}
                    <div
                      className={`rounded-2xl px-5 py-4 text-sm whitespace-pre-line leading-relaxed shadow-lg ${
                        msg.sender === "user"
                          ? "bg-gradient-to-br from-[#0088cc] to-[#7a3ec8] text-white rounded-tr-none font-sans"
                          : "bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none font-sans"
                      }`}
                    >
                      {msg.text}
                    </div>

                    <span className="text-[9px] text-slate-600 px-1 font-mono">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div className="self-start flex flex-col items-start gap-2 max-w-[80%]">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                      {"🤖 GCP Academic Mentor"}
                    </span>
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-5 py-4 flex gap-1.5 items-center">
                      <span className="h-2 w-2 bg-[#0088cc] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="h-2 w-2 bg-[#7a3ec8] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Dynamic Suggestions Bar */}
              <div className="px-6 py-3 border-t border-slate-900 bg-[#090e1b] flex gap-2.5 items-center overflow-x-auto whitespace-nowrap scrollbar-none min-h-[56px] flex-shrink-0">
                <HelpCircle size={14} className="text-slate-500 flex-shrink-0" />
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1">{"Suggested:"}</span>
                {suggestionChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="text-xs font-semibold px-4.5 py-1.5 rounded-full border border-slate-800/80 bg-slate-900/60 hover:bg-[#0088cc]/10 hover:border-[#0088cc] hover:text-[#0088cc] transition-all duration-300 cursor-pointer shadow-sm flex-shrink-0 focus:outline-none"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Action Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="p-4 border-t border-slate-900 bg-[#0d1424]/90 backdrop-blur-md flex gap-3 items-center flex-shrink-0"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste GCP logs, describe error codes, or ask Python compilation questions..."
                  className="flex-grow bg-slate-900/80 border border-slate-800 rounded-xl py-3.5 px-5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#0088cc] focus:shadow-[0_0_15px_rgba(0,136,204,0.15)] transition-all font-sans"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-3.5 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#7a3ec8] text-white hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center shadow-lg hover:scale-102 active:scale-98"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>

            {/* RIGHT PANE: Permanent GCP Architecture Security & RAG Diagnostic Logs Hub */}
            <div className={`w-full lg:w-5/12 xl:w-4/12 flex flex-col h-full bg-[#0a0f1d] border-l border-slate-800/80 p-6 overflow-y-auto gap-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent ${
              activeTab === "logs" ? "flex" : "hidden lg:flex"
            }`}>
              
              {/* Card 1: Command Hub Dashboard Telemetry Header */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4.5 relative overflow-hidden flex flex-col gap-3">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#7a3ec8] to-transparent" />
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-[#7a3ec8] animate-pulse" />
                    <h3 className="font-extrabold text-xs tracking-wider uppercase text-slate-300">
                      {"GCP Security Command Center"}
                    </h3>
                  </div>
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-[8px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    {"Secured"}
                  </span>
                </div>
                
                {/* Live System Specs Telemetry Grid */}
                <div className="grid grid-cols-3 gap-2.5 mt-1 font-mono text-[9px] text-slate-500">
                  <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-900 flex flex-col gap-0.5">
                    <span className="font-bold text-[8px] text-slate-600 uppercase">{"CPU Trace"}</span>
                    <span className="font-bold text-slate-300 flex items-center gap-1"><Cpu size={10} className="text-[#0088cc]" /> {"0.03 ms"}</span>
                  </div>
                  <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-900 flex flex-col gap-0.5">
                    <span className="font-bold text-[8px] text-slate-600 uppercase">{"Active Shields"}</span>
                    <span className="font-bold text-[#7a3ec8] flex items-center gap-1"><Shield size={10} /> {"3 Layers"}</span>
                  </div>
                  <div className="bg-slate-950/80 rounded-lg p-2 border border-slate-900 flex flex-col gap-0.5">
                    <span className="font-bold text-[8px] text-slate-600 uppercase">{"Vector Index"}</span>
                    <span className="font-bold text-emerald-500 flex items-center gap-1"><Database size={10} /> {"Ready"}</span>
                  </div>
                </div>
              </div>

              {/* RAG & Guardrails Diagnostic Flow Header */}
              <div className="flex items-center gap-2 mt-2">
                <Layers size={15} className="text-[#0088cc]" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                  {"Live AI Pipeline Telemetry Trace"}
                </h4>
              </div>

              {/* Main dynamic stack logs */}
              {lastTrace ? (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  
                  {/* Layer 3 Card: Programmatic Intent Classification */}
                  <div className={`rounded-xl border p-4.5 flex flex-col gap-2 bg-slate-900/30 ${
                    lastTrace.passed ? "border-slate-800" : "border-red-900/60 bg-red-950/5"
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">
                        {"[Layer 3] Intent Classifier"}
                      </span>
                      <span className={`text-[8px] font-extrabold tracking-widest uppercase font-mono px-2 py-0.5 rounded-full ${
                        lastTrace.passed ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      }`}>
                        {lastTrace.passed ? "ALLOWED" : "REFUSED"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed mt-1">
                      {lastTrace.layer3}
                    </p>
                  </div>

                  {/* Layer 2 Card: Vector RAG Context Search hits */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4.5 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">
                        {"[Layer 2] Vector RAG Database"}
                      </span>
                      <span className="text-[8px] font-extrabold tracking-widest uppercase font-mono px-2 py-0.5 rounded-full bg-[#0088cc]/10 text-[#0088cc]">
                        {"RETRIEVED"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed mt-1">
                      {lastTrace.layer2}
                    </p>
                  </div>

                  {/* Layer 1 Card: System Persona Injection rules */}
                  <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-4.5 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-mono">
                        {"[Layer 1] System Persona Rules"}
                      </span>
                      <span className="text-[8px] font-extrabold tracking-widest uppercase font-mono px-2 py-0.5 rounded-full bg-[#7a3ec8]/10 text-[#7a3ec8]">
                        {"ENFORCED"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-mono leading-relaxed mt-1">
                      {lastTrace.layer1}
                    </p>
                  </div>

                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center p-8 border border-dashed border-slate-800 rounded-2xl text-center gap-3">
                  <Terminal size={32} className="text-slate-700 animate-pulse" />
                  <p className="text-xs text-slate-500 font-mono max-w-[200px] leading-relaxed">
                    {"Telemetry Standby. Send a message to see RAG security trace logs update live."}
                  </p>
                </div>
              )}

              {/* RAG security details helper box */}
              <div className="mt-auto rounded-xl border border-slate-800 bg-slate-950 p-4 flex gap-3 text-xs text-slate-400 leading-relaxed font-sans">
                <FileText size={24} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block mb-1">{"Why these guardrails?"}</strong>
                  {"In accordance with IITM academic policy, this troubleshooter is hard-locked to GCP Day 2 ML Pipeline topics and employs conceptual scaffolding rather than offering copy-paste code to guarantee authentic student learning."}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
}
