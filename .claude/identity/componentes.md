# Componentes INTEIA

## Botões

### Botão Primário (CTA)
```tsx
<button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-full text-lg font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-xl shadow-amber-500/25 flex items-center gap-2">
  Texto do Botão
  <ArrowRight className="w-5 h-5" />
</button>
```

### Botão Secundário
```tsx
<button className="px-8 py-4 bg-white/5 text-white rounded-full text-lg font-medium hover:bg-white/10 transition-all border border-white/10">
  Texto do Botão
</button>
```

### Botão Ghost
```tsx
<button className="px-4 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
  Texto do Botão
</button>
```

### Botão Ícone
```tsx
<button className="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/60 hover:text-white">
  <Icon className="w-5 h-5" />
</button>
```

### Botão de Perigo
```tsx
<button className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors border border-red-500/20">
  Excluir
</button>
```

## Cards

### Card Glass (Padrão)
```tsx
<div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:border-amber-500/20 transition-all">
  {/* Conteúdo */}
</div>
```

### Card com Ícone
```tsx
<div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 transition-all group">
  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
    <Icon className="w-6 h-6 text-white" />
  </div>
  <h3 className="text-xl font-bold text-white mb-2">Título</h3>
  <p className="text-white/50 text-sm">Descrição do card.</p>
</div>
```

### Card de Estatística
```tsx
<div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
  <div className="flex items-center gap-3 mb-4">
    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
      <Users className="w-5 h-5 text-amber-400" />
    </div>
    <span className="text-sm text-white/50">Total de Eleitores</span>
  </div>
  <p className="text-4xl font-bold text-white">1,234</p>
  <p className="text-sm text-green-400 mt-2">+12% este mês</p>
</div>
```

### Card de Recomendação (Prioridade)
```tsx
{/* Urgente */}
<div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/10">
  <span className="text-red-400 text-sm font-medium">🔴 Urgente - Prioridade 1</span>
  <h3 className="text-xl font-bold text-white mt-2">Título da Ação</h3>
  <p className="text-white/50 mt-2">Descrição detalhada...</p>
</div>

{/* Importante */}
<div className="p-6 rounded-2xl bg-yellow-500/5 border border-yellow-500/10">
  <span className="text-yellow-400 text-sm font-medium">🟡 Importante - Prioridade 2</span>
  ...
</div>

{/* Monitorar */}
<div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
  <span className="text-blue-400 text-sm font-medium">🔵 Monitorar - Prioridade 3</span>
  ...
</div>
```

## Inputs

### Input de Texto
```tsx
<input
  type="text"
  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-amber-500 focus:ring-0 outline-none transition-colors text-white placeholder:text-white/30"
  placeholder="Digite aqui..."
/>
```

### Input com Ícone
```tsx
<div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
  <input
    type="text"
    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 focus:border-amber-500 focus:ring-0 outline-none transition-colors text-white placeholder:text-white/30"
    placeholder="Buscar..."
  />
</div>
```

### Input de Senha
```tsx
<div className="relative">
  <input
    type={mostrarSenha ? 'text' : 'password'}
    className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white/5 border border-white/10 focus:border-amber-500 focus:ring-0 outline-none transition-colors text-white placeholder:text-white/30"
    placeholder="••••••••"
  />
  <button
    onClick={() => setMostrarSenha(!mostrarSenha)}
    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-amber-400 transition-colors"
  >
    {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
  </button>
</div>
```

### Label + Input
```tsx
<div className="space-y-2">
  <label className="text-sm font-medium text-white/70">
    Nome do Campo
  </label>
  <input ... />
  {error && (
    <p className="text-sm text-red-400">{error.message}</p>
  )}
</div>
```

## Badges

### Badge INTEIA
```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
  <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
  <span className="text-amber-400 text-sm font-medium">Texto do Badge</span>
</div>
```

### Badge de Status
```tsx
{/* Sucesso */}
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
  Ativo
</span>

{/* Atenção */}
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
  Pendente
</span>

{/* Erro */}
<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
  Erro
</span>
```

## Modais

### Modal/Dialog
```tsx
{/* Overlay */}
<div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
  {/* Modal */}
  <div className="w-full max-w-md bg-slate-900 rounded-3xl p-8 border border-white/10 shadow-2xl">
    {/* Header */}
    <div className="text-center mb-8">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/20">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-white">Título do Modal</h2>
      <p className="text-white/50 mt-2">Descrição breve</p>
    </div>

    {/* Conteúdo */}
    <div className="space-y-6">
      {/* ... */}
    </div>

    {/* Ações */}
    <div className="flex gap-3 mt-8">
      <button className="flex-1 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors border border-white/10">
        Cancelar
      </button>
      <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20">
        Confirmar
      </button>
    </div>
  </div>
</div>
```

## Navegação

### Header
```tsx
<header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
  <div className="flex items-center justify-between h-16 px-6">
    {/* Logo */}
    {/* Nav */}
    {/* Actions */}
  </div>
</header>
```

### Sidebar
```tsx
<aside className="fixed left-0 top-0 h-screen bg-slate-900/80 backdrop-blur-xl border-r border-white/5 w-64">
  {/* Logo */}
  <div className="p-4 border-b border-white/10">
    <InteiaLogo />
  </div>

  {/* Menu */}
  <nav className="p-4 space-y-2">
    {menuItems.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
          ativo
            ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
            : 'text-white/60 hover:text-white hover:bg-white/5'
        )}
      >
        <item.icone className="w-5 h-5" />
        <span className="text-sm font-medium">{item.titulo}</span>
      </Link>
    ))}
  </nav>
</aside>
```

### Mobile Nav (Bottom)
```tsx
<nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/5 lg:hidden">
  <div className="flex items-center justify-around h-16">
    {items.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex flex-col items-center gap-1 py-2 px-3',
          ativo ? 'text-amber-400' : 'text-white/50'
        )}
      >
        <item.icone className="w-5 h-5" />
        <span className="text-[10px] font-medium">{item.titulo}</span>
      </Link>
    ))}
  </div>
</nav>
```

## Tabelas

### Tabela Básica
```tsx
<div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
  <table className="w-full">
    <thead>
      <tr className="border-b border-white/10">
        <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
          Nome
        </th>
        <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
          Status
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-white/5">
      <tr className="hover:bg-white/[0.02] transition-colors">
        <td className="px-6 py-4 text-white">Item 1</td>
        <td className="px-6 py-4">
          <span className="...">Ativo</span>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## Loading States

### Spinner
```tsx
<div className="w-8 h-8 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
```

### Skeleton
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
  <div className="h-4 bg-white/10 rounded w-1/2" />
</div>
```

### Loading Page
```tsx
<div className="min-h-screen bg-slate-950 flex items-center justify-center">
  <div className="flex flex-col items-center gap-4">
    <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
    <p className="text-white/50">Carregando...</p>
  </div>
</div>
```

---

*Componentes INTEIA v1.0 - Janeiro 2026*
