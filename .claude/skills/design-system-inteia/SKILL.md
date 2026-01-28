# Skill: Design System INTEIA

> Sistema de design visual da INTEIA. Usar SEMPRE ao criar componentes, páginas ou interfaces.

## Identidade Visual

### Filosofia

O design INTEIA é **elegante, escuro e sofisticado**, inspirado em interfaces premium de SaaS modernos. A cor âmbar/dourada transmite **inteligência, inovação e confiança**.

### Paleta de Cores Principal

```css
/* Cor Primária - Âmbar/Dourado */
--amber-400: #fbbf24;    /* Textos destacados, hovers */
--amber-500: #f59e0b;    /* Cor principal, botões, badges */
--amber-600: #d97706;    /* Gradientes, sombras */

/* Fundos */
--slate-950: #020617;    /* Fundo principal */
--slate-900: #0f172a;    /* Cards, sidebars, modais */
--slate-800: #1e293b;    /* Hover em cards */

/* Textos */
--white: #ffffff;        /* Títulos principais */
--white-70: rgba(255,255,255,0.7);   /* Texto secundário */
--white-50: rgba(255,255,255,0.5);   /* Texto terciário */
--white-40: rgba(255,255,255,0.4);   /* Texto sutil */

/* Bordas */
--border-subtle: rgba(255,255,255,0.05);   /* Bordas sutis */
--border-light: rgba(255,255,255,0.10);    /* Bordas visíveis */
--border-amber: rgba(245,158,11,0.20);     /* Bordas destaque */

/* Status */
--success: #22c55e;      /* Verde - Sucesso */
--warning: #eab308;      /* Amarelo - Atenção */
--danger: #ef4444;       /* Vermelho - Erro/Crítico */
--info: #3b82f6;         /* Azul - Informativo */
```

### Gradientes

```css
/* Gradiente Principal (botões, CTAs) */
background: linear-gradient(to right, #f59e0b, #d97706);

/* Gradiente de Fundo Sutil */
background: radial-gradient(ellipse 80% 80% at 50% -20%, rgba(245, 158, 11, 0.08), transparent);

/* Gradiente Hero (páginas de destaque) */
background: linear-gradient(to bottom, rgba(120, 53, 15, 0.1), #020617, #020617);

/* Gradiente Blur (efeito de luz) */
background: radial-gradient(circle, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05));
filter: blur(150px);
```

### Sombras

```css
/* Sombra Âmbar (botões, cards destacados) */
box-shadow: 0 0 40px -10px rgba(245, 158, 11, 0.3);

/* Sombra Âmbar Intensa (CTAs) */
box-shadow: 0 25px 50px -12px rgba(245, 158, 11, 0.25);

/* Sombra Suave (cards normais) */
box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
```

## Componentes Padrão

### Logo INTEIA

```tsx
// Versão Completa
<div className="flex items-center gap-3">
  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
    <span className="text-white font-bold text-sm">IA</span>
  </div>
  <div className="flex flex-col">
    <span className="font-bold text-white text-xl tracking-tight">
      INTE<span className="text-amber-400">IA</span>
    </span>
    <span className="text-white/50 text-xs">Inteligência Estratégica</span>
  </div>
</div>
```

### Botão Primário

```tsx
<button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-full text-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/25">
  Texto do Botão
</button>
```

### Botão Secundário

```tsx
<button className="px-8 py-4 bg-white/5 text-white rounded-full text-lg font-medium hover:bg-white/10 transition-all border border-white/10">
  Texto do Botão
</button>
```

### Card Glass

```tsx
<div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl">
  {/* Conteúdo */}
</div>
```

### Badge INTEIA

```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
  <span className="text-amber-400 text-sm font-medium">Texto do Badge</span>
</div>
```

### Header/Navbar

```tsx
<header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
  {/* Conteúdo */}
</header>
```

### Sidebar

```tsx
<aside className="fixed left-0 top-0 h-screen bg-slate-900/80 backdrop-blur-xl border-r border-white/5 w-64">
  {/* Conteúdo */}
</aside>
```

### Input de Formulário

```tsx
<input
  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-amber-500 focus:ring-0 outline-none transition-colors text-white placeholder:text-white/30"
  placeholder="Placeholder..."
/>
```

### Modal/Dialog

```tsx
<div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
  <div className="w-full max-w-md bg-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl">
    {/* Conteúdo */}
  </div>
</div>
```

## Layout de Página

### Fundo com Efeito Visual

```tsx
<div className="min-h-screen bg-slate-950">
  {/* Gradiente sutil no topo */}
  <div className="fixed inset-0 bg-gradient-to-b from-amber-900/5 via-slate-950 to-slate-950 pointer-events-none" />

  {/* Blur de luz âmbar */}
  <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-amber-600/5 to-amber-500/5 rounded-full blur-[200px] pointer-events-none" />

  {/* Conteúdo */}
  <div className="relative">
    {/* ... */}
  </div>
</div>
```

## Tipografia

### Fonte Principal
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Hierarquia

| Elemento | Tamanho | Peso | Tracking |
|----------|---------|------|----------|
| H1 (Hero) | 5xl-8xl | 700 | tight |
| H2 (Seção) | 4xl-6xl | 700 | tight |
| H3 (Card) | 2xl | 700 | normal |
| H4 (Subtítulo) | lg-xl | 600 | normal |
| Body | base (14-16px) | 400 | normal |
| Small | xs-sm | 500 | normal |
| Caption | [10px] | 500 | wider |

## Espaçamento

```css
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */
--space-3xl: 4rem;     /* 64px */
```

## Border Radius

```css
--radius-sm: 0.5rem;    /* 8px - inputs, badges */
--radius-md: 0.75rem;   /* 12px - cards pequenos */
--radius-lg: 1rem;      /* 16px - cards médios */
--radius-xl: 1.5rem;    /* 24px - cards grandes */
--radius-2xl: 2rem;     /* 32px - modais, seções */
--radius-full: 9999px;  /* Botões pill, avatares */
```

## Animações

### Transições Padrão
```css
transition: all 0.3s ease;
```

### Hover em Cards
```css
.card:hover {
  border-color: rgba(245, 158, 11, 0.2);
  transform: translateY(-2px);
}
```

### Pulse (badges ativos)
```css
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```

## Responsividade

### Breakpoints
```css
sm: 640px   /* Mobile grande */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop pequeno */
xl: 1280px  /* Desktop */
2xl: 1536px /* Desktop grande */
```

### Mobile First
- Em mobile: navegação inferior, sidebar oculta
- Em desktop: sidebar fixa, header horizontal

## Regras de Uso

### SEMPRE fazer:
- ✅ Usar `backdrop-blur-xl` em overlays e headers
- ✅ Usar `border-white/5` ou `border-white/10` para bordas
- ✅ Usar gradiente âmbar em CTAs e botões principais
- ✅ Usar `shadow-amber-500/25` em elementos destacados
- ✅ Usar `rounded-xl` ou maior em cards
- ✅ Usar `text-white/50` para textos secundários

### NUNCA fazer:
- ❌ Usar azul como cor primária (era o antigo, agora é âmbar)
- ❌ Usar bordas sólidas escuras (usar white/5 ou white/10)
- ❌ Usar fundos brancos ou claros
- ❌ Usar sombras cinzas (usar sombras coloridas âmbar)
- ❌ Usar cantos vivos (sempre arredondados)

## Arquivos de Referência

| Arquivo | Propósito |
|---------|-----------|
| `frontend/src/styles/globals.css` | Variáveis CSS, classes utilitárias |
| `frontend/src/app/(auth)/login/page.tsx` | Landing page (referência visual) |
| `frontend/src/app/(dashboard)/layout.tsx` | Layout interno com efeitos |
| `frontend/src/components/branding/` | Componentes de marca |
| `frontend/src/components/layout/` | Header, Sidebar, MobileNav |

## Exemplo de Página Completa

```tsx
export default function MinhaPage() {
  return (
    <div className="space-y-8">
      {/* Header da Página */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Título da Página</h1>
          <p className="text-white/50 mt-1">Descrição breve</p>
        </div>
        <button className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-full font-semibold shadow-lg shadow-amber-500/25">
          Ação Principal
        </button>
      </div>

      {/* Cards em Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-amber-500/20 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{item.titulo}</h3>
            <p className="text-white/50">{item.descricao}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

*Skill criada em Janeiro/2026. Manter atualizada conforme evolução do design.*
