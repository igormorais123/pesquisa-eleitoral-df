# Paleta de Cores INTEIA

## Filosofia de Temas

A INTEIA suporta dois temas visuais distintos:
- **Modo Escuro** (padrão) - Elegante, profissional, reduz fadiga visual
- **Modo Claro** - Limpo, acessível, ideal para ambientes iluminados

Ambos mantêm a **identidade âmbar** como cor primária.

---

## Cor Primária - Âmbar/Dourado

A cor âmbar representa **inteligência, inovação e confiança**. É a cor principal da marca INTEIA.

| Nome | Hex | HSL | Uso |
|------|-----|-----|-----|
| amber-300 | #fcd34d | 45 93% 65% | Destaques especiais |
| amber-400 | #fbbf24 | 45 93% 56% | Textos destacados (modo escuro) |
| **amber-500** | **#f59e0b** | **38 92% 50%** | **COR PRINCIPAL** |
| amber-600 | #d97706 | 32 95% 44% | Gradientes, textos (modo claro) |
| amber-700 | #b45309 | 28 97% 37% | Textos fortes (modo claro) |

### Gradiente Principal
```css
background: linear-gradient(to right, #f59e0b, #d97706);
/* ou em Tailwind */
className="bg-gradient-to-r from-amber-500 to-amber-600"
```

---

## Modo Escuro (Padrão)

### Cores de Fundo

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

### Cores de Texto (Modo Escuro)

| Classe Tailwind | Opacidade | Uso |
|-----------------|-----------|-----|
| text-white | 100% | Títulos principais, CTAs |
| text-white/70 | 70% | Texto de corpo importante |
| text-white/50 | 50% | Texto secundário |
| text-white/40 | 40% | Texto terciário, placeholders |
| text-white/30 | 30% | Texto muito sutil |
| text-amber-400 | - | Destaques, links, badges |

### Bordas (Modo Escuro)

| Classe Tailwind | Uso |
|-----------------|-----|
| border-white/5 | Bordas muito sutis (padrão) |
| border-white/10 | Bordas visíveis |
| border-white/20 | Bordas destacadas |
| border-amber-500/20 | Bordas de destaque (hover) |

---

## Modo Claro

### Cores de Fundo

| Nome | Hex | HSL | Uso |
|------|-----|-----|-----|
| background | #f8fafc | 210 20% 98% | Fundo principal |
| card | #ffffff | 0 0% 100% | Cards, modais |
| secondary | #f1f5f9 | 210 20% 96% | Áreas secundárias |

### Cores de Texto (Modo Claro)

| Nome | Hex | Uso |
|------|-----|-----|
| foreground | #0f172a | Texto principal (slate-900) |
| secondary-foreground | #1e293b | Texto secundário (slate-800) |
| muted-foreground | #64748b | Texto terciário (slate-500) |
| amber-600 | #d97706 | Destaques, links |
| amber-700 | #b45309 | Texto gradiente |

### Bordas (Modo Claro)

| Classe Tailwind | Uso |
|-----------------|-----|
| border-border | Bordas padrão (slate-200) |
| border-border/50 | Bordas sutis |
| border-amber-500/20 | Bordas de destaque |

---

## Cores de Status

| Status | Modo Escuro | Modo Claro |
|--------|-------------|------------|
| Sucesso | bg-green-500/20 text-green-400 | bg-green-100 text-green-700 |
| Atenção | bg-yellow-500/20 text-yellow-400 | bg-yellow-100 text-yellow-700 |
| Erro | bg-red-500/20 text-red-400 | bg-red-100 text-red-700 |
| Info | bg-blue-500/20 text-blue-400 | bg-blue-100 text-blue-700 |

### Exemplo de Badge Responsivo ao Tema
```tsx
// Usando classes temáticas (automático)
<span className="status-badge-success">Ativo</span>

// Ou manualmente
<span className="px-2.5 py-0.5 rounded-full text-xs font-medium
  bg-green-500/20 text-green-400 border border-green-500/30
  dark:bg-green-500/20 dark:text-green-400">
  Ativo
</span>
```

---

## Sombras

### Modo Escuro
| Nome | CSS | Uso |
|------|-----|-----|
| Sombra Âmbar | `0 0 40px -10px rgba(245, 158, 11, 0.3)` | Cards destacados |
| Sombra Âmbar Intensa | `0 25px 50px -12px rgba(245, 158, 11, 0.25)` | CTAs |

### Modo Claro
| Nome | CSS | Uso |
|------|-----|-----|
| Sombra Suave | `shadow-lg shadow-slate-200/50` | Cards |
| Sombra Âmbar | `0 0 30px -10px rgba(245, 158, 11, 0.2)` | Destaques |

---

## Efeitos de Glassmorphism

### Modo Escuro
```css
background: rgba(15, 23, 42, 0.8);  /* slate-900/80 */
backdrop-filter: blur(24px);
border: 1px solid rgba(255, 255, 255, 0.05);
```

### Modo Claro
```css
background: rgba(255, 255, 255, 0.8);
backdrop-filter: blur(24px);
border: 1px solid rgba(0, 0, 0, 0.05);
```

### Tailwind Responsivo
```tsx
// Adapta automaticamente ao tema
className="bg-card/80 backdrop-blur-xl border-border/50 dark:bg-slate-900/80 dark:border-white/5"
```

---

## CSS Variables (globals.css)

### Modo Escuro (:root)
```css
:root {
  --background: 222 47% 5%;        /* slate-950 */
  --foreground: 210 40% 98%;       /* branco suave */
  --card: 222 47% 8%;              /* slate-900 */
  --primary: 38 92% 50%;           /* amber-500 */
  --border: 220 20% 18%;           /* slate-800 */
}
```

### Modo Claro (.light)
```css
.light {
  --background: 210 20% 98%;       /* off-white */
  --foreground: 222 47% 11%;       /* slate-900 */
  --card: 0 0% 100%;               /* branco puro */
  --primary: 38 92% 50%;           /* amber-500 */
  --border: 214 20% 88%;           /* slate-200 */
}
```

---

## Regras de Uso

### ✅ FAZER
- Usar âmbar para CTAs e elementos interativos
- Usar classes temáticas (`text-foreground`, `bg-card`)
- Usar prefixo `dark:` para estilos específicos do modo escuro
- Testar ambos os temas antes de finalizar

### ❌ NÃO FAZER
- Usar cores hardcoded (`text-white`, `bg-slate-950`) sem fallback
- Ignorar contraste em um dos temas
- Usar sombras escuras no modo claro sem adaptação
- Esquecer de testar badges e status nos dois temas

---

*Paleta de Cores INTEIA v1.1 - Janeiro 2026 - Suporte a Tema Claro*
