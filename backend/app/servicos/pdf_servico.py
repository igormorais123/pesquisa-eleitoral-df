"""
Serviço de PDF Premium — Oráculo Eleitoral

Geração de relatórios profissionais em PDF usando WeasyPrint + Jinja2 + Matplotlib.
Segue o padrão visual INTEIA com cores amber/gold.
"""

import base64
import io
import logging
from datetime import datetime
from pathlib import Path
from typing import Optional

from jinja2 import Environment, FileSystemLoader

logger = logging.getLogger(__name__)

# Diretório de templates
TEMPLATES_DIR = Path(__file__).parent.parent.parent / "templates"


class PDFServico:
    """Geração de relatórios PDF premium para campanhas eleitorais"""

    def __init__(self):
        self._jinja_env: Optional[Environment] = None

    @property
    def jinja_env(self) -> Environment:
        """Ambiente Jinja2 com templates carregados"""
        if self._jinja_env is None:
            self._jinja_env = Environment(
                loader=FileSystemLoader(str(TEMPLATES_DIR)),
                autoescape=True,
            )
        return self._jinja_env

    def _gerar_grafico_barras(
        self,
        dados: dict[str, float],
        titulo: str = "",
        cor: str = "#d69e2e",
    ) -> str:
        """
        Gera gráfico de barras com Matplotlib e retorna como base64 PNG.

        Args:
            dados: {label: valor}
            titulo: Título do gráfico
            cor: Cor das barras (padrão: amber INTEIA)

        Returns:
            String base64 da imagem PNG
        """
        try:
            import matplotlib
            matplotlib.use("Agg")
            import matplotlib.pyplot as plt

            fig, ax = plt.subplots(figsize=(8, 4))
            labels = list(dados.keys())
            valores = list(dados.values())

            bars = ax.barh(labels, valores, color=cor, edgecolor="#b7791f")
            ax.set_title(titulo, fontsize=14, fontweight="bold", color="#0f172a")
            ax.set_xlabel("Percentual (%)")

            # Adicionar valores nas barras
            for bar, valor in zip(bars, valores):
                ax.text(
                    bar.get_width() + 0.5,
                    bar.get_y() + bar.get_height() / 2,
                    f"{valor:.1f}%",
                    va="center",
                    fontsize=10,
                )

            plt.tight_layout()

            buf = io.BytesIO()
            fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
            plt.close(fig)
            buf.seek(0)

            return base64.b64encode(buf.read()).decode("utf-8")
        except Exception as e:
            logger.error(f"Erro ao gerar gráfico: {e}")
            return ""

    def _gerar_grafico_pizza(
        self,
        dados: dict[str, float],
        titulo: str = "",
    ) -> str:
        """Gera gráfico de pizza e retorna como base64 PNG"""
        try:
            import matplotlib
            matplotlib.use("Agg")
            import matplotlib.pyplot as plt

            fig, ax = plt.subplots(figsize=(6, 6))
            labels = list(dados.keys())
            valores = list(dados.values())
            cores = ["#d69e2e", "#f6e05e", "#b7791f", "#3b82f6", "#22c55e",
                      "#ef4444", "#8b5cf6", "#ec4899"]

            ax.pie(
                valores,
                labels=labels,
                autopct="%1.1f%%",
                colors=cores[:len(labels)],
                startangle=90,
            )
            ax.set_title(titulo, fontsize=14, fontweight="bold")

            plt.tight_layout()
            buf = io.BytesIO()
            fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
            plt.close(fig)
            buf.seek(0)

            return base64.b64encode(buf.read()).decode("utf-8")
        except Exception as e:
            logger.error(f"Erro ao gerar gráfico pizza: {e}")
            return ""

    def gerar_pdf(self, html_content: str) -> bytes:
        """
        Converte HTML em PDF usando WeasyPrint.

        Args:
            html_content: HTML completo do relatório

        Returns:
            Bytes do PDF gerado
        """
        try:
            from weasyprint import HTML

            pdf_bytes = HTML(string=html_content).write_pdf()
            logger.info(f"PDF gerado: {len(pdf_bytes)} bytes")
            return pdf_bytes
        except Exception as e:
            logger.error(f"Erro ao gerar PDF: {e}")
            raise

    def gerar_relatorio_semanal(self, dados: dict) -> bytes:
        """
        Gera relatório semanal em PDF.

        Args:
            dados: {
                "cliente": str,
                "periodo": str,
                "resumo": str,
                "intencao_voto": {candidato: percentual},
                "rejeicao": {candidato: percentual},
                "destaques": list[str],
                "recomendacoes": list[dict],
                "metricas": dict,
            }
        """
        # Gerar gráficos
        graficos = {}
        if "intencao_voto" in dados:
            graficos["intencao_voto"] = self._gerar_grafico_barras(
                dados["intencao_voto"], "Intenção de Voto (%)"
            )
        if "rejeicao" in dados:
            graficos["rejeicao"] = self._gerar_grafico_barras(
                dados["rejeicao"], "Rejeição (%)", cor="#ef4444"
            )

        try:
            template = self.jinja_env.get_template("relatorio_eleitoral.html")
        except Exception:
            # Template não encontrado — usar HTML inline
            return self._gerar_pdf_inline(dados, graficos, "Relatório Semanal")

        html = template.render(
            titulo="Relatório Semanal — Oráculo Eleitoral",
            data=datetime.now().strftime("%d/%m/%Y"),
            graficos=graficos,
            **dados,
        )
        return self.gerar_pdf(html)

    def gerar_briefing_diario(self, dados: dict) -> bytes:
        """Gera briefing diário em PDF compacto"""
        return self._gerar_pdf_inline(dados, {}, "Briefing Diário")

    def gerar_relatorio_simulacao(self, dados: dict) -> bytes:
        """Gera relatório de simulação eleitoral em PDF"""
        graficos = {}
        if "resultados" in dados:
            graficos["resultados"] = self._gerar_grafico_pizza(
                dados["resultados"], "Resultado da Simulação"
            )
        return self._gerar_pdf_inline(dados, graficos, "Simulação Eleitoral")

    def gerar_dossie_adversario(self, dados: dict) -> bytes:
        """Gera dossiê de adversário em PDF"""
        return self._gerar_pdf_inline(dados, {}, "Dossiê — Análise de Adversário")

    def _gerar_pdf_inline(
        self, dados: dict, graficos: dict, titulo: str
    ) -> bytes:
        """Gera PDF com template HTML inline (fallback)"""
        data_atual = datetime.now().strftime("%d/%m/%Y às %H:%M")

        # Construir seções de dados
        secoes_html = ""
        for chave, valor in dados.items():
            if isinstance(valor, dict):
                items = "".join(
                    f"<tr><td>{k}</td><td><strong>{v}</strong></td></tr>"
                    for k, v in valor.items()
                )
                secoes_html += f"""
                <h3 style="color:#d69e2e;margin-top:20px">{chave.replace('_',' ').title()}</h3>
                <table style="width:100%;border-collapse:collapse">
                    {items}
                </table>"""
            elif isinstance(valor, list):
                items = "".join(f"<li>{item}</li>" for item in valor)
                secoes_html += f"""
                <h3 style="color:#d69e2e;margin-top:20px">{chave.replace('_',' ').title()}</h3>
                <ul>{items}</ul>"""
            elif isinstance(valor, str) and len(valor) > 50:
                secoes_html += f"""
                <h3 style="color:#d69e2e;margin-top:20px">{chave.replace('_',' ').title()}</h3>
                <p>{valor}</p>"""

        # Gráficos
        graficos_html = ""
        for nome, b64 in graficos.items():
            if b64:
                graficos_html += f"""
                <div style="text-align:center;margin:20px 0">
                    <img src="data:image/png;base64,{b64}" style="max-width:100%"/>
                </div>"""

        html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8"/>
    <style>
        body {{
            font-family: 'Inter', 'Segoe UI', sans-serif;
            color: #0f172a;
            padding: 30px;
            line-height: 1.6;
        }}
        .header {{
            background: linear-gradient(135deg, #0f172a, #1e293b);
            color: white;
            padding: 25px 30px;
            border-radius: 12px;
            margin-bottom: 25px;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
        }}
        .header .logo {{
            color: #d69e2e;
            font-weight: 700;
        }}
        .header .data {{
            color: #94a3b8;
            font-size: 13px;
            margin-top: 5px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
        }}
        td {{
            padding: 8px 12px;
            border-bottom: 1px solid #e2e8f0;
        }}
        ul {{
            padding-left: 20px;
        }}
        li {{
            margin-bottom: 5px;
        }}
        .footer {{
            margin-top: 40px;
            padding-top: 15px;
            border-top: 2px solid #d69e2e;
            font-size: 11px;
            color: #64748b;
            text-align: center;
        }}
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">INTE<span style="color:#f6e05e">IA</span></div>
        <h1>{titulo}</h1>
        <div class="data">{data_atual} | Oráculo Eleitoral</div>
    </div>

    {graficos_html}
    {secoes_html}

    <div class="footer">
        INTEIA — Inteligência Estratégica<br/>
        CNPJ: 63.918.490/0001-20 | inteia.com.br<br/>
        Documento gerado por IA — Oráculo Eleitoral
    </div>
</body>
</html>"""

        return self.gerar_pdf(html)


# Instância global
pdf_servico = PDFServico()
