"""LLM client abstraction.

Provider is selected by `LLM_PROVIDER`:
- `auto` (default): Anthropic → OpenAI → Ollama → Stub, first one that is configured/reachable
- `anthropic` | `openai` | `ollama`: forces the provider (errors out if not configured)
- `stub`: rule-based fallback, no network calls

All providers share the same `.complete(system, prompt)` interface so agents
don't need to know which one is active."""
from __future__ import annotations

from typing import Protocol

from .config import settings
from .logging import get_logger

log = get_logger("llm")


class LLMClient(Protocol):
    name: str

    def complete(self, system: str, prompt: str, max_tokens: int = 800, temperature: float = 0.2) -> str: ...


class StubLLM:
    name = "stub"

    def complete(self, system: str, prompt: str, max_tokens: int = 800, temperature: float = 0.2) -> str:
        # The pipeline still works without an LLM — the agents fall back to
        # deterministic templates when this returns "".
        return ""


class AnthropicLLM:
    name = "anthropic"

    def __init__(self) -> None:
        import anthropic

        if not settings.anthropic_api_key:
            raise RuntimeError("ANTHROPIC_API_KEY not set")
        self._client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        self._model = settings.anthropic_model

    def complete(self, system: str, prompt: str, max_tokens: int = 800, temperature: float = 0.2) -> str:
        res = self._client.messages.create(
            model=self._model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        return "".join(block.text for block in res.content if block.type == "text")


class OpenAILLM:
    name = "openai"

    def __init__(self) -> None:
        from openai import OpenAI

        if not settings.openai_api_key:
            raise RuntimeError("OPENAI_API_KEY not set")
        self._client = OpenAI(api_key=settings.openai_api_key)
        self._model = settings.openai_model

    def complete(self, system: str, prompt: str, max_tokens: int = 800, temperature: float = 0.2) -> str:
        res = self._client.chat.completions.create(
            model=self._model,
            max_tokens=max_tokens,
            temperature=temperature,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
        )
        return res.choices[0].message.content or ""


class OllamaLLM:
    name = "ollama"

    def __init__(self) -> None:
        import ollama

        self._client = ollama.Client(host=settings.ollama_host)
        # Trip an error early if the daemon isn't reachable
        self._client.list()
        self._model = settings.ollama_model

    def complete(self, system: str, prompt: str, max_tokens: int = 800, temperature: float = 0.2) -> str:
        res = self._client.chat(
            model=self._model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            options={"num_predict": max_tokens, "temperature": temperature},
        )
        return res["message"]["content"]


_cached: LLMClient | None = None


def _try_build(provider: str) -> LLMClient | None:
    try:
        if provider == "anthropic":
            return AnthropicLLM()
        if provider == "openai":
            return OpenAILLM()
        if provider == "ollama":
            return OllamaLLM()
        if provider == "stub":
            return StubLLM()
    except Exception as e:
        log.warning("llm_provider_unavailable", provider=provider, error=str(e))
    return None


def get_llm() -> LLMClient:
    global _cached
    if _cached is not None:
        return _cached

    explicit = settings.llm_provider
    if explicit != "auto":
        client = _try_build(explicit)
        if client is None:
            log.warning("llm_falling_back_to_stub", requested=explicit)
            client = StubLLM()
        _cached = client
        log.info("llm_ready", provider=_cached.name)
        return _cached

    for provider in ("anthropic", "openai", "ollama"):
        client = _try_build(provider)
        if client is not None:
            _cached = client
            log.info("llm_ready", provider=_cached.name, mode="auto")
            return _cached

    _cached = StubLLM()
    log.info("llm_ready", provider="stub", mode="auto (no real provider configured)")
    return _cached
