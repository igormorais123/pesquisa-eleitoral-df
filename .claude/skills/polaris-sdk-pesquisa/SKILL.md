# SKILL: POLARIS SDK (Motor de Pesquisa Científica)

> **Propósito**: Usar o `backend/sdk/polaris/` como motor padrão de pesquisa (Opus = cientista / Sonnet = respondente), com checkpoints, validação e geração de relatório.

---

## QUANDO USAR ESTA SKILL

- Quando quiser executar pesquisa premium com pipeline pronto (método, amostra, análises, relatório).
- Quando precisar de **checkpoints** e **persistência** para pesquisas longas.
- Quando quiser reduzir improviso e manter replicabilidade.

---

## VISÃO GERAL

O POLARIS já implementa:

- definição de problema e metodologia
- amostragem (inclui cálculo amostral)
- questionários (builder + templates)
- entrevistas com fluxo cognitivo
- análise quantitativa/qualitativa
- projeções/cenários
- geração de relatório HTML
- validação e trilha de persistência (JSON/SQLite)

---

## USO RECOMENDADO (Integrado ao pacote Premium)

1) Crie a pasta:

`resultados/pesquisas/{id}/`

2) Rode o POLARIS apontando `checkpoint_dir` e `data_dir` para dentro do pacote:

```python
import asyncio
import os
from pathlib import Path

from backend.sdk.polaris import PolarisSDK


async def run():
    pesquisa_id = "{slug}_{YYYYMMDD_HHMM}"
    base_dir = Path("resultados/pesquisas") / pesquisa_id
    base_dir.mkdir(parents=True, exist_ok=True)

    sdk = PolarisSDK(
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        checkpoint_dir=str(base_dir / "checkpoints"),
        data_dir=str(base_dir / "data"),
        log_level="INFO",
    )

    sdk.carregar_eleitores("agentes/banco-eleitores-df.json")

    async for p in sdk.executar_pesquisa(
        tema="Intencao de voto DF 2026",
        amostra_tamanho=500,
        nivel_confianca=0.95,
        margem_erro=0.03,
        cliente="(cliente)",
    ):
        print(f"[{p.fase}] {p.percentual:.1f}% - {p.mensagem}")

    relatorio = sdk.get_relatorio()
    if relatorio:
        relatorio.salvar(str(base_dir / "RELATORIO_CLIENTE.html"))


if __name__ == "__main__":
    asyncio.run(run())
```

3) Após rodar, consolidar artefatos no padrão premium:

- Copiar `.claude/templates/pesquisa-eleitoral-premium.md` → `PLANO_PESQUISA_COMPLETO.md`
- Copiar `.claude/templates/checklist-pesquisa-eleitoral-premium.md` → `CHECKLIST.md`
- Gerar `RELATORIO_CLIENTE.md` (curto) com base no HTML e nos dados
- Consolidar `DADOS_BRUTOS.json` se necessário (ex.: exportar JSONL → JSON)

---

## ARQUIVOS IMPORTANTES

- `backend/sdk/polaris/__init__.py` (interface PolarisSDK)
- `backend/sdk/polaris/examples/exemplo_uso_basico.py` (exemplos completos)
- `backend/sdk/polaris/utils/persistence.py` (dados: JSONL + relatório)

---

## NOTAS DE QUALIDADE

- Use Opus para síntese/relatório; Sonnet para volume (respondentes).
- Prefira checkpoints por fase para não perder progresso.
- Sempre exporte um resumo curto para o cliente; mantenha o pacote técnico completo.

---

*Skill criada em: 2026-01-30*
*Mantida por: INTEIA / Igor Morais (com apoio de IA)*
