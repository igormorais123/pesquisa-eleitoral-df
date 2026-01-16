"""
Serviço de OAuth2

Implementa autenticação com Google OAuth2.
"""

from typing import Optional

import httpx

from app.core.config import configuracoes


class GoogleOAuthServico:
    """Serviço para autenticação OAuth2 com Google"""

    GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

    @staticmethod
    def get_authorization_url(state: Optional[str] = None) -> str:
        """
        Gera URL de autorização do Google.

        Args:
            state: Estado opcional para CSRF protection

        Returns:
            URL para redirecionar o usuário
        """
        params = {
            "client_id": configuracoes.GOOGLE_CLIENT_ID,
            "redirect_uri": configuracoes.GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent",
        }

        if state:
            params["state"] = state

        query = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{GoogleOAuthServico.GOOGLE_AUTH_URL}?{query}"

    @staticmethod
    async def exchange_code_for_tokens(code: str) -> dict:
        """
        Troca o código de autorização por tokens.

        Args:
            code: Código de autorização recebido do Google

        Returns:
            Dicionário com access_token, refresh_token, etc.
        """
        async with httpx.AsyncClient() as client:
            response = await client.post(
                GoogleOAuthServico.GOOGLE_TOKEN_URL,
                data={
                    "client_id": configuracoes.GOOGLE_CLIENT_ID,
                    "client_secret": configuracoes.GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "grant_type": "authorization_code",
                    "redirect_uri": configuracoes.GOOGLE_REDIRECT_URI,
                },
            )
            response.raise_for_status()
            return response.json()

    @staticmethod
    async def get_user_info(access_token: str) -> dict:
        """
        Obtém informações do usuário do Google.

        Args:
            access_token: Token de acesso do Google

        Returns:
            Dicionário com informações do usuário (id, email, name, picture)
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                GoogleOAuthServico.GOOGLE_USERINFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            response.raise_for_status()
            return response.json()

    @staticmethod
    async def authenticate(code: str) -> Optional[dict]:
        """
        Processo completo de autenticação OAuth2.

        Args:
            code: Código de autorização recebido do Google

        Returns:
            Informações do usuário ou None se falhar
        """
        try:
            # Trocar código por tokens
            tokens = await GoogleOAuthServico.exchange_code_for_tokens(code)
            access_token = tokens.get("access_token")

            if not access_token:
                return None

            # Obter informações do usuário
            user_info = await GoogleOAuthServico.get_user_info(access_token)

            return {
                "google_id": user_info.get("id"),
                "email": user_info.get("email"),
                "nome": user_info.get("name"),
                "avatar_url": user_info.get("picture"),
                "email_verificado": user_info.get("verified_email", False),
            }

        except Exception as e:
            print(f"Erro na autenticação Google: {e}")
            return None
