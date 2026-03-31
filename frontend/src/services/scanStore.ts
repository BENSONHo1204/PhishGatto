export async function saveScan(record: any) {
  console.log("Scan saving disabled:", record);
}

export async function getUserScans(_userId: string) {
  return [];
}

export async function getAllScans() {
  return [
    {
      url: "https://example.com",
      riskLevel: "safe",
      score: 10,
      timestamp: "2026-01-01"
    },
    {
      url: "http://phishing-site.com",
      riskLevel: "phishing",
      score: 90,
      timestamp: "2026-01-02"
    }
  ];
}