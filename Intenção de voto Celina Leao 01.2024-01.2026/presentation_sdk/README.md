# presentation_sdk

SDK simples para reproduzir o estilo (cores/grade/tipografia base) observado em apresentacoes do canal da Anthropic no YouTube, e aplicar esse padrao em graficos e decks.

## 1) Extrair slides de um video

Exemplo (video especifico):

```bash
.venv/bin/python scripts/extrair_slides_youtube.py --url "https://www.youtube.com/watch?v=CEvIs9y1uog" --sharpen --max-width 3840
```

Para keynotes gravadas (camera + telona), use recorte automatico da tela:

```bash
.venv/bin/python scripts/extrair_slides_youtube.py --url "https://www.youtube.com/watch?v=6eBSHbLKuN0" --crop-screen --sharpen --max-width 3840
```

Isso gera:
- `outputs/youtube_slides/<id>_<slug>/slides/slide_###.png`
- `outputs/youtube_slides/<id>_<slug>/index.html` (galeria)
- `outputs/youtube_slides/<id>_<slug>/deck.pptx` (um slide por print)
- `outputs/youtube_slides/<id>_<slug>/style.json` (paleta estimada)

Canal (processa os N mais recentes do tab /videos):

```bash
.venv/bin/python scripts/extrair_slides_youtube.py --url "https://www.youtube.com/@anthropic-ai" --limit 5 --sharpen --max-width 3840
```

## 2) Tokens de estilo

Tokens prontos:
- `presentation_sdk/tokens/anthropic_dark.json`
- `presentation_sdk/tokens/anthropic_light.json`

Tokens estimados a partir do video processado:
- `outputs/youtube_slides/<id>_<slug>/style.json`

Gerar um token mesclado (paleta agregada de todos os videos ja extraidos):

```bash
.venv/bin/python presentation_sdk/python/gerar_tokens_merged.py
```

## 3) Tema de graficos (Python)

Aplicar tema no matplotlib/seaborn:

```python
from presentation_sdk.python.tema_anthropic import aplicar_tema_matplotlib

aplicar_tema_matplotlib()  # define rcParams
```

Exemplo executavel:

```bash
.venv/bin/python presentation_sdk/python/exemplo_matplotlib.py
```

Plotly (export PNG) pode precisar de um browser headless. No WSL/arm64, use o Chromium do sistema:

```bash
BROWSER_PATH=/snap/bin/chromium .venv/bin/python presentation_sdk/python/exemplo_plotly.py
```

## 4) Tema de slides (Marp)

Tema CSS:
- `presentation_sdk/marp/anthropic.css`
- `presentation_sdk/marp/anthropic_light.css`

Exemplo:

```bash
# se voce usa marp-cli
marp presentation_sdk/marp/exemplo.md --theme-set presentation_sdk/marp/anthropic.css
```

## 5) Relatorio (Celina Leao)

Gerador que produz:
- PPTX
- HTML standalone (Claude style)
- Markdown (Marp)

```bash
.venv/bin/python scripts/gerar_apresentacao_claude.py
```

Saidas:
- `outputs/apresentacao_claude/index.html`
- `relatorio/relatorio-claude.html`
- `outputs/apresentacao_claude/Celina_Leao_2024-2025_Analise_ClaudeStyle.pptx`
