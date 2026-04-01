from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
from urllib.parse import urlparse, unquote
from datetime import datetime

from services.ml_model import predict_url
from services.semantic_analyzer import analyze_semantics
from services.threat_scorer import compute_risk
from services.web_scraper import WebScraper
from services.visual_similarity import compute_visual_similarity

PORT = int(os.environ.get("PORT", 5000))

# --------------------------------
# App setup
# --------------------------------
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "https://bensonho1204.github.io"}})

scraper = WebScraper()

# --------------------------------
# Data Input Module
# --------------------------------
def validate_and_normalize_url(raw_url: str):
    if not raw_url or not raw_url.strip():
        return None, "Please enter a URL to proceed."

    url = raw_url.strip()

    # Decode URL-encoded characters
    url = unquote(url)

    # -----------------------------
    # Reject commas explicitly
    # -----------------------------
    if "," in url:
        return None, "Invalid URL format. Please use dots (.) instead of commas."

    # -----------------------------
    # Auto-add scheme if missing
    # Supports:
    # - www.google.com
    # - google.com
    # -----------------------------
    if not re.match(r"^https?://", url):
        url = "https://" + url

    # Length check
    if len(url) > 2048:
        return None, "URL is too long and may be unsafe."

    parsed = urlparse(url)

    # Scheme validation
    if parsed.scheme not in ("http", "https"):
        return None, "Only HTTP and HTTPS URLs are supported."

    # Domain presence
    if not parsed.netloc:
        return None, "Invalid URL format. Domain name is missing."

    # Domain structure check
    hostname = parsed.hostname or ""

    # Allow localhost and 127.0.0.1 for testing
    if hostname in ("localhost", "127.0.0.1"):
        pass
    else:
        domain_pattern = re.compile(r"^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$")
        if not domain_pattern.match(hostname):
            return None, "Invalid domain name structure."

    # Normalize (lowercase scheme + domain)
    normalized_url = (
        parsed.scheme.lower()
        + "://"
        + parsed.netloc.lower()
        + parsed.path
    )

    return normalized_url, None

# --------------------------------
# API Endpoint
# --------------------------------
@app.route("/")
def home():
    return "Backend is running"

@app.route("/api/scan", methods=["POST"])
def scan_url():
    data = request.get_json()

    if not data or "url" not in data:
        return jsonify({"error": "URL is required"}), 400

    validated_url, error = validate_and_normalize_url(str(data["url"]))
    if error:
        return jsonify({"error": error}), 400

    try:
        # ML Classification
        ml_score, ml_reasons = predict_url(validated_url)

        # Semantic Analysis
        semantic_score, semantic_reasons = analyze_semantics(validated_url)

        # Web Content Analysis
        page_data = scraper.fetch(validated_url)

        # NEW — Visual Similarity Section
        visual_score = 0
        visual_reasons = []
        visual_analysis = None

        baseline_url = baseline_url = "https://bensonho1204.github.io/PhishGatto/visual_tests/original_login.html"

        # Only run visual similarity for controlled test pages
        if "visual_tests" in validated_url and validated_url != baseline_url:
            baseline_data = scraper.fetch(baseline_url)

            visual_score, visual_reasons = compute_visual_similarity(
                target_url=validated_url,
                target_scraped=page_data,
                baseline_url=baseline_url,
                baseline_scraped=baseline_data
            )

            # Prepare visualAnalysis ONLY when comparison is run
            visual_analysis = {
                "similarityScore": visual_score,
                "baselineCompared": "original_login.html",
                "visualReasons": visual_reasons,
            }

        # Threat Scoring
        risk_result = compute_risk(
            ml_score=ml_score,
            semantic_score=semantic_score,
            url=validated_url,
            visual_score=visual_score
        )

        # Combine all explanations
        reasons = (
            risk_result["reasons"]
            + ml_reasons
            + semantic_reasons
        )

        # Optional scraper-based reasons
        if page_data.get("has_password_field"):
            reasons.append("Password input field detected on the webpage")

        if page_data.get("external_form_action"):
            reasons.append("Form submits data to an external domain")

        if not page_data.get("uses_https"):
            reasons.append("Webpage does not use HTTPS encryption")

    except Exception as e:
        return jsonify({
            "error": "Analysis failed",
            "details": str(e)
        }), 500

    # FINAL RESPONSE (LiveResults-ready)
    response = {
        "url": validated_url,
        "score": risk_result["score"],
        "riskLevel": risk_result["riskLevel"],
        "reasons": list(dict.fromkeys(reasons)),
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

    # Only include visual analysis if comparison was performed
    if visual_analysis is not None:
        response["visualAnalysis"] = visual_analysis

    return jsonify(response)

# --------------------------------
# Run server
# --------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=False)
