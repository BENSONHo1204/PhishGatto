def analyze_semantics(url: str):
    """
    Semantic analysis using keyword-based heuristics

    Returns:
    - semantic_score (0–100)
    - semantic_reasons (list of strings)
    """

    if not isinstance(url, str) or not url.strip():
        return 0, ["Invalid or empty URL input"]

    score = 0
    reasons = []

    url_lower = url.lower().strip()

    # -----------------------------
    # Feature 1: Urgency / fear language
    # -----------------------------
    urgency_keywords = [
        "verify", "urgent", "immediately", "suspend",
        "confirm", "security", "alert"
    ]

    if any(word in url_lower for word in urgency_keywords):
        score += 15
        reasons.append("Urgency-based language detected")

    # -----------------------------
    # Feature 2: Brand impersonation
    # -----------------------------
    brand_keywords = [
        "paypal", "google", "apple", "bank",
        "facebook", "amazon", "microsoft"
    ]

    if any(brand in url_lower for brand in brand_keywords):
        score += 20
        reasons.append("Possible brand impersonation detected")

    # -----------------------------
    # Feature 3: Credential bait
    # -----------------------------
    credential_keywords = [
        "login", "signin", "account", "password"
    ]

    if any(word in url_lower for word in credential_keywords):
        score += 15
        reasons.append("Credential-related keywords detected")

    # -----------------------------
    # Soft cap (important)
    # -----------------------------
    score = min(score, 60)

    if not reasons:
        reasons.append("No strong semantic phishing indicators detected")

    return score, reasons
