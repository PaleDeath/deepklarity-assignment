import requests
from bs4 import BeautifulSoup


HEADERS = {
    # wikipedia blocks requests without a user agent, found this out the hard way
    "User-Agent": "Mozilla/5.0 (compatible; WikiQuizApp/1.0)"
}


def scrape_wikipedia(url: str) -> dict:
    """grabs the article text, title and section headings from a wikipedia url"""

    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
    except requests.RequestException as e:
        raise ValueError(f"Couldn't reach Wikipedia: {str(e)}")

    if response.status_code != 200:
        raise ValueError(f"Wikipedia returned status code {response.status_code}")

    soup = BeautifulSoup(response.text, "html.parser")

    # disambiguation pages give garbage quiz questions so catch them early
    if soup.find("div", {"id": "disambigbox"}) or soup.find("table", class_="disambig"):
        raise ValueError(
            "This is a disambiguation page. Please use a URL for a specific article."
        )

    title_tag = soup.find("h1", {"id": "firstHeading"})
    if not title_tag:
        raise ValueError("Couldn't find the article title — probably not a real article page")

    # get rid of stuff that would mess up the text we send to gemini
    for tag in soup.find_all(["sup", "style", "script"]):
        tag.decompose()
    for tag in soup.find_all("span", class_="mw-editsection"):
        tag.decompose()

    content_div = soup.find("div", {"id": "mw-content-text"})
    if not content_div:
        raise ValueError("Couldn't find the main article content")

    sections = [h.get_text(strip=True) for h in content_div.find_all(["h2", "h3"])]

    paragraphs = content_div.find_all("p")
    article_text = "\n".join(p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True))

    if len(article_text) < 300:
        raise ValueError("Article is too short to make a decent quiz from")

    # drastically reduce input size (3k chars) to fit free tier token limits
    article_text = article_text[:3000]

    return {
        "title": title_tag.get_text(strip=True),
        "content": article_text,
        "sections": sections[:15],
        "raw_html": response.text  # keeping raw html for the database
    }


def fetch_title(url: str) -> str:
    """just grabs the page title, used for the url preview feature"""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=5)
        if resp.status_code != 200:
            return None
        soup = BeautifulSoup(resp.text, "html.parser")
        title = soup.find("h1", {"id": "firstHeading"})
        return title.get_text(strip=True) if title else None
    except Exception:
        return None
