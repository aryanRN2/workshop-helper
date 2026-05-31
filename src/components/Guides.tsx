"use client";

import { useState } from "react";
import { Rocket, TriangleAlert } from "lucide-react";

interface Props {
  rollNumber: string;
}

export default function Guides({ rollNumber }: Props) {
  const [activeTab, setActiveTab] = useState<"walkthrough" | "troubleshoot">("walkthrough");

  const cleanRoll = rollNumber.trim() || "24F2001627";

  return (
    <div className="glass-panel p-6 flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-[var(--border-color)] mb-6 gap-4">
        <button
          onClick={() => setActiveTab("walkthrough")}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "walkthrough"
              ? "border-[#0088cc] text-[#0088cc] shadow-[0_4px_10px_rgba(0,136,204,0.05)]"
              : "border-transparent text-[var(--text-muted)] hover:text-white"
          }`}
        >
          <Rocket size={16} /> {"Setup Guide"}
        </button>

        <button
          onClick={() => setActiveTab("troubleshoot")}
          className={`pb-3 font-semibold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "troubleshoot"
              ? "border-[#0088cc] text-[#0088cc] shadow-[0_4px_10px_rgba(0,136,204,0.05)]"
              : "border-transparent text-[var(--text-muted)] hover:text-white"
          }`}
        >
          <TriangleAlert size={16} /> {"Error Fixes"}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "walkthrough" ? (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Warning Alert */}
          <div className="bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.25)] rounded-xl p-4 flex gap-3.5 items-start">
            <TriangleAlert className="text-[var(--warning-color)] flex-shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-gray-800">
              <h4 className="font-bold text-gray-900 mb-1">{"Critical Checkpoint"}</h4>
              <p className="text-[var(--text-muted)]">
                {"Make sure you are logged into your official IITM student account in Google Cloud Console, and ensure the project selected at the top is exactly "}<strong>{"IITM-GCP-Workshop"}</strong>{"."}
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-5">
            <div className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-color)] rounded-xl p-5 hover:border-[rgba(0,136,204,0.15)] transition-all flex gap-4">
              <div className="w-9 h-9 rounded-full bg-[rgba(0,136,204,0.05)] border border-[rgba(0,136,204,0.15)] text-[#0088cc] font-bold flex items-center justify-center flex-shrink-0 text-sm">
                {"1"}
              </div>
              <div className="text-sm">
                <h3 className="font-bold text-gray-900 mb-1.5">{"Create GCS Bucket"}</h3>
                <p className="text-[var(--text-muted)] mb-3">
                  {"Go to Cloud Storage > Buckets > Create in the console and configure these exact values:"}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-[rgba(161,85,232,0.15)] text-[#a155e8] border border-[rgba(161,85,232,0.2)] px-2.5 py-1 rounded-md font-mono">
                    {"Name: "}{cleanRoll}{"_data_storage"}
                  </span>
                  <span className="bg-[rgba(161,85,232,0.15)] text-[#a155e8] border border-[rgba(161,85,232,0.2)] px-2.5 py-1 rounded-md font-mono">
                    {"Region: us-central1 (Iowa)"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-color)] rounded-xl p-5 hover:border-[rgba(0,136,204,0.15)] transition-all flex gap-4">
              <div className="w-9 h-9 rounded-full bg-[rgba(0,136,204,0.05)] border border-[rgba(0,136,204,0.15)] text-[#0088cc] font-bold flex items-center justify-center flex-shrink-0 text-sm">
                {"2"}
              </div>
              <div className="text-sm">
                <h3 className="font-bold text-gray-900 mb-1.5">{"Upload Helper Files"}</h3>
                <p className="text-[var(--text-muted)] mb-3">
                  {"Open your bucket and click "}<strong>{"Upload files"}</strong>{" to upload these two helper files from the workshop materials:"}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-[rgba(161,85,232,0.15)] text-[#a155e8] border border-[rgba(161,85,232,0.2)] px-2.5 py-1 rounded-md font-mono">
                    {"model.joblib"}
                  </span>
                  <span className="bg-[rgba(161,85,232,0.15)] text-[#a155e8] border border-[rgba(161,85,232,0.2)] px-2.5 py-1 rounded-md font-mono">
                    {"test_targets.csv"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-color)] rounded-xl p-5 hover:border-[rgba(0,136,204,0.15)] transition-all flex gap-4">
              <div className="w-9 h-9 rounded-full bg-[rgba(0,136,204,0.05)] border border-[rgba(0,136,204,0.15)] text-[#0088cc] font-bold flex items-center justify-center flex-shrink-0 text-sm">
                {"3"}
              </div>
              <div className="text-sm">
                <h3 className="font-bold text-gray-900 mb-1.5">{"Create Cloud Run Function"}</h3>
                <p className="text-[var(--text-muted)] mb-2">
                  {"Go to "}<strong>{"Cloud Run"}</strong>{", click "}<strong>{"Write a function"}</strong>{", and configure:"}
                </p>
                <div className="flex flex-wrap gap-2 text-xs mb-3">
                  <span className="bg-[rgba(161,85,232,0.15)] text-[#a155e8] border border-[rgba(161,85,232,0.2)] px-2.5 py-1 rounded-md font-mono">
                    {"Name: gcs-inference"}
                  </span>
                  <span className="bg-[rgba(161,85,232,0.15)] text-[#a155e8] border border-[rgba(161,85,232,0.2)] px-2.5 py-1 rounded-md font-mono">
                    {"Region: us-central1 (Iowa)"}
                  </span>
                  <span className="bg-[rgba(161,85,232,0.15)] text-[#a155e8] border border-[rgba(161,85,232,0.2)] px-2.5 py-1 rounded-md font-mono">
                    {"Runtime: Python 3.12"}
                  </span>
                </div>
                <p className="text-[var(--text-muted)] mb-2">{"Add Cloud Storage Trigger:"}</p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="bg-[rgba(161,85,232,0.15)] text-[#a155e8] border border-[rgba(161,85,232,0.2)] px-2.5 py-1 rounded-md font-mono">
                    {"Event type: google.cloud.storage.object.v1.finalized"}
                  </span>
                  <span className="bg-[rgba(161,85,232,0.15)] text-[#a155e8] border border-[rgba(161,85,232,0.2)] px-2.5 py-1 rounded-md font-mono">
                    {"Bucket: "}{cleanRoll}{"_data_storage"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-color)] rounded-xl p-5 hover:border-[rgba(0,136,204,0.15)] transition-all flex gap-4">
              <div className="w-9 h-9 rounded-full bg-[rgba(0,136,204,0.05)] border border-[rgba(0,136,204,0.15)] text-[#0088cc] font-bold flex items-center justify-center flex-shrink-0 text-sm">
                {"4"}
              </div>
              <div className="text-sm">
                <h3 className="font-bold text-gray-900 mb-1.5">{"Deploy Python Code"}</h3>
                <p className="text-[var(--text-muted)]">
                  {"In the code editor tab, update the files:"}
                </p>
                <ol className="list-decimal list-inside text-xs text-[var(--text-muted)] mt-2 flex flex-col gap-1.5">
                  <li>{"Paste generated code in "}<strong className="text-gray-900 font-bold">{"`main.py`"}</strong></li>
                  <li>{"Paste package requirements in "}<strong className="text-gray-900 font-bold">{"`requirements.txt`"}</strong></li>
                  <li>{"Change "}<strong>{"Function entry point"}</strong>{" to: "}<strong className="text-[#0088cc]">{"`gcs_inference`"}</strong></li>
                  <li>{"Click "}<strong>{"Save and redeploy"}</strong></li>
                </ol>
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.01)] border border-[var(--border-color)] rounded-xl p-5 hover:border-[rgba(0,136,204,0.15)] transition-all flex gap-4">
              <div className="w-9 h-9 rounded-full bg-[rgba(0,136,204,0.05)] border border-[rgba(0,136,204,0.15)] text-[#0088cc] font-bold flex items-center justify-center flex-shrink-0 text-sm">
                {"5"}
              </div>
              <div className="text-sm">
                <h3 className="font-bold text-gray-900 mb-1.5">{"Trigger ML Pipeline"}</h3>
                <p className="text-[var(--text-muted)]">
                  {"Go to your GCS bucket, click "}<strong>{"Upload files"}</strong>{", select "}<strong>{"`test.csv`"}</strong>{". Choose "}<strong className="text-[#059669] font-bold">{"Overwrite object"}</strong>{" if prompted."}
                </p>
                <p className="text-[var(--text-muted)] mt-2">
                  {"Check Cloud Run "}<strong>{"Observability > Logs"}</strong>{" and your "}<strong>{"G-Space Chat"}</strong>{" for the bot completion message! 🎓"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-5 animate-fadeIn">
          {/* Troubleshooting Cards */}
          <div className="border border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.02)] rounded-xl p-5 text-sm">
            <h4 className="font-bold text-[#ef4444] flex items-center gap-2 mb-2">
              <TriangleAlert size={16} /> {"G-Space Verification Not Received (Case Sensitivity)"}
            </h4>
            <p className="text-[var(--text-muted)] mb-3">
              {"The IITM G-Space grading system is strictly "}<strong>{"case-sensitive"}</strong>{" for roll numbers. If your code or GCS bucket uses a lowercase 'f' (e.g., "}<code>{"25f3001012"}</code>{"), the automated bot will silently fail to match your account and won't send the completion checkmark."}
            </p>
            <div className="bg-black/5 border-l-3 border-[#059669] p-3.5 rounded-r-lg">
              <p className="text-gray-900 text-xs">
                <strong>{"Fix:"}</strong>{" Always use an uppercase "}<strong>{"'F'"}</strong>{" (e.g., "}<code>{"25F3001012"}</code>{") in your GCS bucket name, Cloud Run service name, and Pub/Sub message payload. Re-deploy with the uppercase roll number to trigger the bot."}
              </p>
            </div>
          </div>

          <div className="border border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.02)] rounded-xl p-5 text-sm">
            <h4 className="font-bold text-[#ef4444] flex items-center gap-2 mb-2">
              <TriangleAlert size={16} /> {"Failed to initialize due to quota exceeded"}
            </h4>
            <p className="text-[var(--text-muted)] mb-3">
              {"In the sandboxed GCP student environment, resource creation is strictly restricted and whitelisted ONLY for the "}<strong>{"us-central1 (Iowa)"}</strong>{" region. Trying to deploy in other regions like "}<code>{"us-east1"}</code>{" or "}<code>{"europe-west3"}</code>{" will fail immediately with a quota error."}
            </p>
            <div className="bg-black/5 border-l-3 border-[#059669] p-3.5 rounded-r-lg">
              <p className="text-gray-900 text-xs">
                <strong>{"Fix:"}</strong>{" Delete the failed function and recreate it. Make sure you manually select "}<strong>{"us-central1 (Iowa)"}</strong>{" as the region during setup for both Cloud Run and Cloud Storage."}
              </p>
            </div>
          </div>

          <div className="border border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.02)] rounded-xl p-5 text-sm">
            <h4 className="font-bold text-[#ef4444] flex items-center gap-2 mb-2">
              <TriangleAlert size={16} /> {"Message failed schema validation"}
            </h4>
            <p className="text-[var(--text-muted)] mb-3">
              {"The workshop server strictly expects accuracy as a string (e.g. "}<code className="text-gray-900 font-semibold">{"\"0.55\""}</code>{"), but you sent a number (e.g. "}<code className="text-gray-900 font-semibold">{"0.55"}</code>{")."}
            </p>
            <div className="bg-black/5 border-l-3 border-[#059669] p-3.5 rounded-r-lg">
              <p className="text-gray-900 text-xs">
                <strong>{"Fix:"}</strong>{" Cast accuracy using "}<code>{"str(accuracy)"}</code>{" before building the JSON payload. Our generated code has this built in!"}
              </p>
            </div>
          </div>

          <div className="border border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.02)] rounded-xl p-5 text-sm">
            <h4 className="font-bold text-[#ef4444] flex items-center gap-2 mb-2">
              <TriangleAlert size={16} /> {"Uploading test.csv has no effect"}
            </h4>
            <p className="text-[var(--text-muted)] mb-3">
              {"This is caused by a region mismatch. Eventarc triggers do not fire if the function region differs from the GCS bucket region."}
            </p>
            <div className="bg-black/5 border-l-3 border-[#059669] p-3.5 rounded-r-lg">
              <p className="text-gray-900 text-xs">
                <strong>{"Fix:"}</strong>{" Ensure both your GCS Bucket and your Cloud Run Function are located in "}<strong>{"us-central1 (Iowa)"}</strong>{"."}
              </p>
            </div>
          </div>

          <div className="border border-[rgba(239,68,68,0.15)] bg-[rgba(239,68,68,0.02)] rounded-xl p-5 text-sm">
            <h4 className="font-bold text-[#ef4444] flex items-center gap-2 mb-2">
              <TriangleAlert size={16} /> {"Eventarc Service Agent lags"}
            </h4>
            <p className="text-[var(--text-muted)] mb-3">
              {"IAM roles and Eventarc permissions take 2–10 minutes to propagate when a trigger is set up for the first time."}
            </p>
            <div className="bg-black/5 border-l-3 border-[#059669] p-3.5 rounded-r-lg">
              <p className="text-gray-900 text-xs">
                <strong>{"Fix:"}</strong>{" Wait 5 minutes, then re-upload your "}<code>{"test.csv"}</code>{" file (using Overwrite) to re-trigger."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
