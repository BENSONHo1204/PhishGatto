import re
from urllib.parse import urlparse

def extract_features(url: str):
    url = str(url).strip()
    url_lower = url.lower()

    features = []

    features.append(len(url))
    features.append(sum(url.count(c) for c in ["@", "-", "_", "%", "="]))
    features.append(1 if re.search(r"\b\d{1,3}(\.\d{1,3}){3}\b", url) else 0)
    features.append(1 if url_lower.startswith("https://") else 0)

    try:
        hostname = urlparse(url).hostname or ""
        features.append(hostname.count("."))
    except:
        features.append(0)

    return features