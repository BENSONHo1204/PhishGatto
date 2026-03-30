from typing import Dict
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse


class WebScraper:
    """
    Best-effort web scraper for phishing detection.
    Extracts security-relevant signals from web pages.
    """

    def fetch(self, url: str) -> Dict:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0 Safari/537.36"
            )
        }

        result = {
            "html": "",
            "text": "",
            "has_login_form": False,
            "has_password_field": False,
            "external_form_action": False,
            "uses_https": url.lower().startswith("https://"),
        }

        try:
            response = requests.get(url, headers=headers, timeout=6)
            response.raise_for_status()
            html = response.text
            result["html"] = html
        except Exception as e:
            print(f"[WebScraper] Failed to fetch {url}: {e}")
            return result

        soup = BeautifulSoup(html, "html.parser")

        # -----------------------------
        # Detect forms & inputs
        # -----------------------------
        forms = soup.find_all("form")
        page_domain = urlparse(url).netloc

        for form in forms:
            result["has_login_form"] = True

            # Password field detection
            if form.find("input", {"type": "password"}):
                result["has_password_field"] = True

            # External form action detection
            action = form.get("action", "")
            if action.startswith("http") and page_domain not in action:
                result["external_form_action"] = True

        # -----------------------------
        # Remove non-visible elements
        # -----------------------------
        for tag in soup([
            "script",
            "style",
            "noscript",
            "iframe",
            "svg",
            "meta",
            "link"
        ]):
            tag.decompose()

        # Extract visible text
        text = " ".join(soup.stripped_strings)
        result["text"] = text if len(text) >= 30 else ""

        return result
