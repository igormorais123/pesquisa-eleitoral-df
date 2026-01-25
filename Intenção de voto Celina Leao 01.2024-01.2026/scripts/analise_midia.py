# -*- coding: utf-8 -*-
"""
INTEIA - Inteligência Estratégica
Análise de Mídia e Redes Sociais - Celina Leão (Governador DF)
Período: Jul/2024 - Jan/2026
Autor: Igor Morais Vasconcelos

Gera os gráficos 11 a 13 a partir de dados/midia_presenca.csv:
- 11_mencoes_midia.png
- 12_midia_vs_votos.png
- 13_heatmap_sentimento.png
"""

from __future__ import annotations

import os
from datetime import datetime

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd


# Configurações gerais (mesmo padrão do analise_completa.py)
plt.style.use("seaborn-v0_8-whitegrid")
plt.rcParams["figure.figsize"] = (16, 10)
plt.rcParams["font.family"] = "sans-serif"
plt.rcParams["font.size"] = 14
plt.rcParams["axes.titlesize"] = 18
plt.rcParams["axes.labelsize"] = 14
plt.rcParams["xtick.labelsize"] = 12
plt.rcParams["ytick.labelsize"] = 12
plt.rcParams["legend.fontsize"] = 12
plt.rcParams["axes.titleweight"] = "bold"


# Cores da marca INTEIA
CORES = {
    "primaria": "#1a365d",  # Azul escuro
    "secundaria": "#2c5282",  # Azul médio
    "destaque": "#e53e3e",  # Vermelho
    "sucesso": "#38a169",  # Verde
    "alerta": "#d69e2e",  # Amarelo
    "neutro": "#718096",  # Cinza
    "fundo": "#f7fafc",  # Cinza claro
    "celina": "#2b6cb0",  # Azul Celina
    "arruda": "#c53030",  # Vermelho Arruda
    "grass": "#276749",  # Verde Grass
    "outros": "#a0aec0",  # Cinza outros
}


# Diretórios
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DADOS_DIR = os.path.join(BASE_DIR, "dados")
GRAFICOS_DIR = os.path.join(BASE_DIR, "graficos")


def adicionar_marca_agua(fig: plt.Figure) -> None:
    """Adiciona marca d'água INTEIA."""
    fig.text(
        0.99,
        0.01,
        "INTEIA - Igor Morais Vasconcelos",
        fontsize=9,
        color="gray",
        alpha=0.7,
        ha="right",
        va="bottom",
        style="italic",
    )


def carregar_dados_midia() -> pd.DataFrame:
    """Carrega dados mensais de mídia e normaliza tipos."""
    caminho = os.path.join(DADOS_DIR, "midia_presenca.csv")
    df = pd.read_csv(caminho)

    df["data"] = pd.to_datetime(
        df["ano"].astype(str)
        + "-"
        + df["mes"].astype(int).astype(str).str.zfill(2)
        + "-01"
    )
    df = df.sort_values("data").reset_index(drop=True)

    # Label curto para eixo X
    df["rotulo"] = df["data"].dt.strftime("%b/%y")
    # Total de presença (proxy) = imprensa + redes
    df["presenca_total"] = df["mencoes_imprensa"] + df["posts_redes_sociais"]

    return df


def grafico_11_mencoes_midia(df: pd.DataFrame) -> None:
    """Gráfico 11: Barras empilhadas (imprensa + redes) por mês."""
    fig, ax = plt.subplots(figsize=(16, 9))

    x = np.arange(len(df))
    imprensa = df["mencoes_imprensa"].to_numpy()
    redes = df["posts_redes_sociais"].to_numpy()

    ax.bar(
        x,
        imprensa,
        color=CORES["secundaria"],
        edgecolor="white",
        linewidth=1.2,
        label="Menções na imprensa (estimativa)",
    )
    ax.bar(
        x,
        redes,
        bottom=imprensa,
        color=CORES["celina"],
        edgecolor="white",
        linewidth=1.2,
        label="Posts em redes sociais (estimativa)",
    )

    # Linha de referência: início do investimento em MKT
    try:
        idx_mkt = df.index[df["data"] == pd.Timestamp("2025-01-01")][0]
        ax.axvline(x=idx_mkt - 0.5, color=CORES["destaque"], linestyle="--", linewidth=2, alpha=0.7)
        ax.text(
            idx_mkt,
            (imprensa + redes).max() * 0.98,
            "Início MKT\n(Jan/2025)",
            fontsize=10,
            color=CORES["destaque"],
            fontweight="bold",
            ha="left",
            va="top",
        )
    except Exception:
        pass

    ax.set_title(
        "PRESENÇA NA MÍDIA E REDES SOCIAIS (PROXY)\nMenções na imprensa + Posts em redes sociais (Jul/2024–Jan/2026)",
        fontsize=16,
        fontweight="bold",
        pad=20,
    )
    ax.set_xlabel("Mês", fontsize=12, fontweight="bold")
    ax.set_ylabel("Volume (contagem) - estimativa", fontsize=12, fontweight="bold")
    ax.set_xticks(x)
    ax.set_xticklabels(df["rotulo"], rotation=45, ha="right")
    ax.set_facecolor(CORES["fundo"])
    ax.grid(True, axis="y", alpha=0.3)
    ax.legend(loc="upper left", fontsize=10, framealpha=0.9)

    adicionar_marca_agua(fig)
    plt.tight_layout()
    os.makedirs(GRAFICOS_DIR, exist_ok=True)
    plt.savefig(os.path.join(GRAFICOS_DIR, "11_mencoes_midia.png"), dpi=150, bbox_inches="tight")
    plt.close()
    print("✓ Gráfico 11: Menções na mídia (barras empilhadas) gerado")


def grafico_12_midia_vs_votos(df: pd.DataFrame) -> None:
    """Gráfico 12: Presença total vs intenção de voto (dual-axis)."""
    fig, ax1 = plt.subplots(figsize=(16, 9))
    x = np.arange(len(df))

    presenca = df["presenca_total"].to_numpy()
    votos = df["intencao_voto_celina"].to_numpy()

    bars = ax1.bar(
        x,
        presenca,
        color=CORES["secundaria"],
        alpha=0.85,
        edgecolor="white",
        linewidth=1.2,
        label="Presença total (imprensa + redes)",
    )

    ax2 = ax1.twinx()
    ax2.plot(
        x,
        votos,
        color=CORES["destaque"],
        marker="o",
        linewidth=3,
        markersize=7,
        label="Intenção de voto (Celina Leão)",
        zorder=5,
    )

    # Marca Jan/2025
    try:
        idx_mkt = df.index[df["data"] == pd.Timestamp("2025-01-01")][0]
        ax1.axvline(x=idx_mkt - 0.5, color=CORES["destaque"], linestyle="--", linewidth=2, alpha=0.6)
    except Exception:
        pass

    ax1.set_title(
        "CORRELAÇÃO VISUAL: PRESENÇA NA MÍDIA × INTENÇÃO DE VOTO\nProxy de presença (barras) e intenção de voto (linha)",
        fontsize=16,
        fontweight="bold",
        pad=20,
    )
    ax1.set_xlabel("Mês", fontsize=12, fontweight="bold")
    ax1.set_ylabel("Presença total (contagem) - estimativa", fontsize=12, fontweight="bold")
    ax2.set_ylabel("Intenção de voto (%)", fontsize=12, fontweight="bold")

    ax1.set_xticks(x)
    ax1.set_xticklabels(df["rotulo"], rotation=45, ha="right")
    ax1.set_facecolor(CORES["fundo"])
    ax1.grid(True, axis="y", alpha=0.3)

    # Legenda combinada
    handles1, labels1 = ax1.get_legend_handles_labels()
    handles2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(handles1 + handles2, labels1 + labels2, loc="upper left", fontsize=10, framealpha=0.9)

    # Faixa de votos
    ax2.set_ylim(0, max(60, float(np.nanmax(votos)) + 5))

    adicionar_marca_agua(fig)
    plt.tight_layout()
    os.makedirs(GRAFICOS_DIR, exist_ok=True)
    plt.savefig(os.path.join(GRAFICOS_DIR, "12_midia_vs_votos.png"), dpi=150, bbox_inches="tight")
    plt.close()
    print("✓ Gráfico 12: Mídia vs votos (dual-axis) gerado")


def grafico_13_heatmap_sentimento(df: pd.DataFrame) -> None:
    """Gráfico 13: Heatmap de sentimento (pos/neg/neutro) por mês."""
    fig, ax = plt.subplots(figsize=(18, 5))

    mat = np.vstack(
        [
            df["sentimento_positivo"].to_numpy(),
            df["sentimento_negativo"].to_numpy(),
            df["sentimento_neutro"].to_numpy(),
        ]
    )

    im = ax.imshow(mat, aspect="auto", cmap="RdBu_r", vmin=0, vmax=100)

    ax.set_title(
        "SENTIMENTO NA COBERTURA (PROXY)\nDistribuição percentual por mês (positivo/negativo/neutro)",
        fontsize=16,
        fontweight="bold",
        pad=20,
    )
    ax.set_yticks([0, 1, 2])
    ax.set_yticklabels(["Positivo", "Negativo", "Neutro"], fontsize=11, fontweight="bold")
    ax.set_xticks(np.arange(len(df)))
    ax.set_xticklabels(df["rotulo"], rotation=45, ha="right")

    # Valores nas células
    for i in range(mat.shape[0]):
        for j in range(mat.shape[1]):
            val = int(mat[i, j])
            ax.text(j, i, f"{val}%", ha="center", va="center", fontsize=9, color="#111827")

    cbar = fig.colorbar(im, ax=ax, fraction=0.02, pad=0.02)
    cbar.set_label("Percentual (%)", fontsize=10)

    ax.set_facecolor(CORES["fundo"])
    ax.grid(False)

    adicionar_marca_agua(fig)
    plt.tight_layout()
    os.makedirs(GRAFICOS_DIR, exist_ok=True)
    plt.savefig(os.path.join(GRAFICOS_DIR, "13_heatmap_sentimento.png"), dpi=150, bbox_inches="tight")
    plt.close()
    print("✓ Gráfico 13: Heatmap de sentimento gerado")


def main() -> None:
    df = carregar_dados_midia()
    grafico_11_mencoes_midia(df)
    grafico_12_midia_vs_votos(df)
    grafico_13_heatmap_sentimento(df)


if __name__ == "__main__":
    main()
