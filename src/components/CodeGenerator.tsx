"use client";

import { useState } from "react";
import { FileCode, Download, Check, Copy } from "lucide-react";

interface Props {
  rollNumber: string;
}

const requirementsContent = `functions-framework==3.*
pandas
scikit-learn==1.3.2
joblib
flask
numpy
google-cloud-storage
google-cloud-pubsub`;

const testCsvContent = `age,gender,cp,trestbps,chol,fbs,restecg,thalach,exang,oldpeak,slope,ca,thal
69,0,2,140.0,254.0,0,0,146.0,0,2.0,1,3,3
53,1,0,130.0,264.0,0,0,143.0,0,0.4,1,0,2
66,0,0,160.0,228.0,0,0,138.0,0,2.3,2,0,1
44,0,1,120.0,220.0,0,1,170.0,0,0.0,2,0,2
47,0,0,110.0,275.0,0,0,118.0,1,1.0,1,1,2
62,1,0,140.0,268.0,0,0,160.0,0,3.6,0,2,2
54,1,2,110.0,214.0,0,1,158.0,0,1.6,1,0,2
41,0,0,110.0,172.0,0,0,158.0,0,0.0,2,0,3
43,0,0,115.0,303.0,0,1,181.0,0,1.2,1,0,2
60,0,0,130.0,253.0,0,1,144.0,1,1.4,2,1,3
55,0,0,132.0,353.0,0,1,132.0,1,1.2,1,1,3
53,0,2,130.0,197.0,1,0,152.0,0,1.2,0,0,2
52,0,1,120.0,325.0,0,1,172.0,0,0.2,2,0,2
61,0,3,134.0,234.0,0,1,145.0,0,2.6,1,2,2
53,0,2,130.0,246.0,1,0,173.0,0,0.0,2,3,2
58,1,2,120.0,340.0,0,1,172.0,0,0.0,2,0,2
69,0,3,160.0,234.0,1,0,131.0,0,0.1,1,1,2
52,0,0,125.0,212.0,0,1,168.0,0,1.0,2,2,3
48,0,0,130.0,256.0,1,0,150.0,1,0.0,2,2,3
41,1,1,105.0,198.0,0,1,168.0,0,0.0,2,1,2`;

export default function CodeGenerator({ rollNumber }: Props) {
  const [copiedMain, setCopiedMain] = useState(false);
  const [copiedReq, setCopiedReq] = useState(false);

  const cleanRoll = rollNumber.trim() || "24F2001627";

  const mainPyContent = `import os
import io
import json
import joblib
import pandas as pd
from datetime import datetime
from google.cloud import storage, pubsub_v1
import functions_framework

# Load model once at module scope for performance
_MODEL_ARTIFACT = None

def _load_model(bucket_name):
    global _MODEL_ARTIFACT
    if _MODEL_ARTIFACT is None:
        local_model_path = "/tmp/model.joblib"
        if not os.path.exists(local_model_path):
            print(f"Downloading model.joblib from GCS bucket: {bucket_name}...")
            storage_client = storage.Client()
            bucket = storage_client.bucket(bucket_name)
            blob = bucket.blob("model.joblib")
            blob.download_to_filename(local_model_path)
            print("Model downloaded successfully.")
        _MODEL_ARTIFACT = joblib.load(local_model_path)
    return _MODEL_ARTIFACT

def _compute_summary_stats(df: pd.DataFrame) -> str:
    """Generate summary statistics for the dataframe."""
    return df.describe().to_string()

def _publish_accuracy(project_id: str, topic: str, accuracy: float, roll_number: str):
    """Publish accuracy results to Pub/Sub topic."""
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(project_id, topic)

    # Cast accuracy to string to satisfy Pub/Sub schema validation
    payload = json.dumps({
        "accuracy": str(accuracy),
        "roll_number": roll_number
    }).encode('utf-8')

    print(f"Publishing to topic: {topic_path}")
    print(f"Payload: {payload.decode('utf-8')}")

    future = publisher.publish(topic_path, payload)
    message_id = future.result(timeout=30)
    print(f"Message published successfully. Message ID: {message_id}")
    return message_id

def _run_inference(bucket_name: str, file_name: str):
    roll = "${cleanRoll}"
    
    # Try to get the project ID dynamically, fallback to workshop project
    project_id = os.environ.get("GCP_PROJECT") or os.environ.get("GOOGLE_CLOUD_PROJECT") or "iitm-gcp-workshop"

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)

    # Download uploaded CSV data from the bucket
    csv_bytes = bucket.blob(file_name).download_as_bytes()
    df = pd.read_csv(io.BytesIO(csv_bytes))

    # Download test targets from GCS bucket if not present locally
    local_targets_path = "/tmp/test_targets.csv"
    if not os.path.exists(local_targets_path):
        print(f"Downloading test_targets.csv from GCS bucket: {bucket_name}...")
        bucket.blob("test_targets.csv").download_to_filename(local_targets_path)
        print("Test targets downloaded successfully.")
    
    targets_df = pd.read_csv(local_targets_path)

    # Load model and features
    art = _load_model(bucket_name)
    model = art['model']
    features = art['feature_names']

    # Align columns with the features expected by the model
    X = df.copy()
    for col in features:
        if col not in X.columns:
            X[col] = 0
    X = X[features]

    # Run prediction
    preds = model.predict(X)
    
    # Map targets (yes -> 1, no -> 0)
    y_true = targets_df['target'].map({'yes': 1, 'no': 0}).astype(int)

    # Compute accuracy
    accuracy = float((preds == y_true.values).mean())
    print(f"Calculated accuracy: {accuracy}")

    # Generate summary stats
    stats = _compute_summary_stats(df)

    # Save summary stats to the output bucket (trying both possible names to be robust)
    timestamp = int(datetime.utcnow().timestamp())
    stats_path = f"{roll}/{roll}_{timestamp}.txt"
    
    output_buckets = ['iitm_gcp_workshop_inference_bucket', 'inference_bucket_iitm']
    uploaded = False
    
    for out_bucket_name in output_buckets:
        try:
            out_bucket = storage_client.bucket(out_bucket_name)
            out_blob = out_bucket.blob(stats_path)
            out_blob.upload_from_string(stats)
            print(f"Successfully uploaded stats to gs://{out_bucket_name}/{stats_path}")
            uploaded = True
            break
        except Exception as e:
            print(f"Failed to upload to bucket {out_bucket_name}: {e}. Trying next bucket.")
            
    if not uploaded:
        raise RuntimeError("Failed to upload summary stats to any of the designated workshop buckets.")

    # Publish to Pub/Sub (trying both possible topic names)
    topics = ['iitm_gcp_workshop_inference_accuracy_topic', 'inference_accuracy_topic']
    message_id = None
    
    for topic_name in topics:
        try:
            message_id = _publish_accuracy(project_id, topic_name, accuracy, roll)
            print(f"Successfully published accuracy to topic: {topic_name}")
            break
        except Exception as e:
            print(f"Failed to publish to topic {topic_name}: {e}. Trying next topic.")

    if not message_id:
        raise RuntimeError("Failed to publish accuracy to any of the designated Pub/Sub topics.")

    return {
        'status': 'ok',
        'accuracy': accuracy,
        'stats_path': stats_path,
        'message_id': message_id
    }

@functions_framework.cloud_event
def gcs_inference(cloud_event):
    """Eventarc GCS Trigger handler."""
    data = cloud_event.data
    bucket = data["bucket"]
    name = data["name"]

    print(f"Event triggered by file: {name} in bucket: {bucket}")
    
    # Skip system/model files and only process user uploaded data files
    if name.endswith('.csv') and name != 'test_targets.csv':
        result = _run_inference(bucket, name)
        return json.dumps(result)
    else:
        print(f"File {name} is not a data CSV, skipping inference.")
        return json.dumps({'status': 'ignored'})`;

  const handleDownload = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="glass-panel p-6 flex flex-col gap-6">
      <h2 className="text-xl font-bold flex items-center gap-3 text-gray-900">
        <FileCode className="text-[#7a3ec8]" /> Asset Generator
      </h2>

      {/* Button Stack */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => handleDownload("main.py", mainPyContent, "text/plain")}
          className="w-full bg-gradient-to-r from-[#0088cc] to-[#7a3ec8] text-white font-bold p-3.5 rounded-xl hover:shadow-[0_4px_15px_rgba(0,136,204,0.2)] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download size={18} /> Download main.py
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() =>
              handleDownload("requirements.txt", requirementsContent, "text/plain")
            }
            className="bg-white border border-gray-300 text-gray-800 font-semibold py-3 px-2 text-xs md:text-sm rounded-xl hover:bg-gray-50 hover:border-[#0088cc] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download size={16} /> requirements.txt
          </button>

          <button
            onClick={() => handleDownload("test.csv", testCsvContent, "text/csv")}
            className="bg-white border border-gray-300 text-gray-800 font-semibold py-3 px-2 text-xs md:text-sm rounded-xl hover:bg-gray-50 hover:border-[#0088cc] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download size={16} /> test.csv (Trigger Data)
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <a
            href="/model.joblib"
            download="model.joblib"
            className="bg-white border border-gray-300 text-gray-800 font-semibold py-3 px-2 text-xs md:text-sm rounded-xl hover:bg-gray-50 hover:border-[#0088cc] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download size={16} /> model.joblib
          </a>

          <a
            href="/test_targets.csv"
            download="test_targets.csv"
            className="bg-white border border-gray-300 text-gray-800 font-semibold py-3 px-2 text-xs md:text-sm rounded-xl hover:bg-gray-50 hover:border-[#0088cc] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download size={16} /> test_targets.csv
          </a>
        </div>
      </div>

      {/* main.py code window */}
      <div className="code-container">
        <div className="flex justify-between items-center bg-[rgba(255,255,255,0.02)] px-4 py-2 border-b border-[var(--border-color)] text-xs text-[var(--text-muted)]">
          <span className="font-mono">main.py</span>
          <button
            onClick={() => handleCopy(mainPyContent, setCopiedMain)}
            className="flex items-center gap-1.5 hover:text-[#0088cc] transition-colors cursor-pointer"
          >
            {copiedMain ? <Check size={14} className="text-[#059669]" /> : <Copy size={14} />}
            {copiedMain ? "Copied!" : "Copy Code"}
          </button>
        </div>
        <pre className="code-pre">
          <code>
            {mainPyContent.split("\n").map((line, i) => (
              <span key={i} className="block">
                {line || " "}
              </span>
            ))}
          </code>
        </pre>
      </div>

      {/* requirements.txt code window */}
      <div className="code-container">
        <div className="flex justify-between items-center bg-[rgba(255,255,255,0.02)] px-4 py-2 border-b border-[var(--border-color)] text-xs text-[var(--text-muted)]">
          <span className="font-mono">requirements.txt</span>
          <button
            onClick={() => handleCopy(requirementsContent, setCopiedReq)}
            className="flex items-center gap-1.5 hover:text-[#0088cc] transition-colors cursor-pointer"
          >
            {copiedReq ? <Check size={14} className="text-[#059669]" /> : <Copy size={14} />}
            {copiedReq ? "Copied!" : "Copy Code"}
          </button>
        </div>
        <pre className="code-pre">
          <code>{requirementsContent}</code>
        </pre>
      </div>
    </div>
  );
}
