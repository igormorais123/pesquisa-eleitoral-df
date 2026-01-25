# POLARIS SDK - Checkpoint Manager
# Sistema de checkpoints para recuperação

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, List
import hashlib


class CheckpointManager:
    """
    Gerenciador de checkpoints para pesquisas.

    Permite salvar e recuperar estado de pesquisas em andamento.
    """

    def __init__(self, checkpoint_dir: str = "./checkpoints"):
        """
        Inicializa o gerenciador.

        Args:
            checkpoint_dir: Diretório para armazenar checkpoints
        """
        self.checkpoint_dir = Path(checkpoint_dir)
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)

    def _get_checkpoint_path(
        self,
        research_id: str,
        fase: Optional[str] = None
    ) -> Path:
        """Retorna caminho do arquivo de checkpoint."""
        if fase:
            filename = f"{research_id}_{fase}.json"
        else:
            filename = f"{research_id}_latest.json"
        return self.checkpoint_dir / filename

    def save(
        self,
        research_id: str,
        fase: str,
        data: Dict[str, Any],
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Salva um checkpoint.

        Args:
            research_id: ID da pesquisa
            fase: Fase atual
            data: Dados a salvar
            metadata: Metadados adicionais

        Returns:
            ID do checkpoint
        """
        checkpoint = {
            "research_id": research_id,
            "fase": fase,
            "timestamp": datetime.now().isoformat(),
            "data": data,
            "metadata": metadata or {},
            "version": "1.0"
        }

        # Calcular hash para verificação
        data_str = json.dumps(data, sort_keys=True, default=str)
        checkpoint["hash"] = hashlib.md5(data_str.encode()).hexdigest()

        # Salvar checkpoint específico da fase
        fase_path = self._get_checkpoint_path(research_id, fase)
        with open(fase_path, 'w', encoding='utf-8') as f:
            json.dump(checkpoint, f, ensure_ascii=False, indent=2, default=str)

        # Atualizar checkpoint "latest"
        latest_path = self._get_checkpoint_path(research_id)
        with open(latest_path, 'w', encoding='utf-8') as f:
            json.dump(checkpoint, f, ensure_ascii=False, indent=2, default=str)

        checkpoint_id = f"{research_id}:{fase}:{checkpoint['timestamp']}"
        return checkpoint_id

    def load(
        self,
        research_id: str,
        fase: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Carrega um checkpoint.

        Args:
            research_id: ID da pesquisa
            fase: Fase específica (ou latest se não fornecido)

        Returns:
            Dados do checkpoint ou None se não existir
        """
        path = self._get_checkpoint_path(research_id, fase)

        if not path.exists():
            return None

        with open(path, 'r', encoding='utf-8') as f:
            checkpoint = json.load(f)

        # Verificar integridade
        data_str = json.dumps(checkpoint["data"], sort_keys=True, default=str)
        current_hash = hashlib.md5(data_str.encode()).hexdigest()

        if current_hash != checkpoint.get("hash"):
            raise ValueError(f"Checkpoint corrompido: {path}")

        return checkpoint["data"]

    def load_full(
        self,
        research_id: str,
        fase: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Carrega checkpoint completo com metadados.

        Args:
            research_id: ID da pesquisa
            fase: Fase específica

        Returns:
            Checkpoint completo ou None
        """
        path = self._get_checkpoint_path(research_id, fase)

        if not path.exists():
            return None

        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def list_checkpoints(
        self,
        research_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Lista checkpoints disponíveis.

        Args:
            research_id: Filtrar por ID da pesquisa

        Returns:
            Lista de informações de checkpoints
        """
        checkpoints = []

        for file in self.checkpoint_dir.glob("*.json"):
            if file.name.endswith("_latest.json"):
                continue

            try:
                with open(file, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                if research_id and data.get("research_id") != research_id:
                    continue

                checkpoints.append({
                    "research_id": data.get("research_id"),
                    "fase": data.get("fase"),
                    "timestamp": data.get("timestamp"),
                    "file": str(file)
                })

            except (json.JSONDecodeError, KeyError):
                continue

        # Ordenar por timestamp
        checkpoints.sort(key=lambda x: x.get("timestamp", ""), reverse=True)

        return checkpoints

    def delete(
        self,
        research_id: str,
        fase: Optional[str] = None
    ) -> bool:
        """
        Deleta um checkpoint.

        Args:
            research_id: ID da pesquisa
            fase: Fase específica (ou todos se None)

        Returns:
            True se deletado com sucesso
        """
        if fase:
            path = self._get_checkpoint_path(research_id, fase)
            if path.exists():
                os.remove(path)
                return True
            return False

        # Deletar todos os checkpoints da pesquisa
        deleted = False
        for file in self.checkpoint_dir.glob(f"{research_id}*.json"):
            os.remove(file)
            deleted = True

        return deleted

    def get_latest_fase(self, research_id: str) -> Optional[str]:
        """
        Retorna a fase mais recente de uma pesquisa.

        Args:
            research_id: ID da pesquisa

        Returns:
            Nome da fase ou None
        """
        checkpoint = self.load_full(research_id)
        if checkpoint:
            return checkpoint.get("fase")
        return None

    def export_research(
        self,
        research_id: str,
        output_path: str
    ) -> bool:
        """
        Exporta todos os checkpoints de uma pesquisa.

        Args:
            research_id: ID da pesquisa
            output_path: Caminho do arquivo de exportação

        Returns:
            True se exportado com sucesso
        """
        checkpoints = []

        for ckpt in self.list_checkpoints(research_id):
            full_data = self.load_full(
                research_id,
                ckpt.get("fase")
            )
            if full_data:
                checkpoints.append(full_data)

        if not checkpoints:
            return False

        export_data = {
            "research_id": research_id,
            "exported_at": datetime.now().isoformat(),
            "total_checkpoints": len(checkpoints),
            "checkpoints": checkpoints
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, ensure_ascii=False, indent=2, default=str)

        return True

    def import_research(self, import_path: str) -> Optional[str]:
        """
        Importa checkpoints de uma pesquisa.

        Args:
            import_path: Caminho do arquivo de importação

        Returns:
            ID da pesquisa importada ou None
        """
        with open(import_path, 'r', encoding='utf-8') as f:
            export_data = json.load(f)

        research_id = export_data.get("research_id")
        checkpoints = export_data.get("checkpoints", [])

        for checkpoint in checkpoints:
            fase = checkpoint.get("fase")
            data = checkpoint.get("data")
            metadata = checkpoint.get("metadata")

            self.save(research_id, fase, data, metadata)

        return research_id
