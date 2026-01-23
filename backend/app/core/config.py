"""
Configurações do Sistema

Carrega variáveis de ambiente e define configurações globais.
"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


BASE_DIR = Path(__file__).resolve().parents[3]
BACKEND_DIR = Path(__file__).resolve().parents[2]
DEFAULT_SECRET_KEY = "chave-secreta-padrao-desenvolvimento"


class Configuracoes(BaseSettings):
    """Configurações da aplicação carregadas do .env"""

    model_config = SettingsConfigDict(
        env_file=(
            BACKEND_DIR / ".env.local",
            BACKEND_DIR / ".env",
            BASE_DIR / ".env.local",
            BASE_DIR / ".env",
        ),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # API Claude - NUNCA expor publicamente
    CLAUDE_API_KEY: str = ""

    # JWT
    SECRET_KEY: str = DEFAULT_SECRET_KEY
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Banco de dados
    DATABASE_URL: str = (
        "postgresql://postgres:postgres@localhost:5432/pesquisa_eleitoral"
    )

    # URLs
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    # Ambiente
    AMBIENTE: str = "development"

    # Caminhos de dados
    CAMINHO_DADOS: str = "./data"

    # OAuth2 Google
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:3000/api/auth/callback/google"

    # Admin padrao (Professor Igor)
    ADMIN_USER_ID: str = "user-001"
    ADMIN_USERNAME: str = "professorigor"
    ADMIN_NAME: str = "Professor Igor"
    ADMIN_EMAIL: str = "admin@exemplo.com"
    # Hash da senha padrao "professorigor"
    ADMIN_PASSWORD_HASH: str = (
        "$2b$12$J6KfB1mVkGLAXyksmR6w6eh.C3fQGRuSMOxsoDeYoVweShfhJy22y"
    )


# Instância global de configurações
configuracoes = Configuracoes()


# Validação de configurações críticas
def validar_configuracoes():
    """Valida se as configurações críticas estão definidas"""
    erros = []

    if not configuracoes.CLAUDE_API_KEY:
        erros.append("CLAUDE_API_KEY não está definida")

    if configuracoes.SECRET_KEY == DEFAULT_SECRET_KEY:
        if configuracoes.AMBIENTE == "production":
            raise ValueError(
                "SECRET_KEY insegura em producao. Defina uma chave segura no .env"
            )
        print(
            "⚠️  AVISO: Usando SECRET_KEY padrão. Defina uma chave segura em produção."
        )

    if erros:
        for erro in erros:
            print(f"❌ Erro de configuração: {erro}")
        # Não levanta exceção para permitir desenvolvimento sem API key
        # raise ValueError("Configurações inválidas")

    return len(erros) == 0
