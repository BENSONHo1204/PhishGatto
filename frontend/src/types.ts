export type RiskLevel = "safe" | "suspicious" | "phishing";

export interface ScanResult {
  url: string;
  riskLevel: RiskLevel;
  score: number;
  reasons: string[];
  timestamp: string;

  visualAnalysis?: {
    similarityScore: number;
    baselineCompared: string;
    visualReasons?: string[];
  };

  // NEW (frontend computed)
  pixelSimilarity?: number;
  hybridVisualScore?: number;
}


