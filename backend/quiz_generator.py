import json
import os
import re
import time
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv

load_dotenv()

# prompt template for the assignment — kept it detailed so gemini doesn't go off the rails
QUIZ_PROMPT = PromptTemplate(
    input_variables=["title", "content"],
    template="""
You are a quiz generator. Based on the Wikipedia article below, generate a quiz.

Article Title: {title}

Article Content:
{content}

Generate between 5 and 10 questions. Return ONLY valid JSON — no markdown, no code fences, no explanation before or after.

Use this exact JSON structure:
{{
  "summary": "2-3 sentences summarizing what this article is about",
  "key_entities": {{
    "people": ["Person 1", "Person 2"],
    "organizations": ["Org 1"],
    "locations": ["Place 1"]
  }},
  "sections": ["Section heading 1", "Section heading 2"],
  "quiz": [
    {{
      "question": "The full question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Option A",
      "difficulty": "easy",
      "explanation": "Short explanation of why this answer is correct, referencing the article"
    }}
  ],
  "related_topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"]
}}

Rules you must follow:
- "answer" must be copied word-for-word from one of the "options" — not paraphrased
- "difficulty" must be exactly "easy", "medium", or "hard" — nothing else
- Each question needs exactly 4 options
- related_topics should be real Wikipedia article names the reader could look up
- Questions should test actual understanding of the article, not just surface-level recall
- Do not include labels like "(A)" or "(B)" in the option text
"""
)


def generate_quiz(title, content):
    """sends article to gemini and parses the json response"""
    provider = os.getenv("LLM_PROVIDER", "gemini").strip().lower()
    if provider == "groq":
        return _generate_quiz_with_groq(title, content)

    # default to gemini
    return _generate_quiz_with_gemini(title, content)


def _generate_quiz_with_gemini(title, content):
    """Gemini provider with key/model fallback and retry logic."""
    api_keys = _get_api_keys()
    models = _get_models()
    max_retries = _get_max_retries()
    last_error = None

    for key_index, api_key in enumerate(api_keys, start=1):
        for model in models:
            llm = ChatGoogleGenerativeAI(
                model=model,
                google_api_key=api_key,
                temperature=0.3,
                max_output_tokens=2200,
            )
            chain = QUIZ_PROMPT | llm

            for attempt in range(1, max_retries + 1):
                try:
                    response = chain.invoke({"title": title, "content": content})
                    raw = _normalize_model_output(response.content)
                    parsed = json.loads(raw)
                    _validate_payload(parsed)
                    return parsed
                except Exception as e:
                    error_msg = str(e)
                    last_error = e

                    if _is_model_not_found(error_msg):
                        print(f"[!] Model not available for this key/project: {model}. Trying next model.")
                        # Stop retrying this model and move to next configured model.
                        break

                    if _is_auth_error(error_msg):
                        # move to the next key immediately if this one is invalid
                        break

                    if _is_quota_error(error_msg):
                        wait_time = _extract_wait_seconds(error_msg, attempt)
                        print(
                            f"[!] Quota/Rate limit for key {key_index}, model {model}, "
                            f"attempt {attempt}/{max_retries}. Waiting {wait_time:.1f}s."
                        )
                        time.sleep(wait_time)
                        continue

                    # non-quota and non-auth issue should fail fast
                    raise

    if last_error:
        raise ValueError(
            "Gemini request failed after trying all configured keys/models. "
            "Likely model availability mismatch, quota exhaustion, or invalid key. "
            "Set GEMINI_API_KEY (or GEMINI_API_KEYS) from Google AI Studio, "
            "and if needed use a lower-traffic model via GEMINI_MODELS."
        ) from last_error

    raise ValueError("Gemini request failed: no valid API key/model combination available.")


def _generate_quiz_with_groq(title, content):
    """Groq provider using gsk_ key with model fallback and retry logic."""
    api_key = os.getenv("GROQ_API_KEY", "").strip()
    if not api_key:
        raise ValueError("Missing GROQ_API_KEY. Set it in backend/.env when LLM_PROVIDER=groq.")

    models = _get_groq_models()
    max_retries = _get_max_retries()
    last_error = None

    for model in models:
        llm = ChatGroq(
            api_key=api_key,
            model=model,
            temperature=0.3,
            max_tokens=2200,
        )
        chain = QUIZ_PROMPT | llm

        for attempt in range(1, max_retries + 1):
            try:
                response = chain.invoke({"title": title, "content": content})
                raw = _normalize_model_output(response.content)
                parsed = json.loads(raw)
                _validate_payload(parsed)
                return parsed
            except Exception as e:
                error_msg = str(e)
                last_error = e

                if _is_model_not_found(error_msg):
                    print(f"[!] Groq model not available: {model}. Trying next model.")
                    break

                if _is_auth_error(error_msg):
                    raise ValueError("Groq API key was rejected. Check GROQ_API_KEY.") from e

                if _is_quota_error(error_msg):
                    wait_time = _extract_wait_seconds(error_msg, attempt)
                    print(
                        f"[!] Groq quota/rate limit for model {model}, "
                        f"attempt {attempt}/{max_retries}. Waiting {wait_time:.1f}s."
                    )
                    time.sleep(wait_time)
                    continue

                raise

    if last_error:
        raise ValueError(
            "Groq request failed after trying all configured models. "
            "Set GROQ_MODELS in backend/.env with models available to your account."
        ) from last_error

    raise ValueError("Groq request failed: no valid model available.")


def _get_api_keys():
    keys_csv = os.getenv("GEMINI_API_KEYS", "").strip()
    if keys_csv:
        keys = [k.strip() for k in keys_csv.split(",") if k.strip()]
        if keys:
            return keys

    single_key = os.getenv("GEMINI_API_KEY", "").strip()
    if single_key:
        return [single_key]

    raise ValueError(
        "Missing Gemini API key. Set GEMINI_API_KEY in backend/.env "
        "or GEMINI_API_KEYS as a comma-separated list."
    )


def _get_models():
    models_csv = os.getenv("GEMINI_MODELS", "").strip()
    if models_csv:
        models = [m.strip() for m in models_csv.split(",") if m.strip()]
        if models:
            return models

    # Default order favors free-tier friendly models first.
    return ["gemini-1.5-flash", "gemini-2.0-flash"]


def _get_groq_models():
    models_csv = os.getenv("GROQ_MODELS", "").strip()
    if models_csv:
        models = [m.strip() for m in models_csv.split(",") if m.strip()]
        if models:
            return models

    # Conservative defaults commonly available on Groq.
    return ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]


def _get_max_retries():
    raw = os.getenv("GEMINI_MAX_RETRIES", "3").strip()
    try:
        value = int(raw)
        return max(1, min(value, 8))
    except ValueError:
        return 3


def _normalize_model_output(raw):
    if not isinstance(raw, str):
        raw = str(raw)
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return cleaned


def _is_quota_error(error_msg):
    lowered = error_msg.lower()
    markers = ["429", "resource_exhausted", "quota", "rate limit", "too many requests"]
    return any(marker in lowered for marker in markers)


def _is_auth_error(error_msg):
    lowered = error_msg.lower()
    markers = ["401", "403", "api key not valid", "permission_denied", "invalid api key", "unauthorized"]
    return any(marker in lowered for marker in markers)


def _is_model_not_found(error_msg):
    lowered = error_msg.lower()
    markers = [
        "not_found",
        "is not found for api version",
        "not supported for generatecontent",
        "model not found",
    ]
    return any(marker in lowered for marker in markers)


def _extract_wait_seconds(error_msg, attempt):
    match = re.search(r"retry in (\d+(\.\d+)?)s", error_msg.lower())
    if match:
        return min(float(match.group(1)) + 2, 90)
    return min((2 ** attempt) * 5, 60)


def _validate_payload(payload):
    if not isinstance(payload, dict):
        raise ValueError("Model response is not a JSON object.")

    required = ["summary", "key_entities", "sections", "quiz", "related_topics"]
    for key in required:
        if key not in payload:
            raise ValueError(f"Model response missing required key: {key}")

    if not isinstance(payload["quiz"], list) or not payload["quiz"]:
        raise ValueError("Model response has empty or invalid quiz list.")
