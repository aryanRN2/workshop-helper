"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, Bot, ShieldAlert, ShieldCheck, Database, FileText, ChevronDown, ChevronUp } from "lucide-react";

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
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "👋 Hey there! I am your IITM GCP Workshop Academic Mentor.\n\nI have been programmed with strict guardrails to assist you *only* with Day 2 ML Pipeline questions.\n\nTry asking me about Python 3.13 compile errors or roll number casing rules, or try asking something off-topic (like baking a cake) to see my security guardrails in action!",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [expandedTraceIndex, setExpandedTraceIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    "Fix Python 3.13",
    "Exceeded Quota",
    "F Casing Rules",
    "Bake a cake 🎂"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Programmatic intent classifier & off-topic detector
  const classifyIntent = (query: string): { isOffTopic: boolean; reason: string } => {
    const q = query.toLowerCase().trim();
    
    // Off-topic trigger words (cooking, general history, creative writing requests, etc.)
    const offTopicKeywords = [
      "cake", "bake", "cook", "recipe", "history", "essay", "poem", "song", "joke", 
      "weather", "president", "love", "movie", "game", "sport", "music", "actor",
      "capital of", "who is", "tell me about", "political", "news"
    ];

    // Exception whitelist keywords (if they mention GCP, Cloud, Bucket, or workshop terms alongside)
    const onTopicKeywords = [
      "python", "3.13", "3.12", "quota", "eventarc", "trigger", "bucket", "csv", 
      "storage", "main.py", "requirements", "targets", "model", "joblib", "gcp",
      "roll", "casing", "error", "logs", "deployment", "gcs"
    ];

    const containsOnTopic = onTopicKeywords.some(word => q.includes(word));
    const containsOffTopic = offTopicKeywords.some(word => q.includes(word));

    // If it has off-topic words and absolutely no workshop context, block it
    if (containsOffTopic && !containsOnTopic) {
      return { isOffTopic: true, reason: `Off-topic keyword detected in query.` };
    }

    // General prompt injection or general question checks
    if (q.length > 5 && !containsOnTopic && (q.startsWith("write a") || q.startsWith("how to") || q.startsWith("tell me"))) {
      return { isOffTopic: true, reason: `General knowledge / creative request without workshop context.` };
    }

    return { isOffTopic: false, reason: "Query aligns with workshop domains." };
  };

  const getAIResponse = (query: string): { text: string; trace: TraceLog } => {
    const q = query.toLowerCase();
    
    // Step 1: Run Layer 3 - Programmatic Filtering
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

    // Dynamic RAG retrieval simulator based on query keywords
    let contextRetrieved = "";
    let systemPromptAction = "";
    let responseText = "";

    // Python version issue
    if (q.includes("python") || q.includes("3.13") || q.includes("3.12") || q.includes("version") || q.includes("compile") || q.includes("scikit")) {
      contextRetrieved = "Retrieved 1 chunk from Guides.tsx [L200-210] (Python 3.13 build error and scikit-learn mismatch).";
      systemPromptAction = "Persona enforced: concept hint provided, direct code solution withheld.";
      responseText = "⚠️ **Python 3.13 is NOT compatible with the workshop runtime!**\n\nOlder machine learning packages like `scikit-learn==1.3.2` do not have pre-built binaries for Python 3.13, causing Cloud Build to fail compilation.\n\n**Hint:** Click **Edit source**, check the **Runtime** dropdown, change it from Python 3.13 to **Python 3.12**, and redeploy. This will allow scikit-learn to download smoothly!";
    }
    // Quota limits
    else if (q.includes("quota") || q.includes("exceed") || q.includes("limit") || q.includes("stuck") || q.includes("delete") || q.includes("cleanup") || q.includes("remove")) {
      contextRetrieved = "Retrieved 1 chunk from CommonIssues.tsx [L17-24] (Sandbox Quota cleanup routines for Cloud Run & Artifact Registry).";
      systemPromptAction = "Persona enforced: structured steps provided.";
      responseText = "🛑 **Exceeded Quota / Stuck Deployments:**\n\nThe GCP student sandbox has extremely tight resource limits. If you have a failed or stuck deployment, it blocks all future creation attempts.\n\n**Conceptual Guide:**\n1. Search for **Cloud Run** and delete any old services.\n2. Search for **Eventarc** $\\rightarrow$ Triggers and clear active triggers.\n3. Search for **Artifact Registry** $\\rightarrow$ select `gcf-artifacts` and clear old builds to recover storage quota!";
    }
    // Roll number casing
    else if (q.includes("casing") || q.includes("capital") || q.includes("lowercase") || q.includes("uppercase") || q.includes("f letter") || q.includes("roll")) {
      contextRetrieved = "Retrieved 1 chunk from CommonIssues.tsx [L35-42] (Roll number casing sensitivity discrepancy).";
      systemPromptAction = "Persona enforced: highlight structural logic rather than giving copy-paste code.";
      responseText = "🔠 **Casing Rules for Roll Numbers (Crucial discrepancy):**\n\nGoogle Cloud and the grading bot have opposite rules:\n* **GCP Console (Bucket name):** Must be lowercase 'f' (e.g., `25f2007841_data_storage`).\n* **Python Code (`roll` variable inside main.py):** Must be uppercase 'F' (e.g., `roll = \"25F2007841\"`). The grading bot strictly expects an uppercase F and will ignore your score if it is sent in lowercase!";
    }
    // Spelling typo / Bucket parameters
    else if (q.includes("spelling") || q.includes("date") || q.includes("data") || q.includes("typo") || q.includes("bucket_name") || q.includes("model_files")) {
      contextRetrieved = "Retrieved 1 chunk from Guides.tsx [L122-129] and main_gcs.py [L13-25] (Eventarc dynamic trigger arguments).";
      systemPromptAction = "Persona enforced: offer mock schema examples.";
      responseText = "✏️ **Bucket Name Typos & Hardcoded Params:**\n\nHardcoding bucket names like `'model_files'` or `'25f1000133_date_storage'` (spelling typos) crashes with `404 NotFound` at startup.\n\n**Hint:** Always use the dynamic Eventarc parameter `bucket_name` instead of hardcoding any text strings. Let Google Cloud automatically tell the script which bucket triggered it!";
    }
    // Trigger issue / Eventarc
    else if (q.includes("trigger") || q.includes("eventarc") || q.includes("upload") || q.includes("not working") || q.includes("not trigger") || q.includes("test.csv")) {
      contextRetrieved = "Retrieved 1 chunk from Guides.tsx [L244-255] (Region mismatch and Eventarc propagation delay).";
      systemPromptAction = "Persona enforced: explain synchronization delays conceptually.";
      responseText = "⚡ **Eventarc Trigger Mismatch or Lag:**\n\nIf uploading `test.csv` has no effect:\n1. Ensure BOTH your Storage Bucket and Cloud Run Function are in **us-central1 (Iowa)**. Triggers fail across different regions.\n2. Eventarc IAM permissions take **2–10 minutes** to propagate on first creation. Wait 5 minutes, then re-upload `test.csv` (checking **Overwrite**).";
    }
    // General fallback
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
      // Call the live Next.js RAG API endpoint!
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-5) // Send last 5 messages for memory context
        })
      });

      if (!response.ok) {
        throw new Error("API call failed.");
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
      setExpandedTraceIndex(newMessages.length);

    } catch (err) {
      console.warn("Live LLM API unavailable, falling back to simulated local RAG:", err);
      // Fallback to offline local simulation
      setTimeout(() => {
        const { text, trace } = getAIResponse(textToSend);
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
        setExpandedTraceIndex(newMessages.length);
      }, 800);
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-[#0088cc] to-[#7a3ec8] text-white shadow-[0_4px_20px_rgba(0,136,204,0.3)] hover:scale-105 transition-all duration-300 flex items-center justify-center cursor-pointer group"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        
        {/* Pulsing indicator */}
        <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white"></span>
        </span>
      </button>

      {/* Glassmorphic Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[90vw] md:w-[420px] h-[580px] rounded-2xl glass-panel shadow-[0_10px_40px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-[var(--border-color)] animate-fadeIn">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-[#0088cc]/10 to-[#7a3ec8]/10 border-b border-[var(--border-color)] flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-r from-[#0088cc] to-[#7a3ec8] rounded-xl text-white">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5 font-sans">
                  {"IITM Pipeline Assistant"}
                  <Sparkles size={12} className="text-amber-500 animate-pulse" />
                </h3>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  {"Online & Guarded"}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[var(--text-muted)] hover:text-gray-900 transition-colors p-1.5 rounded-lg hover:bg-black/5 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4 bg-[rgba(255,255,255,0.02)] scrollbar-thin">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col max-w-[85%] gap-1.5 ${
                  msg.sender === "user" ? "self-end items-end" : "self-start items-start"
                }`}
              >
                {/* Chat Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 text-xs md:text-sm whitespace-pre-line leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-[#0088cc] to-[#7a3ec8] text-white rounded-tr-none font-sans"
                      : "bg-white/95 border border-[var(--border-color)] text-gray-800 rounded-tl-none font-sans"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Collapsible Architecture Guardrail Log */}
                {msg.sender === "ai" && msg.traceLog && (
                  <div className="w-full mt-1">
                    <button
                      onClick={() => setExpandedTraceIndex(expandedTraceIndex === index ? null : index)}
                      className={`flex items-center gap-1 text-[10px] font-bold tracking-wide uppercase transition-colors px-2 py-1 rounded bg-black/5 ${
                        msg.traceLog.passed ? "text-[#0088cc] hover:text-[#005580]" : "text-[#ef4444] hover:text-red-700"
                      }`}
                    >
                      {msg.traceLog.passed ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                      {"Architecture Guardrail Trace"}
                      {expandedTraceIndex === index ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    
                    {expandedTraceIndex === index && (
                      <div className="mt-1.5 p-3 rounded-lg border border-[var(--border-color)] bg-black/5 font-mono text-[10px] text-[var(--text-muted)] flex flex-col gap-2 animate-fadeIn leading-relaxed">
                        <div className="border-b border-[var(--border-color)] pb-1.5 flex justify-between items-center">
                          <span className="font-bold text-gray-900">{"🛡️ Security Architecture Logs"}</span>
                          <span className={`font-semibold px-1.5 py-0.5 rounded text-[8px] ${
                            msg.traceLog.passed ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                          }`}>
                            {msg.traceLog.passed ? "PASSED" : "BLOCKED"}
                          </span>
                        </div>
                        <div>
                          <strong className="text-gray-800">{"[Layer 3] Intent Classifier: "}</strong>
                          <span>{msg.traceLog.layer3}</span>
                        </div>
                        <div>
                          <strong className="text-gray-800">{"[Layer 2] RAG Retrieval: "}</strong>
                          <span className="flex items-center gap-1 mt-0.5"><Database size={10} /> {msg.traceLog.layer2}</span>
                        </div>
                        <div>
                          <strong className="text-gray-800">{"[Layer 1] System Rules: "}</strong>
                          <span className="flex items-center gap-1 mt-0.5"><FileText size={10} /> {msg.traceLog.layer1}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <span className="text-[9px] text-[var(--text-muted)] px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="self-start flex flex-col items-start gap-1 max-w-[80%]">
                <div className="bg-white/95 border border-[var(--border-color)] text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center">
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="px-4 py-3 border-t border-[var(--border-color)] flex gap-2 items-center overflow-x-auto whitespace-nowrap scrollbar-none bg-black/[0.01] min-h-[52px]">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="text-[10px] md:text-xs font-semibold px-3 py-1 rounded-full border border-[var(--border-color)] bg-white/40 hover:border-[#0088cc] hover:text-[#0088cc] hover:bg-white/80 transition-all cursor-pointer shadow-sm flex-shrink-0 focus:outline-none focus:ring-1.5 focus:ring-[#0088cc]/40"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 border-t border-[var(--border-color)] flex gap-2 items-center bg-white/80 backdrop-blur-md"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-grow bg-white/50 border border-[var(--border-color)] rounded-xl py-2.5 px-4 text-xs md:text-sm text-gray-900 focus:outline-none focus:border-[#0088cc] transition-colors font-sans"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#7a3ec8] text-white hover:opacity-95 disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center shadow-sm"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

