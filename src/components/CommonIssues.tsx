"use client";

import { AlertTriangle, Trash2, Globe, Type, RefreshCw, Code, Info } from "lucide-react";

export default function CommonIssues() {
  const issues = [
    {
      id: "python-version",
      title: "Python 3.13 Mismatch",
      problem: "Selecting Python 3.13 causes the deployment to FAIL because older ML libraries like 'scikit-learn==1.3.2' are incompatible.",
      fix: "Select Python 3.12 from the Runtime dropdown during Cloud Run Function setup.",
      icon: <RefreshCw className="text-amber-500" size={20} />,
      colorClass: "border-amber-500/20 bg-amber-500/[0.02] hover:border-amber-500/40",
      accentText: "text-amber-500"
    },
    {
      id: "quota-limit",
      title: "Exceeded Quota / Stuck Builds",
      problem: "The student sandbox allows very few active services. A previously failed deployment blocks all new creations.",
      fix: "Search for 'Cloud Run', 'Eventarc Triggers', and 'Artifact Registry' and delete all old/failed services.",
      icon: <Trash2 className="text-red-500" size={20} />,
      colorClass: "border-red-500/20 bg-red-500/[0.02] hover:border-red-500/40",
      accentText: "text-red-500"
    },
    {
      id: "region-mismatch",
      title: "Region Mismatch (Trigger Lag)",
      problem: "GCS triggers (Eventarc) do not fire if your Bucket and Cloud Run Function are in different regions.",
      fix: "Manually select us-central1 (Iowa) for both your Storage Bucket and Cloud Run Function.",
      icon: <Globe className="text-[#0088cc]" size={20} />,
      colorClass: "border-[#0088cc]/20 bg-[#0088cc]/[0.02] hover:border-[#0088cc]/40",
      accentText: "text-[#0088cc]"
    },
    {
      id: "case-sensitivity",
      title: "Casing Rules for Roll Numbers",
      problem: "GCP console requires lowercase names for buckets, but the IITM grading bot strictly requires uppercase 'F' inside the code payload.",
      fix: "Use lowercase 'f' for bucket name in GCP console, but always use uppercase 'F' in your main.py roll variable.",
      icon: <Type className="text-purple-500" size={20} />,
      colorClass: "border-purple-500/20 bg-purple-500/[0.02] hover:border-purple-500/40",
      accentText: "text-purple-500"
    },
    {
      id: "function-signatures",
      title: "Code Modifications & Argument Crashes",
      problem: "Modifying function arguments (like adding 'bucket_name' to _load_model() without updating the brackets) crashes with NameError / TypeError.",
      fix: "Do not mix/edit code manually! Copy-paste the entire generated code from our site's copy box.",
      icon: <Code className="text-emerald-500" size={20} />,
      colorClass: "border-emerald-500/20 bg-emerald-500/[0.02] hover:border-emerald-500/40",
      accentText: "text-emerald-500"
    },
    {
      id: "bucket-naming-typo",
      title: "Incorrect Bucket Naming & Typo Errors",
      problem: "Naming your bucket with typos (like '_date_storage' instead of '_data_storage') prevents code from finding the correct folder.",
      fix: "Ensure your code uses dynamic event variables like 'data[\"bucket\"]' rather than hardcoded bucket name strings.",
      icon: <Info className="text-pink-500" size={20} />,
      colorClass: "border-pink-500/20 bg-pink-500/[0.02] hover:border-pink-500/40",
      accentText: "text-pink-500"
    }
  ];

  return (
    <section className="glass-panel p-6 md:p-8 relative overflow-hidden flex flex-col gap-6 w-full">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ef4444] to-transparent" />
      
      <div className="flex flex-col gap-1">
        <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 flex items-center gap-2.5">
          <AlertTriangle className="text-red-500 animate-pulse" size={22} />
          {"🔥 Critical Pitfalls & Common Issues"}
        </h2>
        <p className="text-xs md:text-sm text-[var(--text-muted)]">
          {"Ensure you double-check these 6 main roadblocks to ensure your pipeline grades successfully."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className={`border rounded-xl p-5 flex flex-col gap-3 transition-all duration-300 ${issue.colorClass}`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black/5 rounded-lg">
                {issue.icon}
              </div>
              <h3 className="font-bold text-gray-900 text-sm md:text-base">
                {issue.title}
              </h3>
            </div>
            
            <div className="text-xs flex flex-col gap-2 flex-grow">
              <p className="text-[var(--text-muted)] leading-relaxed">
                <strong className="text-gray-700">{"Problem: "}</strong>
                {issue.problem}
              </p>
              <div className="bg-black/5 border-l-2 border-current p-2.5 rounded-r-md mt-auto">
                <p className="text-gray-900 font-medium">
                  <strong className={`font-bold uppercase tracking-wider text-[10px] mr-1 ${issue.accentText}`}>{"Fix:"}</strong>
                  {issue.fix}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
