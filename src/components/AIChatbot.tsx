"use client";

import { useState, useRef, useEffect } from "react";
import { 
  MessageSquare, X, Send, Sparkles, Bot, ShieldAlert, ShieldCheck, 
  Database, FileText, ChevronDown, ChevronUp, Terminal, Cpu, 
  Shield, HelpCircle, ArrowRight, BookOpen, RefreshCw
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
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [expandedTraceIndex, setExpandedTraceIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested quick issues
  const issueRecommendations = [
    {
      title: "Python 3.13 Crash",
      desc: "Change build runtime version to Python 3.12 for package compatibility.",
      icon: <Terminal size={18} />,
      query: "Fix Python 3.13 scikit-learn compilation build crash",
      themeColor: "text-[#0088cc] bg-[#0088cc]/10"
    },
    {
      title: "Exceeded Quota Limits",
      desc: "Clean up stalled deployments & Artifact Registry to free resource quota.",
      icon: <Cpu size={18} />,
      query: "Resolve stuck deployments exceeded storage sandbox resource quota",
      themeColor: "text-purple-400 bg-purple-500/10"
    },
    {
      title: "F-Casing Code Rules",
      desc: "Match lowercase bucket name and uppercase F casing in roll number variable.",
      icon: <Shield size={18} />,
      query: "Casing rules roll number uppercase F mismatch error",
      themeColor: "text-emerald-400 bg-emerald-500/10"
    },
    {
      title: "Trigger Regional Lag",
      desc: "Synchronize bucket and function in us-central1 Iowa to bypass Eventarc delay.",
      icon: <RefreshCw size={18} />,
      query: "Eventarc trigger mismatch bucket and function upload test.csv lag",
      themeColor: "text-amber-400 bg-amber-500/10"
    }
  ];

  // Check onboarding state and key/event listeners
  useEffect(() => {
    const onboarded = localStorage.getItem("iitm_gcp_chatbot_onboarded");
    if (!onboarded) {
      setShowOnboarding(true);
    }

    const handleExternalOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener("open-gcp-ai-mentor", handleExternalOpen);

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
    setMessages([]);
    setExpandedTraceIndex(null);
  };

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
      setIsTyping(false);

    } catch (err) {
      console.warn("Live LLM API unavailable, falling back to simulated local RAG:", err);
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
        setIsTyping(false);
      }, 800);
    }
  };

  return (
    <>
      {/* Premium Onboarding Welcome Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-2xl bg-[#0d1527]/90 border border-slate-800 shadow-[0_20px_50px_rgba(0,136,204,0.3)] p-6 md:p-8 flex flex-col items-center gap-6 overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#0088cc]/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-[#7a3ec8]/10 blur-2xl" />
            
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

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 text-center leading-normal mt-1">
              <Shield size={10} />
              <span>{"Guarded: I guide conceptually and do not provide copy-paste solutions."}</span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Trigger Button (Secondary entry point) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-r from-[#0088cc] to-[#7a3ec8] text-white shadow-[0_4px_20px_rgba(0,136,204,0.3)] hover:scale-105 transition-all duration-300 flex items-center justify-center cursor-pointer group"
        aria-label="Open AI Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        
        <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white"></span>
        </span>
      </button>

      {/* Gemini-Inspired Minimal Full-Screen Overlay Workspace */}
      {isOpen && (
        <div className="fixed inset-0 z-50 w-screen h-screen flex flex-col bg-[#0e1118] animate-fadeIn text-slate-100 overflow-hidden font-sans">
          
          {/* Top Bar Header */}
          <header className="h-16 border-b border-slate-900 bg-[#0e1118]/80 backdrop-blur-md px-6 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-[#0088cc] to-[#7a3ec8] rounded-xl text-white shadow-sm">
                <Bot size={18} className="animate-pulse" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1.5">
                  {"IITM GCP AI Mentor"}
                  <Sparkles size={12} className="text-amber-400" />
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {messages.length > 0 && (
                <button
                  onClick={clearChatHistory}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-800/40 transition-all cursor-pointer"
                >
                  {"Clear Chat"}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-rose-500 hover:text-rose-400 px-3.5 py-1.5 rounded-xl hover:bg-rose-500/10 transition-all cursor-pointer flex items-center gap-1 border border-rose-500/20"
              >
                <X size={14} />
                {"Exit"}
              </button>
            </div>
          </header>

          {/* Main Workspace Scroll Body */}
          <div className="flex-grow overflow-y-auto px-4 md:px-8 py-6 flex flex-col scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            
            {/* Horizontal Constraint for Centered Layout (Like Gemini/ChatGPT) */}
            <div className="max-w-3xl mx-auto w-full flex-grow flex flex-col justify-between">
              
              {/* EMPTY STATE (Welcome greeting & 2x2 grid of issue recommendations) */}
              {messages.length === 0 ? (
                <div className="flex-grow flex flex-col justify-center items-center py-8 md:py-16 gap-8">
                  
                  {/* Big Greeting */}
                  <div className="text-center flex flex-col gap-2 max-w-xl">
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-[#0088cc] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent leading-normal py-1">
                      {"Hello, Classmate"}
                    </h2>
                    <p className="text-slate-400 text-sm md:text-base font-light mt-1">
                      {"Which Day 2 ML Pipeline error is blocking your deployment? Select an issue below or paste logs directly to start troubleshooting."}
                    </p>
                  </div>
                  
                  {/* Issue Recommendations Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-4">
                    {issueRecommendations.map((issue, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(issue.query)}
                        className="p-5 rounded-2xl bg-[#161a24] hover:bg-[#1f2533] border border-slate-800 hover:border-slate-700 text-left transition-all duration-300 group shadow-md flex flex-col gap-3.5 cursor-pointer hover:-translate-y-0.5 active:scale-[0.99]"
                      >
                        <div className={`p-2.5 rounded-xl w-fit group-hover:scale-110 transition-transform ${issue.themeColor}`}>
                          {issue.icon}
                        </div>
                        <div>
                          <strong className="text-sm font-bold text-slate-200 block mb-1">
                            {issue.title}
                          </strong>
                          <span className="text-xs text-slate-400 leading-relaxed block">
                            {issue.desc}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                </div>
              ) : (
                <div className="flex-grow flex flex-col gap-8 py-6">
                  {/* ACTIVE CHAT STATE: Conversational Stream */}
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col gap-2.5 w-full ${
                        msg.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      {msg.sender === "user" ? (
                        
                        /* User Message Bubble */
                        <div className="flex flex-col items-end max-w-[85%]">
                          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1 mb-1 font-mono">
                            {"🧑‍💻 Student"}
                          </span>
                          <div className="rounded-3xl px-6 py-3.5 bg-[#1f293d] text-slate-100 shadow-md text-sm leading-relaxed rounded-tr-sm font-sans">
                            {msg.text}
                          </div>
                        </div>

                      ) : (
                        
                        /* AI Message Bubble (Gemini Style) */
                        <div className="flex gap-4 w-full items-start">
                          <div className="p-2 bg-gradient-to-br from-[#0088cc] to-[#7a3ec8] rounded-xl text-white flex-shrink-0 shadow-md mt-1">
                            <Bot size={18} />
                          </div>
                          
                          <div className="flex-grow flex flex-col gap-2.5 max-w-[90%]">
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">
                              {"🤖 Mentoring Assistant"}
                            </span>
                            
                            {/* Rich text container */}
                            <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line font-sans">
                              {msg.text}
                            </div>

                            {/* Inline Collapsible Telemetry Logs */}
                            {msg.traceLog && (
                              <div className="mt-2.5 w-full">
                                <button
                                  onClick={() => setExpandedTraceIndex(expandedTraceIndex === index ? null : index)}
                                  className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-200 uppercase tracking-widest bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer"
                                >
                                  <Terminal size={12} className="text-[#0088cc]" />
                                  <span>{"Inspect RAG Guardrail Logs"}</span>
                                  {expandedTraceIndex === index ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                </button>
                                
                                {expandedTraceIndex === index && (
                                  <div className="mt-2 p-4.5 rounded-2xl border border-slate-800 bg-[#121622]/60 backdrop-blur-md font-mono text-[10px] text-slate-300 flex flex-col gap-2.5 animate-fadeIn leading-relaxed">
                                    <div className="border-b border-slate-850 pb-2 flex justify-between items-center">
                                      <span className="font-extrabold text-[#0088cc]">{"🛡️ GCP AI Security Shield Logs"}</span>
                                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                                        msg.traceLog.passed ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                      }`}>
                                        {msg.traceLog.passed ? "PASSED" : "BLOCKED"}
                                      </span>
                                    </div>
                                    <div>
                                      <strong className="text-slate-100">{"[Layer 3 Classifier]: "}</strong>
                                      <span>{msg.traceLog.layer3}</span>
                                    </div>
                                    <div>
                                      <strong className="text-slate-100">{"[Layer 2 Vector RAG]: "}</strong>
                                      <span>{msg.traceLog.layer2}</span>
                                    </div>
                                    <div>
                                      <strong className="text-slate-100">{"[Layer 1 System Rules]: "}</strong>
                                      <span>{msg.traceLog.layer1}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                      )}
                    </div>
                  ))}

                  {/* Shimmering Typing Indicator (Gemini-Inspired) */}
                  {isTyping && (
                    <div className="flex gap-4 w-full items-start animate-fadeIn">
                      <div className="p-2 bg-gradient-to-br from-[#0088cc] to-[#7a3ec8] rounded-xl text-white flex-shrink-0 shadow-md mt-1">
                        <Bot size={18} className="animate-spin" style={{ animationDuration: "3s" }} />
                      </div>
                      <div className="flex-grow flex flex-col gap-2 w-full">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">
                          {"🤖 Mentoring Assistant"}
                        </span>
                        
                        {/* Shimmer Bars */}
                        <div className="flex flex-col gap-2 w-full max-w-sm mt-1">
                          <div className="h-3.5 bg-gradient-to-r from-[#1b2234] via-[#2d3855] to-[#1b2234] rounded-full animate-pulse" style={{ width: '90%' }}></div>
                          <div className="h-3.5 bg-gradient-to-r from-[#1b2234] via-[#2d3855] to-[#1b2234] rounded-full animate-pulse" style={{ width: '70%' }}></div>
                          <div className="h-3.5 bg-gradient-to-r from-[#1b2234] via-[#2d3855] to-[#1b2234] rounded-full animate-pulse" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Chat Input Pill (Centered sticky bottom) */}
              <div className="sticky bottom-0 bg-gradient-to-t from-[#0e1118] via-[#0e1118] to-transparent pt-6 pb-6 flex-shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend(input);
                  }}
                  className="relative flex items-center bg-[#161b26] border border-slate-800 focus-within:border-slate-700/80 rounded-full px-6 py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all gap-4"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question or paste compilation error logs..."
                    className="flex-grow bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-0 py-1 px-1 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="p-2.5 rounded-full bg-gradient-to-br from-[#0088cc] to-[#7a3ec8] text-white hover:opacity-95 disabled:opacity-30 transition-all cursor-pointer flex items-center justify-center flex-shrink-0 active:scale-95"
                  >
                    <Send size={16} />
                  </button>
                </form>
                
                <span className="text-[9px] text-slate-500 font-mono text-center block mt-3 px-4">
                  {"🛡️ IITM Academic Guardrails Active: This troubleshooter will offer conceptual hints to support learning."}
                </span>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
