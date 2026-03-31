import { useState, useEffect } from "react";
import type { ScanResult, RiskLevel } from "../types";
import VisualCloneCompare from "./VisualCloneCompare";
import { saveScan } from "../services/scanStore";
import { getCurrentUser } from "../services/authStore";

type LiveResultsPageProps = {
  result: ScanResult;
  onBack: () => void;
};

const riskConfig: Record<
  RiskLevel,
  { color: string; label: string; banner: string }
> = {
  safe: {
    color: "text-green-400",
    label: "SAFE",
    banner: "This website appears safe based on current analysis.",
  },
  suspicious: {
    color: "text-yellow-400",
    label: "SUSPICIOUS",
    banner: "This website shows suspicious characteristics.",
  },
  phishing: {
    color: "text-red-400",
    label: "PHISHING",
    banner: "This website is likely a phishing attempt.",
  },
};

export default function LiveResultsPage({
  result,
  onBack,
}: LiveResultsPageProps) {
  const risk = riskConfig[result.riskLevel];

  // ===== SAVE SCAN TO HISTORY =====
useEffect(() => {
  const user = getCurrentUser();
  if (!user) return;

  const alreadySaved = sessionStorage.getItem("last_saved_url");

  if (alreadySaved === result.url + result.timestamp) return;

  saveScan({
    ...result,
    userId: user.id,
  });

  sessionStorage.setItem("last_saved_url", result.url + result.timestamp);
}, [result]);

  // ===== HYBRID VISUAL SIMILARITY STATE =====
  const baselineUrl =
    "https://bensonho1204.github.io/PhishGatto/visual_tests/original_login.html";

  const [pixelSim, setPixelSim] = useState<number | null>(null);

  useEffect(() => {
    setPixelSim(null);
  }, [result.url]);

  const structuralSim = result.visualAnalysis?.similarityScore ?? null;

  const hybridScore =
    structuralSim !== null && pixelSim !== null
      ? Math.round(structuralSim * 0.6 + pixelSim * 0.4)
      : null;

  const visualReasons = result.visualAnalysis?.visualReasons ?? [];

  const detected = (pattern: string) =>
    visualReasons.some((r) =>
      r.toLowerCase().includes(pattern.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-[#020617] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* TOP GRID */}
        <div className="grid md:grid-cols-2 gap-10">

          {/* LEFT: SCORE */}
          <div className="bg-[#0b1220] rounded-2xl p-8 border border-white/5">
            <h2 className="text-sm text-cyan-400 mb-2">
              LIVE PHISHING ANALYSIS
            </h2>

            <div className="flex items-center justify-between mb-6">
              <h1 className={`text-3xl font-bold ${risk.color}`}>
                {risk.label}
              </h1>
              <span className="text-gray-400 text-sm">Score</span>
            </div>

            {/* SCORE BAR */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span>Risk Score</span>
                <span>{result.score} / 100</span>
              </div>

              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${result.score}%`,
                    backgroundColor:
                      result.riskLevel === "phishing"
                        ? "#ef4444"
                        : result.riskLevel === "suspicious"
                        ? "#facc15"
                        : "#22c55e",
                  }}
                />
              </div>
            </div>

            {/* URL */}
            <div className="bg-[#071726] rounded-lg p-4 font-mono text-sm break-all">
              {result.url}
            </div>

            <p className="text-xs text-gray-400 mt-4">
              Scan completed at {result.timestamp}
            </p>
          </div>

          {/* RIGHT: SIGNALS */}
          <div className="bg-[#0b1220] rounded-2xl p-8 border border-white/5">
            <h2 className="text-sm text-cyan-400 mb-4">
              DETECTION SIGNALS
            </h2>

            <ul className="space-y-3 text-sm">
              {result.reasons.map((reason, index) => (
                <li
                  key={index}
                  className="flex gap-3 items-start bg-[#071726] p-3 rounded-lg"
                >
                  <span
                    className={
                      result.riskLevel === "safe"
                        ? "text-green-400"
                        : result.riskLevel === "suspicious"
                        ? "text-yellow-400"
                        : "text-red-400"
                    }
                  >
                    ●
                  </span>
                  <span className="text-gray-300">
                    {reason}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 text-right">
              <button
                onClick={onBack}
                className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>

        {/* VISUAL CLONING (Enhanced UI + Detected bullets) */}
        {result.visualAnalysis && (
          <div className="bg-[#0b1220] rounded-2xl p-8 border border-white/5">
            <h2 className="text-sm text-cyan-400 mb-6">VISUAL CLONING ANALYSIS</h2>

            {/* Baseline */}
            <div className="bg-[#071726] rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-400">Baseline Compared</div>
              <div className="text-white font-medium">
                {result.visualAnalysis.baselineCompared}
              </div>
            </div>

            {/* PIXEL-LEVEL COMPARISON */}
            <VisualCloneCompare
              enabled={result.url.includes("/visual_tests/")}
              baselineUrl={baselineUrl}
              targetUrl={result.url}
              onComputed={(sim) => setPixelSim(sim)}
            />

            {/* Similarity Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span>Structural Similarity (DOM)</span>
                <span
                  className={
                    result.visualAnalysis.similarityScore >= 70
                      ? "text-red-400"
                      : result.visualAnalysis.similarityScore >= 50
                      ? "text-yellow-400"
                      : "text-green-400"
                  }
                >
                  {result.visualAnalysis.similarityScore >= 70
                    ? "High"
                    : result.visualAnalysis.similarityScore >= 50
                    ? "Medium"
                    : "Low"}
                </span>
              </div>

              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${result.visualAnalysis.similarityScore}%`,
                    backgroundColor:
                      result.visualAnalysis.similarityScore >= 70
                        ? "#ef4444"
                        : result.visualAnalysis.similarityScore >= 50
                        ? "#facc15"
                        : "#22c55e",
                  }}
                />
              </div>

              <div className="text-xs text-gray-400 mt-1 text-right">
                {result.visualAnalysis.similarityScore}% match
              </div>

              {pixelSim !== null && (
              <div className="text-xs text-gray-400 mt-1 text-right">
                Pixel Similarity: {pixelSim}%
              </div>
            )}

            {hybridScore !== null && (
              <div className="text-xs text-cyan-400 mt-1 text-right font-semibold">
                Hybrid Visual Score (60% Structural + 40% Pixel): {hybridScore}%
              </div>
            )}
            </div>

            {/* Bullet style detected items */}
            <div className="bg-[#071726] rounded-lg p-4">
              <div className="text-sm text-gray-300 font-medium mb-3">
                Detection Breakdown
              </div>

              <ul className="space-y-3 text-sm">
                {[
                  { label: "DOM Fingerprint Match", key: "input field structure" },
                  { label: "Login Form Pattern Match", key: "password field pattern" },
                  { label: "Visible Text Similarity", key: "visible text patterns" },
                  { label: "Domain Mismatch Boost", key: "domain differs" },
                  { label: "Title Similarity", key: "title" },
                ].map((item) => {
                  const isDetected = detected(item.key);
                  return (
                    <li key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-gray-300">
                        <span className="text-cyan-400">●</span>
                        {item.label}
                      </div>

                      <span
                        className={
                          isDetected ? "text-red-400 font-medium" : "text-gray-500"
                        }
                      >
                        {isDetected ? "✔ Detected" : "— Not detected"}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* Optional: show raw visual reasons for viva/debug */}
              {visualReasons.length > 0 && (
                <div className="mt-4 text-xs text-gray-400">
                  <div className="mb-2">Triggered rules:</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {visualReasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* USER GUIDANCE (MATCHES EXAMPLE RESULTS PAGE) */}
        <div className="bg-[#0b1220] rounded-2xl p-8 border border-white/5">
          <h2 className="text-lg font-semibold mb-3">
            What This Means for You
          </h2>

          <p className={`${risk.color} mb-4`}>
            {risk.banner}
          </p>

          {result.riskLevel === "safe" && (
            <p className="text-gray-300 text-sm">
              No major phishing indicators were detected. However, users are
              still advised to remain cautious when sharing personal or
              sensitive information online.
            </p>
          )}

          {result.riskLevel === "suspicious" && (
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Verify the website’s authenticity before interacting</li>
              <li>• Avoid entering login credentials or sensitive data</li>
              <li>• Access official websites by typing the URL manually</li>
            </ul>
          )}

          {result.riskLevel === "phishing" && (
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Do not enter any personal or login information</li>
              <li>• Close the website immediately</li>
              <li>• Report the website to relevant authorities if possible</li>
            </ul>
          )}

          <div className="mt-6 text-xs text-gray-400 bg-[#071726] p-3 rounded-lg">
            Risk scores are generated using automated analysis techniques and
            may not be 100% accurate. Always apply personal judgment and follow
            cybersecurity best practices.
          </div>
        </div>
      </div>
    </div>
  );
}
