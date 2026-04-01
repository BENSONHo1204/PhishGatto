export async function getBlacklist() {
  return ["phishing-site.com"];
}

export async function addToBlacklist(_domain: string) {
  return { status: "success" };
}

export async function removeFromBlacklist(_domain: string) {
  return { status: "success" };
}

export async function isBlacklisted(domain: string) {
  const blacklist = await getBlacklist();
  return blacklist.includes(domain);
}