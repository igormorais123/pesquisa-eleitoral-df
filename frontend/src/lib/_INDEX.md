# Lib - Bibliotecas e Utilitarios

> **GPS IA**: Funcoes utilitarias e logica de negocio no frontend

## Arquivos

| Arquivo | Funcao | Funcoes Principais |
|---------|--------|-------------------|
| [utils.ts](utils.ts) | Utilidades gerais | `cn()` (classnames), formatadores |
| [gerador-pdf.ts](gerador-pdf.ts) | Geracao de PDF | Exportar relatorios em PDF |
| [analise-estatistica.ts](analise-estatistica.ts) | Calculos estatisticos | Media, mediana, correlacoes, chi-quadrado |
| [analise-discurso.ts](analise-discurso.ts) | Analise de texto | Palavras frequentes, sentimentos, temas |
| [extrator-inteligente.ts](extrator-inteligente.ts) | Extracao de dados | Extrair insights de respostas |
| [classificador-perguntas.ts](classificador-perguntas.ts) | Classificacao | Classificar tipo de pergunta |

## Subpastas

### lib/claude/
Integracao com Claude API no frontend (API routes)

### lib/analysis/
Funcoes de analise avancada

### lib/data/
Manipulacao de dados

### lib/db/
Configuracao de banco (se houver no frontend)

### lib/export/
Exportacao em diferentes formatos (XLSX, PDF, DOCX)

## utils.ts - Funcoes Comuns

```typescript
import { cn } from '@/lib/utils';

// Combinar classes CSS (Tailwind)
<div className={cn('base-class', isActive && 'active-class')} />
```
