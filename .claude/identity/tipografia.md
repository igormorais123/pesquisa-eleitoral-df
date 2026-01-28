# Tipografia INTEIA

## Fonte Principal

**Inter** - Uma fonte sans-serif moderna, legível e versátil.

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

### Importação
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Escala de Tamanhos

| Nome | Tamanho | Line Height | Uso |
|------|---------|-------------|-----|
| text-xs | 12px | 16px | Captions, badges pequenos |
| text-sm | 14px | 20px | Labels, texto auxiliar |
| text-base | 16px | 24px | Corpo de texto padrão |
| text-lg | 18px | 28px | Texto destacado |
| text-xl | 20px | 28px | Subtítulos pequenos |
| text-2xl | 24px | 32px | Subtítulos |
| text-3xl | 30px | 36px | Títulos de página |
| text-4xl | 36px | 40px | Títulos de seção |
| text-5xl | 48px | 48px | Hero mobile |
| text-6xl | 60px | 60px | Hero tablet |
| text-7xl | 72px | 72px | Hero desktop |
| text-8xl | 96px | 96px | Hero extra grande |

## Pesos

| Nome | Peso | Uso |
|------|------|-----|
| font-normal | 400 | Corpo de texto |
| font-medium | 500 | Labels, navegação |
| font-semibold | 600 | Subtítulos, botões |
| font-bold | 700 | Títulos, CTAs |

## Hierarquia de Títulos

### H1 - Hero Title
```tsx
<h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
  Título Principal
</h1>
```

### H2 - Section Title
```tsx
<h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
  Título de Seção
</h2>
```

### H3 - Card Title
```tsx
<h3 className="text-2xl font-bold">
  Título do Card
</h3>
```

### H4 - Subtitle
```tsx
<h4 className="text-lg font-semibold">
  Subtítulo
</h4>
```

## Estilos de Texto

### Texto com Gradiente (Destaque)
```tsx
<span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
  Texto Destacado
</span>
```

### Texto Secundário
```tsx
<p className="text-white/60 leading-relaxed">
  Texto secundário com boa legibilidade.
</p>
```

### Texto Sutil
```tsx
<p className="text-white/40 text-sm">
  Texto auxiliar muito sutil.
</p>
```

### Label de Seção
```tsx
<p className="text-amber-400 text-lg mb-4 font-medium">
  Label da Seção
</p>
```

### Caption/Micro
```tsx
<span className="text-[10px] text-white/40 uppercase tracking-wider">
  Caption
</span>
```

## Letter Spacing

| Classe | Valor | Uso |
|--------|-------|-----|
| tracking-tighter | -0.05em | Headlines impactantes |
| tracking-tight | -0.025em | Títulos |
| tracking-normal | 0 | Texto padrão |
| tracking-wide | 0.025em | Botões |
| tracking-wider | 0.05em | Labels uppercase |

## Line Height

| Classe | Valor | Uso |
|--------|-------|-----|
| leading-none | 1 | Números grandes |
| leading-tight | 1.25 | Títulos |
| leading-snug | 1.375 | Subtítulos |
| leading-normal | 1.5 | Texto padrão |
| leading-relaxed | 1.625 | Texto de leitura |
| leading-loose | 2 | Texto espaçado |

## Exemplos Práticos

### Página de Destaque
```tsx
<div className="text-center">
  <p className="text-amber-400 text-lg mb-4 font-medium">Subtítulo</p>
  <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
    Título<br />
    <span className="bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
      destacado.
    </span>
  </h1>
  <p className="mt-8 text-xl sm:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed">
    Descrição com texto secundário legível e espaçado.
  </p>
</div>
```

### Card de Conteúdo
```tsx
<div className="p-6">
  <h3 className="text-xl font-bold text-white mb-2">
    Título do Card
  </h3>
  <p className="text-white/50 text-sm leading-relaxed">
    Descrição do conteúdo com texto auxiliar.
  </p>
  <span className="text-[10px] text-white/30 uppercase tracking-wider mt-4 block">
    Atualizado há 2 horas
  </span>
</div>
```

### Formulário
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-white/70">
    Label do Campo
  </label>
  <input
    className="... placeholder:text-white/30"
    placeholder="Placeholder do input"
  />
  <p className="text-xs text-white/40">
    Texto de ajuda abaixo do campo.
  </p>
</div>
```

## Regras de Uso

### ✅ FAZER
- Usar `tracking-tight` em títulos grandes
- Usar `leading-relaxed` para textos longos
- Usar opacidades de branco para hierarquia
- Usar `font-bold` para títulos, `font-medium` para labels

### ❌ NÃO FAZER
- Usar fontes serifadas
- Usar textos muito pequenos (< 10px) exceto captions
- Usar cores sólidas para textos secundários
- Usar bold em textos de corpo

---

*Tipografia INTEIA v1.0 - Janeiro 2026*
