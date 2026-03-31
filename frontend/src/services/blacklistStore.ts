export async function addToBlacklist(domain: string) {
  console.log("Blacklist add disabled:", domain);
}

export async function getBlacklist() {
  return ["phishing-site.com"];
}

export async function removeFromBlacklist(domain: string) {
  console.log("Blacklist remove disabled:", domain);
}

export function isBlacklisted(url: string, blacklist: string[]): boolean {
  return blacklist.some((domain) => url.includes(domain));
}