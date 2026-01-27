# Hooks - React Custom Hooks

> **GPS IA**: Hooks customizados para logica reutilizavel

## Arquivos

| Arquivo | Hook | Funcao |
|---------|------|--------|
| [useEleitores.ts](useEleitores.ts) | `useEleitores` | Carregar e filtrar eleitores |
| [useGestores.ts](useGestores.ts) | `useGestores` | Entrevistas com gestores |
| [useParlamentares.ts](useParlamentares.ts) | `useParlamentares` | Lista de parlamentares |
| [useAnaliseInteligente.ts](useAnaliseInteligente.ts) | `useAnaliseInteligente` | Analise IA dos resultados |
| [useFilterNavigation.ts](useFilterNavigation.ts) | `useFilterNavigation` | Navegacao com filtros na URL |
| [useDadosAbertos.ts](useDadosAbertos.ts) | `useDadosAbertos` | Dados de APIs externas |
| [useDivergencias.ts](useDivergencias.ts) | `useDivergencias` | Detectar divergencias |

## Exemplo de Uso

```typescript
import { useEleitores } from '@/hooks/useEleitores';

function MeuComponente() {
  const { 
    eleitores, 
    carregando, 
    erro, 
    filtrar, 
    recarregar 
  } = useEleitores();
  
  // ...
}
```

## useFilterNavigation

Sincroniza filtros com query params da URL:

```typescript
const { filtros, setFiltro, limparFiltros } = useFilterNavigation();

// URL: /eleitores?genero=masculino&regiao=Taguatinga
// filtros = { genero: 'masculino', regiao: 'Taguatinga' }
```
