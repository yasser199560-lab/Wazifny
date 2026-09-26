from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Centralized app configuration, loaded from environment variables / .env."""

    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    cors_origins: str = "http://localhost:3000"

    mongodb_uri: str
    mongodb_db_name: str = "wazifny"

    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    gemini_api_key: str | None = None
    gemini_model: str = "gemini-3.6-flash"
    gemini_image_fallback_model: str | None = "gemini-3.8-flash"
    groq_api_key: str | None = None
    groq_image_model: str = "qwen/qwen3.8-27b"
    # Kept aligned with models currently available on the project's Groq key.
    # The previous llama-3.1-8b-instant model was retired and returns 404.
    groq_model: str = "openai/gpt-oss-20b"

    # Transactional mail is delivered through Resend's HTTPS API.
    resend_api_key: str | None = None
    resend_from_email: str = "notifications@wazifny.lb"
    resend_from_name: str = "Wazifny"
    resend_reply_to: str | None = None

    # Used to build links inside emails (password reset, etc.)
    frontend_url: str = "http://localhost:3000"

    # Ignore retired provider variables in existing local .env files. This
    # makes a Resend migration safe without requiring an all-at-once edit of
    # every developer/deployment environment.
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()
