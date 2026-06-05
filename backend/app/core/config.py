from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "UIT-LAB Financial Advisor"
    version: str = "0.2.0"
    environment: Literal["dev", "prod", "test"] = "dev"
    log_level: str = "INFO"

    database_url: str = "sqlite:///./data/app.db"

    chroma_persist_dir: str = "./data/chroma"
    chroma_collection: str = "tc_docs"
    embedding_model: str = "intfloat/multilingual-e5-small"
    embedding_device: str = "cpu"

    llm_provider: Literal["auto", "anthropic", "openai", "ollama", "stub"] = "auto"

    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-haiku-4-5-20251001"

    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"

    ollama_host: str = "http://localhost:11434"
    ollama_model: str = "qwen2.5:3b"

    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
