# Paleta de Cores INTEIA

## Cor Primária - Âmbar/Dourado

A cor âmbar representa **inteligência, inovação e confiança**. É a cor principal da marca INTEIA.

| Nome | Hex | HSL | Uso |
|------|-----|-----|-----|
| amber-300 | #fcd34d | 45 93% 65% | Destaques especiais |
| amber-400 | #fbbf24 | 45 93% 56% | Textos destacados, hovers |
| **amber-500** | **#f59e0b** | **38 92% 50%** | **COR PRINCIPAL** |
| amber-600 | #d97706 | 32 95% 44% | Gradientes, pressed |
| amber-700 | #b45309 | 28 97% 37% | Sombras |

### Gradiente Principal
```css
background: linear-gradient(to right, #f59e0b, #d97706);
/* ou em Tailwind */
className="bg-gradient-to-r from-amber-500 to-amber-600"
```

## Cores de Fundo

| Nome | Hex | Uso |
|------|-----|-----|
| slate-950 | #020617 | Fundo principal da aplicação |
| slate-900 | #0f172a | Cards, sidebars, modais |
| slate-800 | #1e293b | Hover em cards, inputs |
| slate-700 | #334155 | Bordas visíveis (raro) |

### Fundo com Efeito
```css
/* Gradiente sutil de topo */
background: linear-gradient(to bottom, rgba(120, 53, 15, 0.05), #020617, #020617);

/* Blur de luz âmbar */
background: radial-gradient(circle, rgba(245, 158, 11, 0.05), transparent);
filter: blur(150px);
```

## Cores de Texto

| Classe Tailwind | Opacidade | Uso |
|-----------------|-----------|-----|
| text-white | 100% | Títulos principais, CTAs |
| text-white/70 | 70% | Texto de corpo importante |
| text-white/50 | 50% | Texto secundário |
| text-white/40 | 40% | Texto terciário, placeholders |
| text-white/30 | 30% | Texto muito sutil |
| text-amber-400 | - | Destaques, links, badges |
| text-amber-500 | - | Elementos primários |

## Cores de Borda

| Classe Tailwind | Uso |
|-----------------|-----|
| border-white/5 | Bordas muito sutis (padrão) |
| border-white/10 | Bordas visíveis |
| border-white/20 | Bordas destacadas |
| border-amber-500/20 | Bordas de destaque (hover) |
| border-amber-500/30 | Bordas de elementos ativos |

## Cores de Status

| Status | Cor | Hex | Background | Texto |
|--------|-----|-----|------------|-------|
| Sucesso | green | #22c55e | bg-green-500/20 | text-green-400 |
| Atenção | yellow | #eab308 | bg-yellow-500/20 | text-yellow-400 |
| Erro | red | #ef4444 | bg-red-500/20 | text-red-400 |
| Info | blue | #3b82f6 | bg-blue-500/20 | text-blue-400 |

### Exemplo de Badge de Status
```tsx
<span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
  Ativo
</span>
```

## Sombras

| Nome | CSS | Uso |
|------|-----|-----|
| Sombra Âmbar | `0 0 40px -10px rgba(245, 158, 11, 0.3)` | Cards destacados |
| Sombra Âmbar Intensa | `0 25px 50px -12px rgba(245, 158, 11, 0.25)` | CTAs, botões |
| Sombra Suave | `0 25px 50px -12px rgba(0, 0, 0, 0.25)` | Cards normais |

### Em Tailwind
```tsx
className="shadow-lg shadow-amber-500/25"  // Sombra âmbar
className="shadow-xl shadow-amber-500/20"  // Mais intensa
className="shadow-2xl"                      // Sombra escura
```

## Efeitos de Glassmorphism

```css
/* Card Glass */
background: rgba(15, 23, 42, 0.8);  /* slate-900/80 */
backdrop-filter: blur(24px);
border: 1px solid rgba(255, 255, 255, 0.05);

/* Header/Navbar Glass */
background: rgba(2, 6, 23, 0.8);  /* slate-950/80 */
backdrop-filter: blur(24px);
border-bottom: 1px solid rgba(255, 255, 255, 0.05);
```

### Em Tailwind
```tsx
className="bg-slate-900/80 backdrop-blur-xl border border-white/5"
```

## CSS Variables (globals.css)

```css
:root {
  /* Âmbar como primária */
  --primary: 38 92% 50%;
  --primary-foreground: 222 47% 5%;

  /* Fundos */
  --background: 222 47% 5%;
  --card: 222 47% 8%;
  --popover: 222 47% 8%;

  /* Textos */
  --foreground: 210 40% 98%;
  --card-foreground: 210 40% 98%;
  --muted-foreground: 215 20% 65%;

  /* Bordas */
  --border: 220 20% 18%;
  --ring: 38 92% 50%;

  /* Accent */
  --accent: 38 92% 50%;
  --accent-foreground: 222 47% 5%;
}
```

## Regras de Uso

### ✅ FAZER
- Usar âmbar para CTAs e elementos interativos
- Usar slate-950 como fundo principal
- Usar opacidades de branco para textos
- Usar sombras coloridas (âmbar)
- Usar bordas com opacidade (white/5, white/10)

### ❌ NÃO FAZER
- Usar azul como cor primária
- Usar fundos brancos ou claros
- Usar bordas sólidas escuras
- Usar sombras cinzas
- Usar cores muito saturadas em grandes áreas

---

*Paleta de Cores INTEIA v1.0 - Janeiro 2026*
