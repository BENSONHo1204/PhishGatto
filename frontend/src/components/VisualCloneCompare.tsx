import { useEffect, useMemo, useState } from "react";
import html2canvas from "html2canvas";

type Props = {
  targetUrl: string;
  baselineUrl: string;
  enabled: boolean;
  onComputed?: (pixelSimilarity: number) => void;
};

async function capturePageAsDataUrl(url: string): Promise<string> {
  // Create hidden iframe to load page
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-99999px";
  iframe.style.top = "0";
  iframe.style.width = "1280px";
  iframe.style.height = "720px";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  iframe.src = url;

  document.body.appendChild(iframe);

  // Wait for load
  await new Promise<void>((resolve, reject) => {
    iframe.onload = () => resolve();
    iframe.onerror = () => reject(new Error("Failed to load iframe"));
  });

  // Small delay to ensure fonts/layout finish
  await new Promise((r) => setTimeout(r, 400));

  const doc = iframe.contentDocument;
  if (!doc) {
    document.body.removeChild(iframe);
    throw new Error("iframe contentDocument not available");
  }

  const body = doc.body;

  // Capture screenshot
  const canvas = await html2canvas(body, {
    backgroundColor: null,
    useCORS: true,
    scale: 1,
    width: 1280,
    height: 720,
    windowWidth: 1280,
    windowHeight: 720,
  });

  const dataUrl = canvas.toDataURL("image/png");

  document.body.removeChild(iframe);
  return dataUrl;
}

async function computePixelSimilarity(
  baselineDataUrl: string,
  targetDataUrl: string
): Promise<number> {
  return new Promise((resolve) => {
    const resembleGlobal = (window as any).resemble;

    if (!resembleGlobal) {
      resolve(0);
      return;
    }

    resembleGlobal(baselineDataUrl)
      .compareTo(targetDataUrl)
      .ignoreAntialiasing()
      .onComplete((data: any) => {
        const mismatch = Number(data.misMatchPercentage || 100);
        const similarity = Math.max(0, Math.min(100, 100 - mismatch));
        resolve(Math.round(similarity));
      });
  });
}

export default function VisualCloneCompare({
  targetUrl,
  baselineUrl,
  enabled,
  onComputed,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [pixelSimilarity, setPixelSimilarity] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

  const isVisualTest = useMemo(() => {
    return targetUrl.includes("/visual_tests/") && baselineUrl.includes("/visual_tests/");
  }, [targetUrl, baselineUrl]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!enabled || !isVisualTest) {
        setPixelSimilarity(null);
        setError("");
        return;
      }

      // Avoid comparing baseline to itself
      if (targetUrl === baselineUrl) {
        setPixelSimilarity(null);
        setError("");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const baselineImg = await capturePageAsDataUrl(baselineUrl);
        const targetImg = await capturePageAsDataUrl(targetUrl);

        const sim = await computePixelSimilarity(baselineImg, targetImg);

        if (!cancelled) {
          setPixelSimilarity(sim);
          onComputed?.(sim);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Pixel comparison failed");
          setPixelSimilarity(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [enabled, isVisualTest, baselineUrl, targetUrl, onComputed]);

  if (!enabled || !isVisualTest || targetUrl === baselineUrl) {
    return null;
  }

  return (
    <div className="mt-5 bg-[#071726] border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-300 font-semibold">
          Pixel-level Similarity (Resemble.js)
        </div>
        {loading && <div className="text-xs text-gray-400">Computing…</div>}
      </div>

      {error && (
        <div className="text-xs text-red-400 mt-2">
          {error}
        </div>
      )}

      {pixelSimilarity !== null && !error && (
        <div className="mt-3">
          <div className="flex justify-between text-sm mb-1">
            <span>Pixel Similarity</span>
            <span>{pixelSimilarity}%</span>
          </div>
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pixelSimilarity}%`,
                backgroundColor:
                  pixelSimilarity > 70
                    ? "#ef4444"
                    : pixelSimilarity > 40
                    ? "#facc15"
                    : "#22c55e",
              }}
            />
          </div>
        </div>
      )}

      <div className="text-[11px] text-gray-400 mt-2">
        Compared rendered screenshots of baseline vs target (controlled demo pages only).
      </div>
    </div>
  );
}