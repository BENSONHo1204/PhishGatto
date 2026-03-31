import { isBlacklisted, getBlacklist } from "../services/blacklistStore";
import { useState } from "react";
import type { ScanResult, RiskLevel } from "../types";
import catLogo from "../assets/phishgatto-cat.png";
import scanIcon from "../assets/loupe.png";
import "./HeroSection.css";

type HeroSectionProps = {
  onDemoScan: (result: ScanResult) => void;
  onLiveScan: (result: ScanResult) => void;
  onOpenAdmin: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenUserDashboard: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  currentUserName?: string;
  currentUserRole?: string;
};

const SAMPLE_URLS: Record<RiskLevel, string> = {
  safe: "https://www.youtube.com",
  suspicious: "http://account-verification-google.net",
  phishing: "http://secure-paypal-login.xyz",
};

const GUEST_SCAN_KEY = "phish_guest_scan_count";

function getGuestScanCount(): number {
  const raw = sessionStorage.getItem(GUEST_SCAN_KEY);
  const count = raw ? Number(raw) : 0;
  return Number.isNaN(count) ? 0 : count;
}

function increaseGuestScanCount(): number {
  const next = getGuestScanCount() + 1;
  sessionStorage.setItem(GUEST_SCAN_KEY, String(next));
  return next;
}

export default function HeroSection(props: HeroSectionProps){const{
  onDemoScan,
  onLiveScan,
  onOpenAdmin,
  onOpenLogin,
  onOpenRegister,
  onOpenUserDashboard,
  isLoggedIn,
  isAdmin,
  currentUserName,
  currentUserRole,
} = props;

  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [guestScanCount, setGuestScanCount] = useState(getGuestScanCount());
  const [loading, setLoading] = useState(false);

  /* -----------------------------
   * DEMO SCAN (sample URLs only)
   * ----------------------------- */
  const runDemoScan = (risk: RiskLevel, targetUrl: string) => {
    const score =
      risk === "safe" ? 12 : risk === "suspicious" ? 55 : 92;

    const result: ScanResult = {
      url: targetUrl,
      riskLevel: risk,
      score,
      reasons:
        risk === "safe"
          ? ["No suspicious patterns detected"]
          : risk === "suspicious"
          ? ["Unusual domain name", "No HTTPS encryption"]
          : [
              "Brand impersonation detected",
              "Suspicious symbols",
              "No HTTPS encryption",
            ],
      timestamp: new Date().toLocaleString(),
    };
    onDemoScan(result);
  };

  /* -----------------------------
   * LIVE SCAN (backend)
   * ----------------------------- */
  const runLiveScan = async () => {
if (!url.trim()) {
setError("Please enter a URL to proceed");
return;
}

const trimmedUrl = url.trim();
setError("");
setLoading(true);

try {
  if (!isLoggedIn && getGuestScanCount() >= 3) {
    setLoading(false);
    onOpenRegister();
    return;
  }

  // simulate step delay (UX)
  await new Promise((r) => setTimeout(r, 300));

  const blacklist = await getBlacklist();

  if (isBlacklisted(trimmedUrl, blacklist)) {
    const blacklistResult: ScanResult = {
      url: trimmedUrl,
      riskLevel: "phishing",
      score: 95,
      reasons: [
        "URL matches a blacklisted domain",
        "This domain was manually flagged by the administrator",
      ],
      timestamp: new Date().toLocaleString(),
    };

    if (!isLoggedIn) {
      setGuestScanCount(increaseGuestScanCount());
    }

    setLoading(false);
    onLiveScan(blacklistResult);
    return;
  }

  await new Promise((r) => setTimeout(r, 300));

  const res = await fetch("https://phishgatto-production.up.railway.app/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: trimmedUrl }),
  });

  const data = await res.json();

  if (!res.ok) {
    setError(data.error || "Scan failed");
    setLoading(false);
    return;
  }

  if (!isLoggedIn) {
    setGuestScanCount(increaseGuestScanCount());
  }

    setLoading(false);
    onLiveScan(data);
  } catch {
    setError("Unable to connect to scanning service");
    setLoading(false);
  }
};

  return (
    <>
      {/* 🔹 NAVBAR */}
      <header className="fixed top-0 w-full z-50 bg-[#020617] border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between min-h-[72px]">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
              <img
                src={catLogo}
                alt="PhishGatto logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-semibold text-white">PhishGatto</span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-4">

            {!isLoggedIn ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition"
                >
                  Login
                </button>

                <button
                  onClick={onOpenRegister}
                  className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 text-black rounded-xl hover:opacity-90 transition shadow-md"
                >
                  Register
                </button>
              </div>
            ) : (
              <>
                {/* 🔹 PROFILE CHIP */}
                {!isAdmin ? (
                  <button
                    onClick={onOpenUserDashboard}
                    className="flex items-center gap-3 bg-[#071726] border border-white/5 rounded-full px-3 py-2 hover:border-cyan-400/40 hover:bg-[#0b2033] transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-cyan-500 text-black flex items-center justify-center text-sm font-bold">
                      {currentUserName?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div className="hidden sm:block leading-tight text-left">
                      <div className="text-sm text-white font-medium">
                        {currentUserName || "User"}
                      </div>
                      <div className="text-[10px] text-cyan-400 uppercase">
                        {currentUserRole || "user"}
                      </div>
                    </div>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAdmin}
                    className="flex items-center gap-3 bg-[#071726] border border-white/5 rounded-full px-3 py-2 hover:border-cyan-400/40 hover:bg-[#0b2033] transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-cyan-500 text-black flex items-center justify-center text-sm font-bold">
                      {currentUserName?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div className="hidden sm:block leading-tight text-left">
                      <div className="text-sm text-white font-medium">
                        {currentUserName || "User"}
                      </div>
                      <div className="text-[10px] text-cyan-400 uppercase">
                        {currentUserRole || "admin"}
                      </div>
                    </div>
                  </button>
                )}
                </>
              )}
          </div>
        </div>
      </header>

      {/* 🔹 HERO */}
      <section className="pt-28 pb-28 bg-gradient-to-b from-[#030a1a] to-black">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          {/* Logo */}
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl shadow-lg">
            <img
              src={catLogo}
              alt="PhishGatto logo"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Welcome to <span className="text-cyan-400">PhishGatto</span>
          </h1>

          {/* Subtitle */}
          <p className="text-gray-400 max-w-2xl mx-auto">
            Your intelligent guardian against phishing attacks. Scan suspicious
            links and protect yourself from online scams with AI-powered detection.
          </p>

          {/* Search */}
          <div className="flex justify-center gap-3 pt-4">
            <input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError("");
              }}
              placeholder="Paste a suspicious URL here to scan..."
              className="w-full max-w-xl px-4 py-3 rounded-xl bg-slate-800/80 text-white outline-none border border-white/5"
            />

            <button
              onClick={runLiveScan}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 transition flex items-center gap-2"
            >
              <img
                src={scanIcon} 
                alt="Scan"
                className="w-5 h-5 object-contain"
              />
            <span>{loading ? "Scanning..." : "Scan URL"}</span>
            </button>
          </div>

          {/* 🔍 Loading Animation */} 
            {loading && ( <div className="loading-box"> 
            <h2>🔍 Analyzing URL...</h2> <ul> 
            <li>Checking domain trust...</li> 
            <li>Evaluating risk signals...</li> 
            <li>Scanning webpage content...</li> </ul> </div> )
          }

          <p className="mt-2 text-sm text-gray-400 text-center">
            You can paste URLs with or without <span className="text-cyan-400">https://</span>
            {" "} (e.g. <span className="font-mono">google.com</span>,{" "}
            <span className="font-mono">www.google.com</span>)
          </p>

          {!isLoggedIn && (
            <p className="text-xs text-yellow-400 text-center mt-2">
              Guest mode: {3 - guestScanCount > 0 ? 3 - guestScanCount : 0} free scan
              {3 - guestScanCount === 1 ? "" : "s"} remaining before registration is required.
            </p>
          )}

          {/* Error message */}
          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          {/* Examples */}
          <p className="text-sm text-gray-400 pt-2">
            Try examples:&nbsp;
            <button
              className="text-green-400 hover:underline"
              onClick={() => {
                setUrl(SAMPLE_URLS.safe);
                setError("");
                runDemoScan("safe", SAMPLE_URLS.safe);
              }}
            >
              Safe URL
            </button>
            ,&nbsp;
            <button
              className="text-yellow-400 hover:underline"
              onClick={() => {
                setUrl(SAMPLE_URLS.suspicious);
                setError("");
                runDemoScan("suspicious", SAMPLE_URLS.suspicious);
              }}
            >
              Suspicious URL
            </button>
            ,&nbsp;
            <button
              className="text-red-400 hover:underline"
              onClick={() => {
                setUrl(SAMPLE_URLS.phishing);
                setError("");
                runDemoScan("phishing", SAMPLE_URLS.phishing);
              }}
            >
              Phishing URL
            </button>
          </p>
        </div>
      </section>
    </>
  );
}