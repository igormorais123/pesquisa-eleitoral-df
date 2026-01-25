"""
Serviço de OAuth2

Implementa autenticação com Google OAuth2 e coleta de dados expandidos.
"""

import json
import os
from datetime import datetime
from typing import Any, Optional
from urllib.parse import quote

import httpx

from app.core.config import configuracoes


class GoogleOAuthServico:
    """Serviço para autenticação OAuth2 com Google"""

    GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
    GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
    GOOGLE_PEOPLE_API_URL = "https://people.googleapis.com/v1/people/me"

    # Escopos básicos (não requerem verificação do Google)
    # Escopos sensíveis como birthday, gender, addresses foram removidos
    # pois requerem verificação do app pelo Google
    SCOPES = [
        "openid",
        "email",
        "profile",
    ]

    # Arquivo para armazenar dados coletados
    DADOS_USUARIOS_PATH = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "..",
        "agentes",
        "dados-usuarios-google.json"
    )

    @staticmethod
    def get_authorization_url(state: Optional[str] = None) -> str:
        """
        Gera URL de autorização do Google com escopos expandidos.

        Args:
            state: Estado opcional para CSRF protection

        Returns:
            URL para redirecionar o usuário
        """
        scope = quote(" ".join(GoogleOAuthServico.SCOPES))

        params = {
            "client_id": configuracoes.GOOGLE_CLIENT_ID,
            "redirect_uri": configuracoes.GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": scope,
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
    async def get_people_data(access_token: str) -> dict:
        """
        Obtém dados públicos do usuário via Google People API.

        Args:
            access_token: Token de acesso do Google

        Returns:
            Dicionário com dados públicos (names, emails, photos, locales)
        """
        # Apenas campos públicos que não requerem escopos sensíveis
        person_fields = ",".join([
            "names",
            "emailAddresses",
            "locales",
            "metadata",
            "photos",
        ])

        async with httpx.AsyncClient() as client:
            response = await client.get(
                GoogleOAuthServico.GOOGLE_PEOPLE_API_URL,
                params={"personFields": person_fields},
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if response.status_code == 200:
                return response.json()
            return {}

    @staticmethod
    def _extrair_dados_expandidos(people_data: dict) -> dict:
        """
        Extrai e formata dados públicos da People API.

        Args:
            people_data: Resposta da Google People API

        Returns:
            Dicionário com dados formatados
        """
        dados = {}

        # Nome completo e partes
        names = people_data.get("names", [])
        if names:
            name = names[0]
            dados["nome_completo"] = name.get("displayName")
            dados["primeiro_nome"] = name.get("givenName")
            dados["sobrenome"] = name.get("familyName")

        # Emails
        emails = people_data.get("emailAddresses", [])
        dados["emails"] = [e.get("value") for e in emails if e.get("value")]

        # Idiomas/Locales
        locales = people_data.get("locales", [])
        dados["idiomas"] = [loc.get("value") for loc in locales if loc.get("value")]

        # Fotos
        photos = people_data.get("photos", [])
        dados["fotos"] = [p.get("url") for p in photos if p.get("url")]

        # Metadata
        metadata = people_data.get("metadata", {})
        sources = metadata.get("sources", [])
        dados["metadata"] = {
            "fontes": [s.get("type") for s in sources],
        }

        return dados

    @staticmethod
    def _salvar_dados_usuario(dados: dict) -> None:
        """
        Salva dados do usuário em arquivo JSON.

        Args:
            dados: Dados do usuário para salvar
        """
        try:
            # Criar diretório se não existir
            os.makedirs(os.path.dirname(GoogleOAuthServico.DADOS_USUARIOS_PATH), exist_ok=True)

            # Carregar dados existentes
            usuarios = []
            if os.path.exists(GoogleOAuthServico.DADOS_USUARIOS_PATH):
                with open(GoogleOAuthServico.DADOS_USUARIOS_PATH, "r", encoding="utf-8") as f:
                    usuarios = json.load(f)

            # Verificar se usuário já existe (por google_id)
            google_id = dados.get("google_id")
            existente = next((i for i, u in enumerate(usuarios) if u.get("google_id") == google_id), None)

            if existente is not None:
                # Atualizar dados existentes
                usuarios[existente] = {**usuarios[existente], **dados, "atualizado_em": datetime.now().isoformat()}
            else:
                # Adicionar novo usuário
                dados["criado_em"] = datetime.now().isoformat()
                usuarios.append(dados)

            # Salvar arquivo
            with open(GoogleOAuthServico.DADOS_USUARIOS_PATH, "w", encoding="utf-8") as f:
                json.dump(usuarios, f, ensure_ascii=False, indent=2)

            print(f"[GOOGLE-DATA] Dados do usuário {dados.get('email')} salvos com sucesso")

        except Exception as e:
            print(f"[GOOGLE-DATA] Erro ao salvar dados: {e}")

    @staticmethod
    async def authenticate(code: str) -> Optional[dict]:
        """
        Processo completo de autenticação OAuth2 com coleta de dados expandidos.

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

            # Obter informações básicas do usuário
            user_info = await GoogleOAuthServico.get_user_info(access_token)

            # Obter dados expandidos via People API
            people_data = await GoogleOAuthServico.get_people_data(access_token)
            dados_expandidos = GoogleOAuthServico._extrair_dados_expandidos(people_data)

            # Combinar dados básicos com expandidos
            dados_completos = {
                "google_id": user_info.get("id"),
                "email": user_info.get("email"),
                "nome": user_info.get("name"),
                "avatar_url": user_info.get("picture"),
                "email_verificado": user_info.get("verified_email", False),
                **dados_expandidos,
                "dados_brutos_people_api": people_data,  # Guardar dados brutos também
            }

            # Salvar dados em arquivo JSON para uso posterior
            GoogleOAuthServico._salvar_dados_usuario(dados_completos)

            # Retornar dados básicos para autenticação
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
