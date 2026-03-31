const API = "http://localhost/PhishGatto/backend/api";

export async function addToBlacklist(domain: string) {
  const formData = new FormData();
  formData.append("domain", domain);

  await fetch(`${API}/addBlacklist.php`, {
    method: "POST",
    body: formData
  });
}

export async function getBlacklist(): Promise<string[]> {
  return [];
}

export async function removeFromBlacklist(domain: string) {
  const formData = new FormData();
  formData.append("domain", domain);

  await fetch(`${API}/removeBlacklist.php`, {
    method: "POST",
    body: formData
  });
}

export function isBlacklisted(url: string, blacklist: string[]): boolean {
  return blacklist.some((domain) => url.includes(domain));
}