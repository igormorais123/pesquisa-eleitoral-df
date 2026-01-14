"""
Configurações do Sistema

Carrega variáveis de ambiente e define configurações globais.
"""

from pydantic_settings import BaseSettings


class Configuracoes(BaseSettings):
    """Configurações da aplicação carregadas do .env"""

    # API Claude - NUNCA expor publicamente
    CLAUDE_API_KEY: str = ""

    # JWT
    SECRET_KEY: str = "chave-secreta-padrao-desenvolvimento"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Banco de dados
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/pesquisa_eleitoral"

    # URLs
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    # Ambiente
    AMBIENTE: str = "development"

    # Caminhos de dados
    CAMINHO_DADOS: str = "./data"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"


# Instância global de configurações
configuracoes = Configuracoes()


# Validação de configurações críticas
def validar_configuracoes():
    """Valida se as configurações críticas estão definidas"""
    erros = []

    if not configuracoes.CLAUDE_API_KEY:
        erros.append("CLAUDE_API_KEY não está definida")

    if configuracoes.SECRET_KEY == "chave-secreta-padrao-desenvolvimento":
        print("⚠️  AVISO: Usando SECRET_KEY padrão. Defina uma chave segura em produção.")

    if erros:
        for erro in erros:
            print(f"❌ Erro de configuração: {erro}")
        # Não levanta exceção para permitir desenvolvimento sem API key
        # raise ValueError("Configurações inválidas")

    return len(erros) == 0
