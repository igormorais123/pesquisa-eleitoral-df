# POLARIS SDK - HTML Report Generator
# Gerador de relatórios HTML interativos

import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from pathlib import Path

from ..models.research import ProblemDefinition, MethodologyDesign, Questionnaire
from ..models.sample import SelectedSample
from ..models.report import (
    HTMLReport,
    ExecutiveSummary,
    KeyFinding,
    ProjectionScenario,
    Recommendation,
    RecommendationPriority,
)


class HTMLReportGenerator:
    """
    Gerador de relatórios HTML profissionais.

    Produz relatórios interativos com gráficos e navegação.
    """

    def __init__(self):
        """Inicializa o gerador."""
        self.template_dir = Path(__file__).parent / "templates"

    def gerar_relatorio(
        self,
        titulo: str,
        problematica: ProblemDefinition,
        metodologia: MethodologyDesign,
        amostra: SelectedSample,
        analises: Dict[str, Any],
        projecoes: List[ProjectionScenario],
        recomendacoes: List[Recommendation]
    ) -> HTMLReport:
        """
        Gera relatório HTML completo.

        Args:
            titulo: Título do relatório
            problematica: Definição da problemática
            metodologia: Desenho metodológico
            amostra: Amostra selecionada
            analises: Resultados das análises
            projecoes: Cenários de projeção
            recomendacoes: Recomendações estratégicas

        Returns:
            Relatório HTML
        """
        # Extrair dados principais
        intencao_voto = analises.get("analise_descritiva", {}).get("intencao_voto", {})
        distribuicao = intencao_voto.get("distribuicao", {})

        # Preparar dados para gráficos
        candidatos = list(distribuicao.keys())
        percentuais = [distribuicao.get(c, {}).get("percentual", 0) for c in candidatos]

        # Criar sumário executivo
        sumario = self._criar_sumario_executivo(
            titulo=titulo,
            intencao_voto=intencao_voto,
            analises=analises
        )

        # Gerar HTML
        html_content = self._gerar_html(
            titulo=titulo,
            sumario=sumario,
            problematica=problematica,
            metodologia=metodologia,
            amostra=amostra,
            analises=analises,
            candidatos=candidatos,
            percentuais=percentuais,
            projecoes=projecoes,
            recomendacoes=recomendacoes
        )

        return HTMLReport(
            titulo=titulo,
            html_content=html_content,
            secoes=[
                "capa",
                "sumario_executivo",
                "metodologia",
                "resultados",
                "projecoes",
                "recomendacoes"
            ]
        )

    def _criar_sumario_executivo(
        self,
        titulo: str,
        intencao_voto: Dict[str, Any],
        analises: Dict[str, Any]
    ) -> ExecutiveSummary:
        """Cria sumário executivo."""
        lider = intencao_voto.get("lider", "N/A")
        percentual_lider = intencao_voto.get("percentual_lider", 0)
        segundo = intencao_voto.get("segundo", "N/A")
        percentual_segundo = intencao_voto.get("percentual_segundo", 0)
        indecisos = intencao_voto.get("indecisos", 0)

        achados = []

        # Achado 1: Líder
        achados.append(KeyFinding(
            titulo="Liderança definida",
            descricao=f"{lider} lidera com {percentual_lider:.1f}%",
            impacto="alto",
            dados_suporte=f"Segundo colocado: {segundo} com {percentual_segundo:.1f}%",
            implicacao="Vantagem precisa ser consolidada"
        ))

        # Achado 2: Indecisos
        if indecisos > 10:
            achados.append(KeyFinding(
                titulo="Alto percentual de indecisos",
                descricao=f"{indecisos:.1f}% dos eleitores ainda não decidiram",
                impacto="alto",
                dados_suporte="Pode alterar o resultado",
                implicacao="Disputa ainda está aberta"
            ))

        return ExecutiveSummary(
            titulo=titulo,
            lider=lider,
            percentual_lider=percentual_lider,
            margem_erro=3.0,
            diferenca_segundo=intencao_voto.get("diferenca", 0),
            indecisos=indecisos,
            achados_principais=achados,
            headline=f"{lider} lidera disputa com {percentual_lider:.1f}%"
        )

    def _gerar_html(
        self,
        titulo: str,
        sumario: ExecutiveSummary,
        problematica: ProblemDefinition,
        metodologia: MethodologyDesign,
        amostra: SelectedSample,
        analises: Dict[str, Any],
        candidatos: List[str],
        percentuais: List[float],
        projecoes: List[ProjectionScenario],
        recomendacoes: List[Recommendation]
    ) -> str:
        """Gera o HTML completo."""
        # CSS embutido
        css = self._get_css()

        # Preparar dados para gráficos
        candidatos_json = json.dumps(candidatos, ensure_ascii=False)
        percentuais_json = json.dumps(percentuais)

        # Cores para gráficos
        cores = ["#2563eb", "#dc2626", "#16a34a", "#f59e0b", "#6366f1", "#ec4899", "#6b7280"]
        cores_json = json.dumps(cores[:len(candidatos)])

        # Gerar seções
        secao_recomendacoes = self._gerar_secao_recomendacoes(recomendacoes)
        secao_projecoes = self._gerar_secao_projecoes(projecoes)

        # Estatísticas da amostra
        stats_amostra = amostra.get_estatisticas() if amostra else {}

        html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{titulo} - Relatório POLARIS</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
{css}
    </style>
</head>
<body>
    <!-- Navegação -->
    <nav class="nav-sidebar">
        <div class="nav-logo">POLARIS</div>
        <ul>
            <li><a href="#capa">Capa</a></li>
            <li><a href="#sumario">Sumário Executivo</a></li>
            <li><a href="#metodologia">Metodologia</a></li>
            <li><a href="#resultados">Resultados</a></li>
            <li><a href="#projecoes">Projeções</a></li>
            <li><a href="#recomendacoes">Recomendações</a></li>
        </ul>
    </nav>

    <main class="content">
        <!-- Capa -->
        <section id="capa" class="section hero">
            <div class="hero-content">
                <h1>{titulo}</h1>
                <p class="subtitle">Relatório de Inteligência Eleitoral</p>
                <p class="date">{datetime.now().strftime('%d de %B de %Y')}</p>
                <div class="logo-polaris">
                    <span class="logo-icon">📊</span>
                    <span class="logo-text">POLARIS SDK</span>
                </div>
            </div>
        </section>

        <!-- Sumário Executivo -->
        <section id="sumario" class="section">
            <h2>Sumário Executivo</h2>

            <div class="kpi-grid">
                <div class="kpi-card primary">
                    <div class="kpi-value">{sumario.percentual_lider:.1f}%</div>
                    <div class="kpi-label">Líder: {sumario.lider}</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">±{sumario.margem_erro}%</div>
                    <div class="kpi-label">Margem de Erro</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">{sumario.diferenca_segundo:.1f}pp</div>
                    <div class="kpi-label">Diferença p/ 2º</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">{sumario.indecisos:.1f}%</div>
                    <div class="kpi-label">Indecisos</div>
                </div>
            </div>

            <div class="achados-box">
                <h3>Principais Achados</h3>
                <ul class="achados-lista">
                    {"".join(f'<li><strong>{a.titulo}:</strong> {a.descricao}</li>' for a in sumario.achados_principais)}
                </ul>
            </div>

            <div class="headline-box">
                <p class="headline">{sumario.headline}</p>
            </div>
        </section>

        <!-- Metodologia -->
        <section id="metodologia" class="section">
            <h2>Metodologia</h2>

            <div class="ficha-tecnica">
                <h3>Ficha Técnica</h3>
                <table class="tabela-ficha">
                    <tr>
                        <td><strong>Universo</strong></td>
                        <td>Eleitores do Distrito Federal (18+ anos)</td>
                    </tr>
                    <tr>
                        <td><strong>Amostra</strong></td>
                        <td>{stats_amostra.get('total', 0)} eleitores</td>
                    </tr>
                    <tr>
                        <td><strong>Tipo de pesquisa</strong></td>
                        <td>{metodologia.tipo_pesquisa.value.capitalize()}</td>
                    </tr>
                    <tr>
                        <td><strong>Abordagem</strong></td>
                        <td>{metodologia.abordagem.value.capitalize()}</td>
                    </tr>
                    <tr>
                        <td><strong>Margem de erro</strong></td>
                        <td>±3% para 95% de confiança</td>
                    </tr>
                    <tr>
                        <td><strong>Período</strong></td>
                        <td>{datetime.now().strftime('%d/%m/%Y')}</td>
                    </tr>
                </table>
            </div>

            <div class="metodologia-descricao">
                <h3>Descrição Metodológica</h3>
                <p>{metodologia.justificativa or "Pesquisa realizada com metodologia mista, combinando análises quantitativas e qualitativas."}</p>
            </div>
        </section>

        <!-- Resultados -->
        <section id="resultados" class="section">
            <h2>Resultados</h2>

            <div class="grafico-container">
                <h3>Intenção de Voto Estimulada</h3>
                <canvas id="chartIntencao"></canvas>
            </div>

            <div class="tabela-container">
                <h3>Distribuição Detalhada</h3>
                <table class="tabela-resultados">
                    <thead>
                        <tr>
                            <th>Candidato</th>
                            <th>Percentual</th>
                            <th>Variação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {"".join(f'<tr><td>{c}</td><td>{p:.1f}%</td><td>-</td></tr>' for c, p in zip(candidatos, percentuais))}
                    </tbody>
                </table>
            </div>
        </section>

        <!-- Projeções -->
        <section id="projecoes" class="section">
            <h2>Projeções</h2>
            {secao_projecoes}
        </section>

        <!-- Recomendações -->
        <section id="recomendacoes" class="section">
            <h2>Recomendações Estratégicas</h2>
            {secao_recomendacoes}
        </section>

        <!-- Footer -->
        <footer class="footer">
            <p>Gerado por <strong>POLARIS SDK</strong> - Political Analysis & Research Intelligence System</p>
            <p class="footer-date">{datetime.now().strftime('%d/%m/%Y às %H:%M')}</p>
        </footer>
    </main>

    <script>
        // Gráfico de Intenção de Voto
        const ctx = document.getElementById('chartIntencao').getContext('2d');
        new Chart(ctx, {{
            type: 'bar',
            data: {{
                labels: {candidatos_json},
                datasets: [{{
                    label: 'Intenção de Voto (%)',
                    data: {percentuais_json},
                    backgroundColor: {cores_json},
                    borderRadius: 8
                }}]
            }},
            options: {{
                responsive: true,
                plugins: {{
                    legend: {{ display: false }},
                    title: {{ display: false }}
                }},
                scales: {{
                    y: {{
                        beginAtZero: true,
                        max: 100,
                        ticks: {{
                            callback: function(value) {{ return value + '%'; }}
                        }}
                    }}
                }}
            }}
        }});

        // Navegação suave
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {{
            anchor.addEventListener('click', function (e) {{
                e.preventDefault();
                document.querySelector(this.getAttribute('href')).scrollIntoView({{
                    behavior: 'smooth'
                }});
            }});
        }});
    </script>
</body>
</html>"""

        return html

    def _get_css(self) -> str:
        """Retorna CSS embutido."""
        return """
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            background: #f8fafc;
        }

        .nav-sidebar {
            position: fixed;
            left: 0;
            top: 0;
            width: 220px;
            height: 100vh;
            background: #1e3a8a;
            padding: 20px;
            color: white;
            z-index: 100;
        }

        .nav-logo {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 1px solid rgba(255,255,255,0.2);
        }

        .nav-sidebar ul {
            list-style: none;
        }

        .nav-sidebar li {
            margin-bottom: 10px;
        }

        .nav-sidebar a {
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            display: block;
            padding: 8px 12px;
            border-radius: 6px;
            transition: all 0.2s;
        }

        .nav-sidebar a:hover {
            background: rgba(255,255,255,0.1);
            color: white;
        }

        .content {
            margin-left: 220px;
            padding: 40px;
            max-width: 1200px;
        }

        .section {
            background: white;
            border-radius: 12px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .hero {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
            color: white;
            text-align: center;
            padding: 80px 40px;
        }

        .hero h1 {
            font-size: 2.5rem;
            margin-bottom: 15px;
        }

        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 10px;
        }

        .date {
            opacity: 0.8;
            margin-bottom: 30px;
        }

        .logo-polaris {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: rgba(255,255,255,0.1);
            padding: 10px 20px;
            border-radius: 8px;
        }

        .logo-icon {
            font-size: 1.5rem;
        }

        h2 {
            font-size: 1.8rem;
            color: #1e3a8a;
            margin-bottom: 25px;
            padding-bottom: 10px;
            border-bottom: 2px solid #3b82f6;
        }

        h3 {
            font-size: 1.2rem;
            color: #334155;
            margin-bottom: 15px;
        }

        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .kpi-card {
            background: #f1f5f9;
            padding: 25px;
            border-radius: 10px;
            text-align: center;
        }

        .kpi-card.primary {
            background: #1e3a8a;
            color: white;
        }

        .kpi-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .kpi-label {
            font-size: 0.9rem;
            opacity: 0.8;
        }

        .achados-box {
            background: #eff6ff;
            padding: 25px;
            border-radius: 10px;
            border-left: 4px solid #3b82f6;
            margin-bottom: 20px;
        }

        .achados-lista {
            list-style: none;
        }

        .achados-lista li {
            padding: 10px 0;
            border-bottom: 1px solid rgba(0,0,0,0.1);
        }

        .achados-lista li:last-child {
            border-bottom: none;
        }

        .headline-box {
            background: #f0fdf4;
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #22c55e;
        }

        .headline {
            font-size: 1.2rem;
            font-weight: 600;
            color: #166534;
        }

        .ficha-tecnica {
            margin-bottom: 30px;
        }

        .tabela-ficha {
            width: 100%;
            border-collapse: collapse;
        }

        .tabela-ficha td {
            padding: 12px 15px;
            border-bottom: 1px solid #e2e8f0;
        }

        .tabela-ficha td:first-child {
            width: 200px;
            color: #64748b;
        }

        .grafico-container {
            margin-bottom: 40px;
        }

        .grafico-container canvas {
            max-height: 400px;
        }

        .tabela-resultados {
            width: 100%;
            border-collapse: collapse;
        }

        .tabela-resultados th,
        .tabela-resultados td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }

        .tabela-resultados th {
            background: #f1f5f9;
            font-weight: 600;
        }

        .cenarios-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
        }

        .cenario-card {
            padding: 25px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
        }

        .cenario-card.otimista {
            border-color: #22c55e;
            background: #f0fdf4;
        }

        .cenario-card.realista {
            border-color: #3b82f6;
            background: #eff6ff;
        }

        .cenario-card.pessimista {
            border-color: #ef4444;
            background: #fef2f2;
        }

        .cenario-card h4 {
            margin-bottom: 10px;
            color: #334155;
        }

        .recomendacoes-lista {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .recomendacao-card {
            padding: 25px;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            background: white;
        }

        .recomendacao-card.critica {
            border-left: 4px solid #ef4444;
        }

        .recomendacao-card.alta {
            border-left: 4px solid #f59e0b;
        }

        .recomendacao-card.media {
            border-left: 4px solid #3b82f6;
        }

        .recomendacao-card.baixa {
            border-left: 4px solid #6b7280;
        }

        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 10px;
        }

        .badge-critica { background: #fef2f2; color: #dc2626; }
        .badge-alta { background: #fffbeb; color: #d97706; }
        .badge-media { background: #eff6ff; color: #2563eb; }
        .badge-baixa { background: #f3f4f6; color: #4b5563; }

        .recomendacao-titulo {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 10px;
            color: #1e293b;
        }

        .recomendacao-texto {
            color: #475569;
            margin-bottom: 15px;
        }

        .acoes-lista {
            list-style: none;
            padding-left: 0;
        }

        .acoes-lista li {
            padding: 6px 0;
            padding-left: 20px;
            position: relative;
            color: #64748b;
        }

        .acoes-lista li::before {
            content: '→';
            position: absolute;
            left: 0;
            color: #3b82f6;
        }

        .footer {
            text-align: center;
            padding: 30px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }

        .footer-date {
            font-size: 0.85rem;
            margin-top: 5px;
        }

        @media (max-width: 768px) {
            .nav-sidebar {
                width: 100%;
                height: auto;
                position: relative;
            }

            .content {
                margin-left: 0;
                padding: 20px;
            }

            .kpi-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media print {
            .nav-sidebar {
                display: none;
            }

            .content {
                margin-left: 0;
            }

            .section {
                break-inside: avoid;
            }
        }
        """

    def _gerar_secao_projecoes(
        self,
        projecoes: List[ProjectionScenario]
    ) -> str:
        """Gera seção de projeções."""
        if not projecoes:
            return "<p>Projeções não disponíveis.</p>"

        cards = []
        for proj in projecoes:
            classe = proj.tipo.value if proj.tipo else "realista"
            cards.append(f"""
            <div class="cenario-card {classe}">
                <h4>{proj.nome}</h4>
                <p>{proj.descricao}</p>
                <ul>
                    {"".join(f'<li>{p}</li>' for p in proj.premissas[:3])}
                </ul>
            </div>
            """)

        return f'<div class="cenarios-grid">{"".join(cards)}</div>'

    def _gerar_secao_recomendacoes(
        self,
        recomendacoes: List[Recommendation]
    ) -> str:
        """Gera seção de recomendações."""
        if not recomendacoes:
            return "<p>Recomendações não disponíveis.</p>"

        cards = []
        for rec in recomendacoes:
            prioridade = rec.prioridade.value if rec.prioridade else "media"
            cards.append(f"""
            <div class="recomendacao-card {prioridade}">
                <span class="badge badge-{prioridade}">{prioridade.upper()}</span>
                <h4 class="recomendacao-titulo">{rec.titulo}</h4>
                <p class="recomendacao-texto">{rec.recomendacao}</p>
                <ul class="acoes-lista">
                    {"".join(f'<li>{a}</li>' for a in rec.acoes_especificas[:4])}
                </ul>
            </div>
            """)

        return f'<div class="recomendacoes-lista">{"".join(cards)}</div>'
