import type { ScanResult } from "../types";

type ResultsPageProps = {
  result: ScanResult;
  onScanAnother: () => void;
  onViewHistory: () => void;
  historyButtonLabel: string;
  onBack?: () => void;
};

const getRiskMeta = (score: number) => {
  if (score >= 70) {
    return {
      label: "High Risk",
      color: "#ef4444",
      banner: "This website is likely a phishing attempt",
      sub: "Do not enter any personal information",
    };
  }
  if (score >= 30) {
    return {
      label: "Medium Risk",
      color: "#facc15",
      banner: "This website may be suspicious",
      sub: "Proceed with caution",
    };
  }
  return {
    label: "Low Risk",
    color: "#22c55e",
    banner: "This website appears safe",
    sub: "No major phishing indicators detected",
  };
};

export default function ResultsPage({
  result,
  onScanAnother,
  onViewHistory,
  historyButtonLabel,
}: ResultsPageProps) {
  const risk = getRiskMeta(result.score);

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-b from-[#020617] to-[#020617] text-white">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Back to Home */}
        <button
          onClick={onScanAnother}
          className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition"
        >
          ← Back to Home
        </button>

        {/* Risk Banner */}
        <div
          className="rounded-xl p-5 flex items-center gap-4"
          style={{ backgroundColor: risk.color }}
        >
          <div>
            <h2 className="font-semibold text-lg">{risk.banner}</h2>
            <p className="text-sm opacity-90">{risk.sub}</p>
          </div>
        </div>

        {/* Scanned URL */}
        <div className="bg-[#0b1220] rounded-xl p-5">
          <p className="text-sm text-gray-400 mb-1">Scanned URL</p>
          <p
            className={`break-all font-mono ${
              result.score >= 70
                ? "text-red-400"
                : result.score >= 30
                ? "text-yellow-400"
                : "text-green-400"
            }`}
          >
            {result.url}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Scan completed at {result.timestamp}
          </p>
        </div>

        {/* Overall Risk */}
        <div className="bg-[#0b1220] rounded-xl p-5">
          <h3 className="font-semibold mb-3">Overall Phishing Risk</h3>

          <div className="flex items-end gap-2 mb-2">
            <span
              className="text-3xl font-bold"
              style={{ color: risk.color }}
            >
              {result.score}
            </span>
            <span className="text-gray-400">/ 100</span>
          </div>

          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
            <div
              className="h-full rounded-full"
              style={{
                width: `${result.score}%`,
                backgroundColor: risk.color,
              }}
            />
          </div>

          <p className="text-sm" style={{ color: risk.color }}>
            {risk.label}
          </p>
        </div>

        {/* Explainable AI */}
        <div className="bg-[#0b1220] rounded-xl p-5">
          <h3 className="font-semibold mb-3">
            Detection Explanation
          </h3>

          <ul className="space-y-2 text-sm text-gray-300">
            {result.reasons.length > 0 ? (
              result.reasons.map((reason, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  {reason}
                </li>
              ))
            ) : (
              <li className="flex gap-2">
                <span className="text-gray-400">•</span>
                No suspicious patterns detected
              </li>
            )}
          </ul>

          <div className="mt-4 text-xs text-cyan-400 bg-[#071726] p-3 rounded-lg">
            This system provides transparent explanations to help users
            understand phishing risks and make safer decisions.
          </div>
        </div>

        {/* Recommended Actions */}
        {result.score >= 30 && (
          <div className="bg-[#0b1220] rounded-xl p-5 border border-red-500/30">
            <h3 className="font-semibold mb-3 text-red-400">
              Recommended Actions
            </h3>

            <ul className="space-y-2 text-sm text-gray-300 list-disc list-inside">
              <li>Close this page immediately</li>
              <li>Do not enter any personal information</li>
              <li>Access official websites by typing the URL manually</li>
              <li>Report the site if possible</li>
              <li>Change passwords if credentials were entered</li>
            </ul>

            <div className="mt-4 text-xs text-red-300 bg-[#1a0b0b] p-3 rounded-lg">
              Security reminder: Never share personal, academic, or financial
              information on untrusted websites.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={onScanAnother}
            className="px-6 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 transition"
          >
            Scan Another URL
          </button>

          <button
            onClick={onViewHistory}
            className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition"
          >
            {historyButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
