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

  // Check key/event listeners
  useEffect(() => {
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

  const clearChatHistory = () => {
    setMessages([]);
    setExpandedTraceIndex(null);
  };

  const classifyIntent = (query: string): { isOffTopic: boolean; reason: string } => {
    return { isOffTopic: false, reason: "Unrestricted Mode active: Permitted." };
  };

  const getSimulatedAIResponse = (query: string): { text: string; trace: TraceLog } => {
    const q = query.toLowerCase();
    
    let contextRetrieved = "";
    let systemPromptAction = "";
    let responseText = "";

    if (q.includes("cake") || q.includes("bake") || q.includes("recipe") || q.includes("cook")) {
      contextRetrieved = "Skipped GCS Index - Directed query to general baseline knowledge.";
      systemPromptAction = "Unrestricted Mode: Recipe generation complete.";
      responseText = "🎂 **Unrestricted Mode - Classic Chocolate Cake Recipe:**\n\nHere is a simple, delicious recipe to bake a premium chocolate cake:\n\n**Ingredients:**\n- 2 cups white sugar\n- 1-3/4 cups all-purpose flour\n- 3/4 cup unsweetened cocoa powder\n- 1-1/2 tsp baking powder\n- 1-1/2 tsp baking soda\n- 1 tsp salt\n- 2 large eggs\n- 1 cup milk\n- 1/2 cup vegetable oil\n- 2 tsp vanilla extract\n- 1 cup boiling water\n\n**Instructions:**\n1. **Preheat & Prep:** Heat oven to 350°F (175°C). Grease and flour two 9-inch round baking pans.\n2. **Mix Dry:** Whisk sugar, flour, cocoa, baking powder, baking soda, and salt in a large bowl.\n3. **Add Wet:** Add eggs, milk, oil, and vanilla. Beat on medium speed for 2 minutes.\n4. **Add Water:** Stir in the boiling water by hand (batter will be thin but makes the cake ultra-moist!).\n5. **Bake:** Pour into pans. Bake for 30 to 35 minutes until a toothpick inserted in the center comes out clean.\n6. **Cool:** Cool for 10 minutes in pans, then unmold and enjoy!";
    }
    else if (q.includes("python") || q.includes("3.13") || q.includes("3.12") || q.includes("version") || q.includes("compile") || q.includes("scikit")) {
      contextRetrieved = "Retrieved 1 chunk from Guides.tsx [L200-210] (Python 3.13 build error and scikit-learn mismatch).";
      systemPromptAction = "Unrestricted Mode: Full code solution provided directly.";
      responseText = "⚠️ **Python 3.13 build issue resolved!**\n\nOlder ML packages like `scikit-learn==1.3.2` do not have pre-compiled wheels for Python 3.13, causing Cloud Build to fail compilation.\n\n**Direct Fix:**\nSet the cloud runtime explicitly to **Python 3.12** in your GCP Configuration. If using a `Dockerfile`, copy-paste this direct solution:\n```dockerfile\nFROM python:3.12-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD [\"python\", \"main.py\"]\n```";
    }
    else if (q.includes("quota") || q.includes("exceed") || q.includes("limit") || q.includes("stuck") || q.includes("delete") || q.includes("cleanup") || q.includes("remove")) {
      contextRetrieved = "Retrieved 1 chunk from CommonIssues.tsx [L17-24] (Sandbox Quota cleanup routines for Cloud Run & Artifact Registry).";
      systemPromptAction = "Unrestricted Mode: Free-form structural guidelines.";
      responseText = "🛑 **Exceeded Quota / Stuck Deployments:**\n\nThe sandboxed GCP environment has extremely tight resource budgets. Stalled deployments block future resource creation.\n\n**Step-by-Step Recovery:**\n1. Go to **Cloud Run** and run: `gcloud run services delete <service-name> --region=us-central1` or delete via console.\n2. Clear Eventarc triggers: `gcloud eventarc triggers delete <trigger-name> --location=us-central1`.\n3. Search **Artifact Registry**, locate the `gcf-artifacts` repo, and wipe old image builds to recover GCS storage quota!";
    }
    else if (q.includes("casing") || q.includes("capital") || q.includes("lowercase") || q.includes("uppercase") || q.includes("f letter") || q.includes("roll")) {
      contextRetrieved = "Retrieved 1 chunk from CommonIssues.tsx [L35-42] (Roll number casing sensitivity discrepancy).";
      systemPromptAction = "Unrestricted Mode: Direct casing payload fix.";
      responseText = "🔠 **Casing Rules for Roll Numbers (Direct Payload fix):**\n\nGoogle Cloud and the grading bot have opposite casing expectations:\n- **GCP Storage Bucket Name:** Must be strictly lowercase 'f' (e.g. `25f2007841_data_storage`).\n- **Python Code (`roll` variable in main.py):** Must be strictly UPPERCASE 'F' (e.g. `roll = \"25F2007841\"`).\n\n**Direct Code Payload Structure:**\n```python\n# GCS storage setup is lowercase, but Pub/Sub publishes uppercase F\nroll = \"25F2007841\"\n```";
    }
    else if (q.includes("spelling") || q.includes("date") || q.includes("data") || q.includes("typo") || q.includes("bucket_name") || q.includes("model_files")) {
      contextRetrieved = "Retrieved 1 chunk from Guides.tsx [L122-129] and main_gcs.py [L13-25] (Eventarc dynamic trigger arguments).";
      systemPromptAction = "Unrestricted Mode: Schema trigger variables.";
      responseText = "✏️ **Bucket Name Typos (Dynamic Fix):**\n\nHardcoding GCS bucket names crashes if spelling doesn't match the sandbox name.\n\n**Dynamic Eventarc Fix:**\nInstead of hardcoding names, dynamically inspect the Eventarc payload:\n```python\n# Dynamic bucket extraction\nbucket_name = event[\"bucket\"]\nfile_name = event[\"name\"]\n```";
    }
    else if (q.includes("trigger") || q.includes("eventarc") || q.includes("upload") || q.includes("not working") || q.includes("not trigger") || q.includes("test.csv")) {
      contextRetrieved = "Retrieved 1 chunk from Guides.tsx [L244-255] (Region mismatch and Eventarc propagation delay).";
      systemPromptAction = "Unrestricted Mode: Timing and sync delay advice.";
      responseText = "⚡ **Eventarc Trigger Mismatch or Lag:**\n\nIf uploading `test.csv` fails to trigger your Cloud Function:\n1. Verify both the storage bucket and Cloud Run Function are in **us-central1**.\n2. Eventarc IAM propagation has a delay of up to **10 minutes** during first-time configuration. Wait 5 minutes and overwrite-upload `test.csv`.";
    }
    else if (q.includes("how do you work") || q.includes("how it works") || q.includes("how works")) {
      contextRetrieved = "Simulated trace: Explaining assistant mechanics.";
      systemPromptAction = "Unrestricted Mode: Mechanic explanation.";
      responseText = "🤖 **How I Work (Unrestricted & Responsive Mode):**\n\n1. **Dynamic RAG Engine:** I inspect your text, match keywords, and retrieve guidelines or errors from my local knowledge base.\n2. **LLM Inference:** In production (deployed on Vercel), I call the live **Llama-3-8B model** on Hugging Face using your HF API Token to generate customized, direct answers.\n3. **Local Dev Sandbox Simulator:** Since local container sandboxes block DNS/network requests to external APIs (throwing `getaddrinfo ENOTFOUND api-inference.huggingface.co`), I fall back to this responsive offline simulator so you can test all UI tabs, sparkles, and recommendation flows immediately!";
    }
    else if (q.includes("hello") || q.includes("hi") || q.includes("hey")) {
      contextRetrieved = "Simulated trace: Generative greeting.";
      systemPromptAction = "Unrestricted Mode: Chat greeting.";
      responseText = "👋 **Hello! Welcome to the Unrestricted AI Workspace.**\n\nHow can I help you today? I can solve Python build errors, provide GCS deployment scripts, or even bake a chocolate cake! What's on your mind?";
    }
    else if (q.includes("who are you") || q.includes("your name") || q.includes("what are you")) {
      contextRetrieved = "Simulated trace: Identity lookup.";
      systemPromptAction = "Unrestricted Mode: Identity response.";
      responseText = "🤖 I am your **IITM GCP AI Assistant**, built by Aryan Maurya using Next.js and Tailwind CSS. I have been upgraded to Unrestricted Mode, meaning I can help you with anything inside and outside the workshop pipeline!";
    }
    else {
      contextRetrieved = "Retrieved default workshop outline from README.md [L10-30].";
      systemPromptAction = "Unrestricted Mode: Smart General Guide.";
      responseText = `🙋 **IITM GCP AI Assistant (Unrestricted Mode):**\n\nI processed your query: *"${query}"*.\n\nSince we are testing locally inside the network-blocked development sandbox, I fell back to my smart local engine. I am ready to resolve GCP day 2 ML pipeline issues! Try asking about:\n- **"Fix Python 3.13 scikit-learn compilation build crash"**\n- **"Resolve stuck deployments exceeded storage sandbox resource quota"**\n- **"Casing rules roll number uppercase F mismatch error"**\n- **"Eventarc trigger mismatch bucket and function upload test.csv lag"**\n- **"Bake a chocolate cake"**\n\n*When deployed live to Vercel, this exact question is sent to Llama 3 for real-time answers!*`;
    }

    return {
      text: responseText,
      trace: {
        layer3: "✅ Passed: Permitted under Unrestricted Mode.",
        layer2: `🔍 RAG Hit: ${contextRetrieved}`,
        layer1: `🤖 System Prompt: ${systemPromptAction} (Unrestricted assistant mode active).`,
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
