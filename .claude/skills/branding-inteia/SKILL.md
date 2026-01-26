# SKILL: Branding INTEIA

> **Propósito**: Definir padrões visuais, cores, logo e estética do projeto INTEIA/Pesquisa Eleitoral DF para manter consistência em todas as implementações.

---

## IDENTIDADE VISUAL

### Marca INTEIA

| Elemento | Valor |
|----------|-------|
| **Nome** | INTEIA |
| **Significado** | Instituto de Inteligência Artificial |
| **Tagline** | "Instituto de Inteligencia Artificial" |
| **Autor** | Dr. Igor Morais Vasconcelos PhD |

### Logo (Componente React)

**Arquivo**: `frontend/src/components/branding/InteiaLogo.tsx`

```tsx
// Uso básico
<InteiaLogo size="md" variant="full" />

// Variantes disponíveis
variant: "full" | "icon" | "text"
size: "xs" | "sm" | "md" | "lg" | "xl"
showTagline: boolean
```

### Ícone da Marca

```
Quadrado com gradiente âmbar
Texto: "IA" centralizado em branco
Fundo: from-amber-500 to-amber-600
Sombra: shadow-amber-500/25
```

---

## PALETA DE CORES

### Cores Primárias (HSL)

| Nome | HSL | Hex | Uso |
|------|-----|-----|-----|
| **Primary** | 217 91% 60% | #3b9eff | Botões, links, destaques |
| **Background** | 222 47% 11% | #1a1f35 | Fundo principal (dark) |
| **Foreground** | 210 40% 98% | #f2f8ff | Texto principal |
| **Secondary** | 217 33% 17% | #1e3a4f | Elementos secundários |
| **Accent** | 217 33% 17% | #1e3a4f | Hover, foco |
| **Destructive** | 0 84% 60% | #ff4d4d | Erros, exclusão |
| **Muted** | 215 20% 65% | #9db0c9 | Texto secundário |

### Cor da Marca (Âmbar)

| Nome | Tailwind | Hex | Uso |
|------|----------|-----|-----|
| **Amber-500** | amber-500 | #f59e0b | Logo "IA", destaques |
| **Amber-600** | amber-600 | #d97706 | Gradiente logo |

### Gradientes

```css
/* Primário (Azul → Roxo) */
--gradient-primary: linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(271 91% 65%) 100%);

/* Sucesso (Verde → Ciano) */
--gradient-success: linear-gradient(135deg, hsl(142 71% 45%) 0%, hsl(168 76% 42%) 100%);

/* Aviso (Amarelo → Laranja) */
--gradient-warning: linear-gradient(135deg, hsl(38 92% 50%) 0%, hsl(25 95% 53%) 100%);

/* Perigo (Vermelho → Rosa) */
--gradient-danger: linear-gradient(135deg, hsl(0 84% 60%) 0%, hsl(339 90% 51%) 100%);
```

### Cores Semânticas (Dados)

#### Orientação Política
```javascript
esquerda: '#ef4444'        // Vermelho
'centro-esquerda': '#f97316' // Laranja
centro: '#a855f7'          // Roxo
'centro-direita': '#3b82f6' // Azul
direita: '#1d4ed8'         // Azul escuro
```

#### Gênero
```javascript
masculino: '#3b82f6'       // Azul
feminino: '#ec4899'        // Rosa
```

#### Cluster Socioeconômico
```javascript
alta: '#22c55e'            // Verde
'media-alta': '#84cc16'    // Verde-amarelo
'media-baixa': '#eab308'   // Amarelo
baixa: '#f97316'           // Laranja
```

---

## TIPOGRAFIA

### Fonte Principal

| Propriedade | Valor |
|-------------|-------|
| **Family** | Inter (Google Fonts) |
| **Subset** | Latin |
| **Features** | `"rlig" 1, "calt" 1` |

### Escala de Tamanhos

```
xs: 0.75rem (12px)
sm: 0.875rem (14px)
base: 1rem (16px)
lg: 1.125rem (18px)
xl: 1.25rem (20px)
2xl: 1.5rem (24px)
3xl: 1.875rem (30px)
```

---

## COMPONENTES UI

### Bordas

| Tamanho | Valor |
|---------|-------|
| **lg** | 0.75rem (12px) |
| **md** | 0.625rem (10px) |
| **sm** | 0.5rem (8px) |

### Sombras

```css
/* Sombra com cor primária */
.shadow-primary-glow {
  box-shadow: 0 0 20px rgba(59, 158, 255, 0.3);
}

/* Sombra âmbar (logo) */
.shadow-amber {
  box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.25);
}
```

### Classes Utilitárias

| Classe | Efeito |
|--------|--------|
| `.glass-card` | Card com glassmorphism |
| `.bg-gradient-subtle` | Fundo gradiente sutil |
| `.btn-glow` | Botão com brilho hover |
| `.text-gradient` | Texto com gradiente |
| `.shimmer` | Efeito carregamento |

---

## TEMAS

### Modo Escuro (Padrão)

```css
:root {
  --background: 222 47% 11%;
  --foreground: 210 40% 98%;
  --primary: 217 91% 60%;
}
```

### Modo Claro

```css
.light {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --primary: 217 91% 60%;
}
```

### Alternância de Tema

```typescript
import { useThemeStore } from '@/stores/theme-store'

const { theme, toggleTheme } = useThemeStore()
// theme: 'light' | 'dark'
```

---

## REGRAS DE IMPLEMENTAÇÃO

### Ao Criar Novos Componentes

1. **Usar variáveis CSS** - Nunca cores hardcoded
   ```css
   /* Correto */
   color: hsl(var(--primary));

   /* Errado */
   color: #3b9eff;
   ```

2. **Seguir escala de tamanhos** - Usar classes Tailwind
   ```jsx
   // Correto
   <div className="rounded-lg p-4">

   // Errado
   <div style={{ borderRadius: '12px', padding: '16px' }}>
   ```

3. **Manter consistência da marca**
   - Logo sempre com gradiente âmbar
   - "IA" sempre destacado em amber-500
   - Usar InteiaLogo component, nunca recriar

4. **Respeitar modo claro/escuro**
   - Testar em ambos os modos
   - Usar `dark:` prefix quando necessário

---

## ARQUIVOS DE REFERÊNCIA

| Arquivo | Conteúdo |
|---------|----------|
| `frontend/src/styles/globals.css` | Variáveis CSS, classes utilitárias |
| `frontend/tailwind.config.ts` | Configuração Tailwind, cores custom |
| `frontend/src/components/branding/InteiaLogo.tsx` | Componente da logo |
| `frontend/src/stores/theme-store.ts` | Store de tema |

---

## DOMÍNIOS

| Ambiente | URL |
|----------|-----|
| **Produção Frontend** | https://inteia.com.br |
| **Produção Backend** | https://api.inteia.com.br |
| **Desenvolvimento** | localhost:3000 / localhost:8000 |

---

*Skill criada em: 2026-01-25*
*Mantida por: Claude Code*
