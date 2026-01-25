# POLARIS SDK - Persistence Manager
# Persistência de dados de pesquisas

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List
import sqlite3


class PersistenceManager:
    """
    Gerenciador de persistência para dados de pesquisa.

    Suporta armazenamento em arquivos JSON e SQLite.
    """

    def __init__(
        self,
        data_dir: str = "./data",
        use_sqlite: bool = False
    ):
        """
        Inicializa o gerenciador.

        Args:
            data_dir: Diretório para dados
            use_sqlite: Se deve usar SQLite em vez de JSON
        """
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.use_sqlite = use_sqlite

        if use_sqlite:
            self._init_sqlite()

    def _init_sqlite(self) -> None:
        """Inicializa banco SQLite."""
        db_path = self.data_dir / "polaris.db"
        self.conn = sqlite3.connect(str(db_path), check_same_thread=False)

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS pesquisas (
                id TEXT PRIMARY KEY,
                tema TEXT,
                fase TEXT,
                dados TEXT,
                criado_em TEXT,
                atualizado_em TEXT
            )
        """)

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS respostas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pesquisa_id TEXT,
                eleitor_id TEXT,
                pergunta_id TEXT,
                resposta TEXT,
                fluxo_cognitivo TEXT,
                criado_em TEXT,
                FOREIGN KEY (pesquisa_id) REFERENCES pesquisas(id)
            )
        """)

        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS relatorios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                pesquisa_id TEXT,
                tipo TEXT,
                conteudo TEXT,
                criado_em TEXT,
                FOREIGN KEY (pesquisa_id) REFERENCES pesquisas(id)
            )
        """)

        self.conn.commit()

    # ==================== Pesquisas ====================

    def salvar_pesquisa(
        self,
        pesquisa_id: str,
        dados: Dict[str, Any]
    ) -> bool:
        """
        Salva dados de uma pesquisa.

        Args:
            pesquisa_id: ID da pesquisa
            dados: Dados a salvar

        Returns:
            True se salvo com sucesso
        """
        if self.use_sqlite:
            return self._salvar_pesquisa_sqlite(pesquisa_id, dados)
        return self._salvar_pesquisa_json(pesquisa_id, dados)

    def _salvar_pesquisa_json(
        self,
        pesquisa_id: str,
        dados: Dict[str, Any]
    ) -> bool:
        """Salva pesquisa em JSON."""
        path = self.data_dir / f"pesquisa_{pesquisa_id}.json"

        dados["atualizado_em"] = datetime.now().isoformat()
        if "criado_em" not in dados:
            dados["criado_em"] = dados["atualizado_em"]

        with open(path, 'w', encoding='utf-8') as f:
            json.dump(dados, f, ensure_ascii=False, indent=2, default=str)

        return True

    def _salvar_pesquisa_sqlite(
        self,
        pesquisa_id: str,
        dados: Dict[str, Any]
    ) -> bool:
        """Salva pesquisa em SQLite."""
        agora = datetime.now().isoformat()

        self.conn.execute("""
            INSERT OR REPLACE INTO pesquisas
            (id, tema, fase, dados, criado_em, atualizado_em)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            pesquisa_id,
            dados.get("tema", ""),
            dados.get("fase", ""),
            json.dumps(dados, ensure_ascii=False, default=str),
            dados.get("criado_em", agora),
            agora
        ))

        self.conn.commit()
        return True

    def carregar_pesquisa(self, pesquisa_id: str) -> Optional[Dict[str, Any]]:
        """
        Carrega dados de uma pesquisa.

        Args:
            pesquisa_id: ID da pesquisa

        Returns:
            Dados da pesquisa ou None
        """
        if self.use_sqlite:
            return self._carregar_pesquisa_sqlite(pesquisa_id)
        return self._carregar_pesquisa_json(pesquisa_id)

    def _carregar_pesquisa_json(self, pesquisa_id: str) -> Optional[Dict[str, Any]]:
        """Carrega pesquisa de JSON."""
        path = self.data_dir / f"pesquisa_{pesquisa_id}.json"

        if not path.exists():
            return None

        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def _carregar_pesquisa_sqlite(self, pesquisa_id: str) -> Optional[Dict[str, Any]]:
        """Carrega pesquisa de SQLite."""
        cursor = self.conn.execute(
            "SELECT dados FROM pesquisas WHERE id = ?",
            (pesquisa_id,)
        )
        row = cursor.fetchone()

        if row:
            return json.loads(row[0])
        return None

    def listar_pesquisas(self) -> List[Dict[str, Any]]:
        """
        Lista todas as pesquisas.

        Returns:
            Lista de resumos de pesquisas
        """
        if self.use_sqlite:
            return self._listar_pesquisas_sqlite()
        return self._listar_pesquisas_json()

    def _listar_pesquisas_json(self) -> List[Dict[str, Any]]:
        """Lista pesquisas de JSONs."""
        pesquisas = []

        for file in self.data_dir.glob("pesquisa_*.json"):
            try:
                with open(file, 'r', encoding='utf-8') as f:
                    dados = json.load(f)
                pesquisas.append({
                    "id": dados.get("id"),
                    "tema": dados.get("tema"),
                    "fase": dados.get("fase"),
                    "criado_em": dados.get("criado_em"),
                    "atualizado_em": dados.get("atualizado_em")
                })
            except (json.JSONDecodeError, KeyError):
                continue

        return pesquisas

    def _listar_pesquisas_sqlite(self) -> List[Dict[str, Any]]:
        """Lista pesquisas de SQLite."""
        cursor = self.conn.execute(
            "SELECT id, tema, fase, criado_em, atualizado_em FROM pesquisas"
        )

        return [
            {
                "id": row[0],
                "tema": row[1],
                "fase": row[2],
                "criado_em": row[3],
                "atualizado_em": row[4]
            }
            for row in cursor.fetchall()
        ]

    # ==================== Respostas ====================

    def salvar_resposta(
        self,
        pesquisa_id: str,
        eleitor_id: str,
        pergunta_id: str,
        resposta: str,
        fluxo_cognitivo: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Salva uma resposta individual.

        Args:
            pesquisa_id: ID da pesquisa
            eleitor_id: ID do eleitor
            pergunta_id: ID da pergunta
            resposta: Texto da resposta
            fluxo_cognitivo: Dados do fluxo cognitivo

        Returns:
            True se salvo com sucesso
        """
        if self.use_sqlite:
            self.conn.execute("""
                INSERT INTO respostas
                (pesquisa_id, eleitor_id, pergunta_id, resposta, fluxo_cognitivo, criado_em)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                pesquisa_id,
                eleitor_id,
                pergunta_id,
                resposta,
                json.dumps(fluxo_cognitivo, default=str) if fluxo_cognitivo else None,
                datetime.now().isoformat()
            ))
            self.conn.commit()
        else:
            # Append em arquivo de respostas
            path = self.data_dir / f"respostas_{pesquisa_id}.jsonl"
            with open(path, 'a', encoding='utf-8') as f:
                f.write(json.dumps({
                    "eleitor_id": eleitor_id,
                    "pergunta_id": pergunta_id,
                    "resposta": resposta,
                    "fluxo_cognitivo": fluxo_cognitivo,
                    "criado_em": datetime.now().isoformat()
                }, default=str) + "\n")

        return True

    def carregar_respostas(
        self,
        pesquisa_id: str,
        eleitor_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Carrega respostas de uma pesquisa.

        Args:
            pesquisa_id: ID da pesquisa
            eleitor_id: Filtrar por eleitor (opcional)

        Returns:
            Lista de respostas
        """
        if self.use_sqlite:
            if eleitor_id:
                cursor = self.conn.execute(
                    "SELECT * FROM respostas WHERE pesquisa_id = ? AND eleitor_id = ?",
                    (pesquisa_id, eleitor_id)
                )
            else:
                cursor = self.conn.execute(
                    "SELECT * FROM respostas WHERE pesquisa_id = ?",
                    (pesquisa_id,)
                )

            return [
                {
                    "id": row[0],
                    "pesquisa_id": row[1],
                    "eleitor_id": row[2],
                    "pergunta_id": row[3],
                    "resposta": row[4],
                    "fluxo_cognitivo": json.loads(row[5]) if row[5] else None,
                    "criado_em": row[6]
                }
                for row in cursor.fetchall()
            ]
        else:
            path = self.data_dir / f"respostas_{pesquisa_id}.jsonl"
            if not path.exists():
                return []

            respostas = []
            with open(path, 'r', encoding='utf-8') as f:
                for line in f:
                    resp = json.loads(line)
                    if eleitor_id and resp.get("eleitor_id") != eleitor_id:
                        continue
                    respostas.append(resp)

            return respostas

    # ==================== Relatórios ====================

    def salvar_relatorio(
        self,
        pesquisa_id: str,
        tipo: str,
        conteudo: str
    ) -> bool:
        """
        Salva um relatório.

        Args:
            pesquisa_id: ID da pesquisa
            tipo: Tipo do relatório (html, pdf, xlsx)
            conteudo: Conteúdo do relatório

        Returns:
            True se salvo com sucesso
        """
        if self.use_sqlite:
            self.conn.execute("""
                INSERT INTO relatorios (pesquisa_id, tipo, conteudo, criado_em)
                VALUES (?, ?, ?, ?)
            """, (
                pesquisa_id,
                tipo,
                conteudo,
                datetime.now().isoformat()
            ))
            self.conn.commit()
        else:
            path = self.data_dir / f"relatorio_{pesquisa_id}.{tipo}"
            with open(path, 'w', encoding='utf-8') as f:
                f.write(conteudo)

        return True

    def carregar_relatorio(
        self,
        pesquisa_id: str,
        tipo: str = "html"
    ) -> Optional[str]:
        """
        Carrega um relatório.

        Args:
            pesquisa_id: ID da pesquisa
            tipo: Tipo do relatório

        Returns:
            Conteúdo do relatório ou None
        """
        if self.use_sqlite:
            cursor = self.conn.execute(
                "SELECT conteudo FROM relatorios WHERE pesquisa_id = ? AND tipo = ? ORDER BY criado_em DESC LIMIT 1",
                (pesquisa_id, tipo)
            )
            row = cursor.fetchone()
            return row[0] if row else None
        else:
            path = self.data_dir / f"relatorio_{pesquisa_id}.{tipo}"
            if path.exists():
                with open(path, 'r', encoding='utf-8') as f:
                    return f.read()
            return None

    def deletar_pesquisa(self, pesquisa_id: str) -> bool:
        """
        Deleta todos os dados de uma pesquisa.

        Args:
            pesquisa_id: ID da pesquisa

        Returns:
            True se deletado com sucesso
        """
        if self.use_sqlite:
            self.conn.execute("DELETE FROM respostas WHERE pesquisa_id = ?", (pesquisa_id,))
            self.conn.execute("DELETE FROM relatorios WHERE pesquisa_id = ?", (pesquisa_id,))
            self.conn.execute("DELETE FROM pesquisas WHERE id = ?", (pesquisa_id,))
            self.conn.commit()
        else:
            # Deletar arquivos
            for pattern in [f"pesquisa_{pesquisa_id}*", f"respostas_{pesquisa_id}*", f"relatorio_{pesquisa_id}*"]:
                for file in self.data_dir.glob(pattern):
                    os.remove(file)

        return True

    def close(self) -> None:
        """Fecha conexões."""
        if self.use_sqlite and hasattr(self, 'conn'):
            self.conn.close()
