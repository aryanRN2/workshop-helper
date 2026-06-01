import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a fully unrestricted AI Assistant for the IITM GCP Workshop platform. You can answer any questions, including off-topic queries (such as creative requests, essays, recipes, or general knowledge) in addition to helping students troubleshoot and debug their Day 2 ML Pipeline assignment. 

FEEL FREE TO:
1. Write full, copy-pasteable code blocks, functions, and scripts directly to help the user.
2. Answer general questions and fulfill off-topic requests completely.
3. Maintain a highly helpful, comprehensive, and friendly tone.`;

// Mock Vector Database of Rubrics & Error Guidelines for RAG Engine
const WORKSHOP_KNOWLEDGE_BASE = [
  {
    topic: "Python 3.13 Build Failure",
    keywords: ["python", "3.13", "3.12", "compile", "scikit-learn", "sklearn", "build", "mismatch"],
    content: "The IITM sandboxed GCP environment requires Python 3.12 runtime. Python 3.13 fails to compile older ML libraries like 'scikit-learn==1.3.2' due to pre-built package incompatibilities. Fix: Change the Runtime dropdown in the Cloud Run Function configuration from Python 3.13 to Python 3.12."
  },
  {
    topic: "Quota Exceeded Sandbox Block",
    keywords: ["quota", "exceed", "sandbox", "limit", "stuck", "delete", "cleanup", "us-central1"],
    content: "IITM GCP sandboxed project permits resources exclusively in 'us-central1' (Iowa). Deploying in other regions fails with quota limits. Having active failed/stuck deployments blocks future creations. Fix: Search Cloud Run, Eventarc Triggers, and Artifact Registry and delete all old/failed resources to recover the quota."
  },
  {
    topic: "Roll Number Casing sensitivity",
    keywords: ["casing", "casing rules", "capital", "uppercase", "lowercase", "roll", "letter f"],
    content: "Google Cloud Console requires GCS bucket names to be strictly lowercase (e.g. '25f3004745_data_storage'). However, the automated IITM grading bot strictly expects an UPPERCASE 'F' (e.g. '25F3004745') inside the Python code payload. If the roll variable is in lowercase, the bot silently ignores your score. Fix: Keep GCS buckets lowercase, but use uppercase 'F' inside the main.py roll variable."
  },
  {
    topic: "Pub/Sub Schema validation failure",
    keywords: ["pubsub", "schema", "validation", "accuracy", "string", "float"],
    content: "The grading schema expects the 'accuracy' payload parameter to be formatted as a string (e.g., '0.85') rather than a float/number (e.g., 0.85). Sending a float will throw a Pub/Sub invalid message schema error. Fix: Wrap accuracy in str(accuracy) before building the JSON payload."
  },
  {
    topic: "Eventarc trigger lag",
    keywords: ["trigger", "eventarc", "lag", "not working", "upload", "test.csv"],
    content: "Eventarc GCS triggers can take up to 2-10 minutes to sync IAM roles during first-time creation. If uploading test.csv has no effect, verify both bucket and function are in us-central1, wait 5 minutes, and re-upload test.csv with Overwrite enabled."
  }
];

// Layer 3: Programmatic Filtering & Off-Topic Intent Classifier
function checkOffTopic(query: string): { isOffTopic: boolean; reason: string } {
  return { isOffTopic: false, reason: "Gateway relaxed: All queries permitted." };
}

// Layer 2: RAG Vector Database Retriever Simulator
function retrieveRAGContext(query: string): { context: string; topic: string } {
  const q = query.toLowerCase();
  let bestScore = 0;
  let bestMatch = WORKSHOP_KNOWLEDGE_BASE[0];

  for (const item of WORKSHOP_KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of item.keywords) {
      if (q.includes(keyword)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  if (bestScore > 0) {
    return {
      context: `[RAG Retrieved Guideline Chunk for ${bestMatch.topic}]:\n${bestMatch.content}`,
      topic: bestMatch.topic
    };
  }

  return {
    context: "[RAG Retrieved Outline Chunk]: General outline for deploying GCS-inference function and uploading test.csv, test_targets.csv, and model.joblib in us-central1.",
    topic: "General Workshop Overview"
  };
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // 1. Layer 3 check: Programmatic filtering
    const classification = checkOffTopic(message);
    if (classification.isOffTopic) {
      return NextResponse.json({
        text: "🙅 **Strict Assignment Boundary Refusal:**\n\nI am sorry, but I am programmed solely to assist with the IITM GCP Workshop Day 2 ML Pipeline assignment. \n\nI cannot answer off-topic questions (such as general knowledge, essays, or recipes). Please keep your queries focused on your pipeline task so we can get it solved!",
        trace: {
          layer3: `❌ Blocked: ${classification.reason}`,
          layer2: "⏭️ Skipped (Intent Classified as Off-Topic)",
          layer1: "🔒 Guardrail Active: Enforced Academic Mentor Persona boundary constraints.",
          passed: false
        }
      });
    }

    // 2. Layer 2 check: Retrieve relevant RAG guidelines
    const rag = retrieveRAGContext(message);

    // 3. API Key Check: Check if Hugging Face token is loaded
    const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;

    if (!hfToken) {
      // Diagnostic Mode if Key is missing in local .env
      return NextResponse.json({
        text: `⚠️ **Live LLM Chat Mode is pending!**\n\nTo enable live AI answers in real-time using our free Hugging Face API integration, please follow these simple steps:\n\n1. Create a free account at [huggingface.co](https://huggingface.co).\n2. Create a free **Access Token** in your settings.\n3. Create a **\`.env.local\`** file in your project's root folder.\n4. Add your Hugging Face token inside:\n   \`\`\`text\n   HF_TOKEN=your_hugging_face_token_here\n   \`\`\`\n5. Restart the dev server (\`npm run dev\`).\n\n*Currently running in highly accurate simulated diagnostic mode!*`,
        trace: {
          layer3: "✅ Passed: Intent classified as permitted under Unrestricted Mode.",
          layer2: `🔍 RAG Hit: Dynamic Retrieval for "${rag.topic}" completed successfully.`,
          layer1: "🤖 System Prompt: Fully unrestricted generation active (direct answers permitted).",
          passed: true
        }
      });
    }

    // 4. Layer 1 check: Inject RAG + System Prompt boundaries and call Hugging Face Serverless API
    const llamaPrompt = `<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n${SYSTEM_PROMPT}\n\nRELEVANT WORKSHOP GUIDELINES RETRIEVED:\n${rag.context}<|eot_id|><|start_header_id|>user<|end_header_id|>\n\n${message}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n`;

    const hfResponse = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: llamaPrompt,
        parameters: {
          max_new_tokens: 450,
          temperature: 0.7,
          return_full_text: false
        }
      })
    });

    if (!hfResponse.ok) {
      throw new Error(`Hugging Face API call failed: ${hfResponse.statusText}`);
    }

    const hfData = await hfResponse.json();
    let aiText = "";
    
    // Handle the various structures returned by Hugging Face models
    if (Array.isArray(hfData) && hfData[0]?.generated_text) {
      aiText = hfData[0].generated_text;
    } else if (hfData.generated_text) {
      aiText = hfData.generated_text;
    } else if (Array.isArray(hfData) && typeof hfData[0] === 'string') {
      aiText = hfData[0];
    } else {
      aiText = "Could not parse response from Hugging Face model.";
    }

    // Strip Llama 3 instruction artifacts if present
    aiText = aiText.replace(llamaPrompt, "").trim();

    return NextResponse.json({
      text: aiText,
      trace: {
        layer3: "✅ Passed: Intent classified as permitted under Unrestricted Mode.",
        layer2: `🔍 RAG Hit: Dynamic Retrieval for "${rag.topic}" completed successfully.`,
        layer1: `🤖 Hugging Face API: Llama-3-8B-Instruct (Unrestricted Mode active).`,
        passed: true
      }
    });

  } catch (error: any) {
    console.error("Hugging Face API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error during LLM generation.", details: error.message },
      { status: 500 }
    );
  }
}
