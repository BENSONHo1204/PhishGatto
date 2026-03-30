from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, List, Tuple
from urllib.parse import urlparse
import re


@dataclass
class VisualFingerprint:
    title: str
    token_set: set
    num_forms: int
    num_inputs: int
    num_password_fields: int
    num_buttons: int
    num_images: int


def _safe_lower(s: str) -> str:
    return (s or "").strip().lower()


def extract_visual_fingerprint(url: str, scraped: Dict) -> VisualFingerprint:
    """
    Builds a lightweight 'visual' fingerprint from scraped page data.
    Uses best-effort signals already available from WebScraper.fetch().
    """
    html = scraped.get("html", "") or ""
    text = scraped.get("text", "") or ""

    # Title extraction (simple regex to avoid extra parsing libs)
    m = re.search(r"<title[^>]*>(.*?)</title>", html, flags=re.IGNORECASE | re.DOTALL)
    title = _safe_lower(m.group(1)) if m else ""

    # Basic HTML tag counts (layout-ish signals)
    num_forms = len(re.findall(r"<form\b", html, flags=re.IGNORECASE))
    num_inputs = len(re.findall(r"<input\b", html, flags=re.IGNORECASE))
    num_buttons = len(re.findall(r"<button\b", html, flags=re.IGNORECASE))
    num_images = len(re.findall(r"<img\b", html, flags=re.IGNORECASE))

    # Password field count (strong login-page signal)
    num_password_fields = len(re.findall(r'type=["\']password["\']', html, flags=re.IGNORECASE))

    # Token set from visible text + title (very lightweight)
    combined = f"{title} {text}"
    tokens = set(re.findall(r"[a-z0-9]{3,}", _safe_lower(combined)))

    return VisualFingerprint(
        title=title,
        token_set=tokens,
        num_forms=num_forms,
        num_inputs=num_inputs,
        num_password_fields=num_password_fields,
        num_buttons=num_buttons,
        num_images=num_images,
    )


def _jaccard(a: set, b: set) -> float:
    if not a and not b:
        return 1.0
    if not a or not b:
        return 0.0
    inter = len(a.intersection(b))
    union = len(a.union(b))
    return inter / union if union else 0.0


def compute_visual_similarity(
    target_url: str,
    target_scraped: Dict,
    baseline_url: str,
    baseline_scraped: Dict,
) -> Tuple[int, List[str]]:
    """
    Conservative visual similarity:
    - Compares lightweight fingerprints between baseline (legit template) and target (suspicious page)
    - Returns similarity score (0–100) + explainable reasons
    """
    reasons: List[str] = []

    fp_target = extract_visual_fingerprint(target_url, target_scraped)
    fp_base = extract_visual_fingerprint(baseline_url, baseline_scraped)

    # If we couldn't get enough content, skip
    if not target_scraped.get("html") or not baseline_scraped.get("html"):
        return 0, ["Visual similarity analysis skipped (page content unavailable)"]

    score = 0.0

    # 1) Title similarity (exact match or strong overlap)
    if fp_target.title and fp_base.title and fp_target.title == fp_base.title:
        score += 20
        reasons.append("Page title matches baseline template")
    elif fp_target.title and fp_base.title:
        # soft title overlap
        t_tokens = set(re.findall(r"[a-z0-9]{3,}", fp_target.title))
        b_tokens = set(re.findall(r"[a-z0-9]{3,}", fp_base.title))
        title_sim = _jaccard(t_tokens, b_tokens)
        if title_sim >= 0.5:
            score += 12
            reasons.append("Page title is similar to baseline template")

    # 2) Form/password structure similarity
    if fp_target.num_forms == fp_base.num_forms and fp_base.num_forms > 0:
        score += 12
        reasons.append("Number of forms matches baseline template")

    if fp_target.num_password_fields == fp_base.num_password_fields and fp_base.num_password_fields > 0:
        score += 22
        reasons.append("Password field pattern matches baseline template")

    # 3) Element count similarity (inputs/buttons/images)
    def close_enough(a: int, b: int) -> bool:
        if b == 0:
            return a == 0
        return abs(a - b) / max(b, 1) <= 0.25  # within 25%

    if close_enough(fp_target.num_inputs, fp_base.num_inputs) and fp_base.num_inputs > 0:
        score += 10
        reasons.append("Input field structure is similar to baseline template")

    if close_enough(fp_target.num_buttons, fp_base.num_buttons) and fp_base.num_buttons > 0:
        score += 8
        reasons.append("Button layout is similar to baseline template")

    if close_enough(fp_target.num_images, fp_base.num_images) and fp_base.num_images > 0:
        score += 6
        reasons.append("Image layout is similar to baseline template")

    # 4) Visible token similarity (Jaccard)
    token_sim = _jaccard(fp_target.token_set, fp_base.token_set)

    if token_sim >= 0.4:
        score += 18
        reasons.append("High visible text similarity to baseline template")
    elif token_sim >= 0.25:
        score += 10
        reasons.append("Moderate visible text similarity to baseline template")

   # 5) Domain mismatch boost (strong impersonation signal)
    try:
        host_target = (urlparse(target_url).hostname or "").lower().lstrip("www.")
        host_base = (urlparse(baseline_url).hostname or "").lower().lstrip("www.")

        if host_target and host_base and host_target != host_base:
            if score >= 40:
                score += 18
                reasons.append("High structural similarity on a different domain (possible impersonation)")
    except Exception:
        pass

    score = min(score, 100.0)
    final = int(round(score))

    if final == 0 and not reasons:
        reasons.append("No significant visual similarity patterns detected")

    return final, reasons