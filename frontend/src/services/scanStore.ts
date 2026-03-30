const API = "http://localhost/PhishGatto/backend/api";

function normalizeScan(scan: any) {
  return {
    ...scan,
    userId: scan.userId ?? scan.user_id ?? "",
    riskLevel: scan.riskLevel ?? scan.risk_level ?? "safe",
    timestamp: scan.timestamp ?? scan.scanned_at ?? "",
  };
}

export async function saveScan(record: any) {
  const formData = new FormData();

  formData.append("user_id", String(record.userId ?? ""));
  formData.append("url", record.url ?? "");
  formData.append("risk_level", record.riskLevel ?? "");
  formData.append("score", String(record.score ?? 0));
  formData.append("reasons", Array.isArray(record.reasons) ? record.reasons.join(",") : "");

  await fetch(`${API}/saveScan.php`, {
    method: "POST",
    body: formData,
  });
}

export async function getUserScans(userId: string) {
  const res = await fetch(`${API}/getUserHistory.php?user_id=${userId}`);
  const data = await res.json();

  return Array.isArray(data) ? data.map(normalizeScan) : [];
}

export async function getAllScans() {
  const res = await fetch(`${API}/getAllScans.php`);
  const data = await res.json();

  return Array.isArray(data) ? data.map(normalizeScan) : [];
}