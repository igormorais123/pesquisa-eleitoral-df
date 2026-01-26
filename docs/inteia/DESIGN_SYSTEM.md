# INTEIA Design System

## Identidade Visual

### Marca
- **Nome**: INTEIA (INTEligência + IA)
- **Destaque**: "IA" em cor âmbar (#d69e2e)
- **Fonte**: Inter (Google Fonts)
- **Estilo**: Premium, Clean, Apple/Claude-inspired

### Cores Primárias

```css
:root {
    /* Âmbar - Cor principal INTEIA */
    --amber: #d69e2e;
    --amber-light: #f6e05e;
    --amber-dark: #b7791f;

    /* Status */
    --success: #22c55e;
    --warning: #eab308;
    --danger: #ef4444;
    --info: #3b82f6;

    /* Backgrounds com transparência */
    --success-bg: rgba(34, 197, 94, 0.1);
    --warning-bg: rgba(234, 179, 8, 0.1);
    --danger-bg: rgba(239, 68, 68, 0.1);
    --info-bg: rgba(59, 130, 246, 0.1);
}
```

### Tema Claro
```css
[data-theme="light"] {
    --bg-primary: #ffffff;
    --bg-secondary: #f8fafc;
    --bg-tertiary: #f1f5f9;
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #64748b;
    --border-color: #e2e8f0;
    --sidebar-bg: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
}
```

### Tema Escuro
```css
[data-theme="dark"] {
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-tertiary: #334155;
    --text-primary: #f8fafc;
    --text-secondary: #cbd5e1;
    --text-muted: #94a3b8;
    --border-color: rgba(255, 255, 255, 0.08);
    --sidebar-bg: linear-gradient(180deg, #020617 0%, #0f172a 100%);
}
```

### Espaçamentos
```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
```

### Border Radius
```css
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
```

### Sombras
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
--shadow-amber: 0 4px 14px rgba(214, 158, 46, 0.25);
```

---

## Componentes Padrão

### Sidebar Lateral
- Largura: 60px
- Fundo: gradiente escuro
- Logo: ícone âmbar com "IA"
- Texto vertical: "INTEIA"
- Autor: nome + cargo

### Barra Superior (Top Controls)
- Altura: 56px
- Fundo: bg-primary
- Botões à direita:
  - Toggle tema (claro/escuro)
  - Botão de impressão (âmbar)

### Hero Header
- Background com gradiente sutil âmbar
- Border radius: 2xl
- Logo + tagline
- Metadata do relatório

### Cards
- Background: bg-card
- Border: 1px solid border-color
- Border radius: xl ou 2xl
- Shadow: card-shadow
- Padding: space-xl

### Seção Helena (IA)
- Header com gradiente âmbar
- Avatar circular com ícone
- Nome: "Helena"
- Cargo: "Agente de IA Avançados"
- Badge: "INTEIA"
- Mensagens com borda esquerda âmbar

---

## Arquivos de Referência

| Arquivo | Descrição |
|---------|-----------|
| `frontend/public/resultados-stress-test/index.html` | Template completo de relatório |
| `frontend/public/relatorio-inteia/index.html` | Relatório INTEIA principal |
| `docs/inteia/DESIGN_SYSTEM.md` | Este documento |
| `docs/inteia/HELENA_CONFIG.md` | Configuração da Helena |
| `docs/inteia/METODOLOGIA.md` | Metodologia de pesquisa |
| `docs/inteia/AUDITORIA.md` | Trilha de auditoria |
