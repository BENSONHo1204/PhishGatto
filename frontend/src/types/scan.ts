// src/types/scan.ts

export type RiskLevel = "safe" | "suspicious" | "phishing";

export interface ScanResult {
  url: string;
  score: number;        // REQUIRED
  riskLevel: RiskLevel;
  reasons: string[];
  timestamp: string;
}
