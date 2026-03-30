from urllib.parse import urlparse

HIGH_TRUST_DOMAINS = {
    "google.com", "youtube.com", "microsoft.com",
    "github.com", "amazon.com"
}

MEDIUM_TRUST_DOMAINS = {
    "gov.my", "edu.my", "wikipedia.org"
}

def get_domain_type(url: str):
    try:
        host = urlparse(url).hostname or ""
        host = host.lower().lstrip("www.")

        for d in HIGH_TRUST_DOMAINS:
            if host == d or host.endswith("." + d):
                return "high"

        for d in MEDIUM_TRUST_DOMAINS:
            if host == d or host.endswith("." + d):
                return "medium"

        return "none"

    except Exception:
        return "none"


def compute_risk(ml_score: float, semantic_score: float, url: str = "", visual_score: float = 0):    
    reasons = []

    # -----------------------------
    # Normalize inputs
    # -----------------------------
    ml_score = max(0, min(ml_score, 100))
    semantic_score = max(0, min(semantic_score, 100))
    visual_score = max(0, min(visual_score, 100))

    domain_type = get_domain_type(url)

    # -----------------------------
    # High-trust override
    # -----------------------------
    if domain_type == "high" and semantic_score < 30:
        return {
            "score": 10,
            "riskLevel": "safe",
            "reasons": ["Highly trusted domain with no suspicious indicators"]
        }

    # -----------------------------
    # Base scoring
    # -----------------------------
    base_score = 10
    combined_score = (
        base_score
        + (ml_score * 0.30)
        + (semantic_score * 0.45)
        + (visual_score * 0.25)
    )

    adjustment = 0

    # -----------------------------
    # Structural reinforcement
    # -----------------------------
    if ml_score > 50:
        adjustment += (ml_score - 50) * 0.15
        reasons.append("Suspicious URL structure detected")

    # -----------------------------
    # Semantic reinforcement
    # -----------------------------
    if semantic_score > 40:
        adjustment += (semantic_score - 40) * 0.35
        reasons.append("Suspicious semantic patterns detected")

    # -----------------------------
    # Domain complexity signal
    # -----------------------------
    try:
        hostname = urlparse(url).hostname or ""
        if hostname.count(".") >= 4:
            adjustment += 5
            reasons.append("Unusually high number of subdomains detected")
    except Exception:
        pass 
    
    # -----------------------------
    # Medium-trust adjustment
    # -----------------------------
    if domain_type == "medium":
        combined_score *= 0.4
        reasons.append("Recognized trusted domain reduces risk")

    # -----------------------------
    # Suspicious keyword check (even for trusted domains)
    # ----------------------------- 
    suspicious_keywords = ["login", "verify", "update", "account", "secure"] 
    if domain_type != "none": 
        if any(word in url.lower() for word in suspicious_keywords): 
            combined_score += 10 
            reasons.append("Suspicious keywords detected despite trusted domain")

    # -----------------------------
    # Final score smoothing
    # -----------------------------
    final_score = combined_score + adjustment

    # Strong phishing pattern override
    if ml_score > 60 and semantic_score > 50:
        final_score = max(final_score, 70)

    if final_score > 70:
        final_score = 70 + (final_score - 70) * 0.45

    final_score = round(max(5, min(final_score, 100)))

    # -----------------------------
    # Risk classification
    # -----------------------------
    if final_score >= 65:
        risk_level = "phishing"
    elif final_score >= 35:
        risk_level = "suspicious"
    else:
        risk_level = "safe"

    if not reasons:
        reasons.append("No significant suspicious patterns detected")

    return {
        "score": final_score,
        "riskLevel": risk_level,
        "reasons": reasons
    }
