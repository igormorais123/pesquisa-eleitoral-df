# Layouts INTEIA

## Estrutura Base

### Layout de Aplicação (Dashboard)
```tsx
<div className="min-h-screen bg-slate-950">
  {/* Efeitos de fundo */}
  <div className="fixed inset-0 bg-gradient-to-b from-amber-900/5 via-slate-950 to-slate-950 pointer-events-none" />
  <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-amber-600/5 to-amber-500/5 rounded-full blur-[200px] pointer-events-none" />

  {/* Sidebar - Desktop */}
  <Sidebar />

  {/* Área Principal */}
  <div className="relative lg:ml-64 transition-all duration-300">
    {/* Header */}
    <Header />

    {/* Conteúdo */}
    <main className="relative p-4 sm:p-6 min-h-[calc(100vh-4rem)] pb-20 lg:pb-6">
      {children}
    </main>

    {/* Footer */}
    <Footer />
  </div>

  {/* Mobile Nav */}
  <MobileNav />
</div>
```

### Layout de Landing Page
```tsx
<div className="bg-slate-950 text-white">
  {/* Header Fixo */}
  <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <Logo />
      <nav>...</nav>
      <CTAButton />
    </div>
  </header>

  {/* Seções */}
  <section className="min-h-screen ...">Hero</section>
  <section className="py-32 px-6 ...">Conteúdo</section>

  {/* Footer */}
  <footer className="py-12 px-6 bg-slate-950 border-t border-white/5">
    ...
  </footer>
</div>
```

## Seções de Página

### Hero Section
```tsx
<section className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden pt-16">
  {/* Background Visual */}
  <div className="absolute inset-0 bg-gradient-to-b from-amber-900/10 via-slate-950 to-slate-950" />
  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-amber-600/20 to-amber-500/10 rounded-full blur-[150px]" />
  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

  {/* Conteúdo */}
  <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
    {/* Badge */}
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
      <span className="text-amber-400 text-sm font-medium">Texto do Badge</span>
    </div>

    {/* Título */}
    <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
      Linha 1<br />
      <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
        linha destacada.
      </span>
    </h1>

    {/* Descrição */}
    <p className="mt-8 text-xl sm:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed">
      Descrição do produto ou serviço.
    </p>

    {/* CTAs */}
    <div className="mt-12 flex flex-wrap justify-center gap-4">
      <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 ...">
        CTA Principal
      </button>
      <button className="px-8 py-4 bg-white/5 ...">
        CTA Secundário
      </button>
    </div>
  </div>
</section>
```

### Content Section
```tsx
<section id="secao" className="py-32 px-6 bg-slate-950">
  <div className="max-w-6xl mx-auto">
    {/* Header da Seção */}
    <div className="text-center mb-20">
      <p className="text-amber-400 text-lg mb-4 font-medium">Label</p>
      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
        Título Principal<br />
        <span className="text-white/40">subtítulo em cinza.</span>
      </h2>
    </div>

    {/* Grid de Cards */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((item) => (
        <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 transition-colors">
          <item.icon className="w-12 h-12 text-amber-400 mb-6" />
          <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
          <p className="text-white/50 leading-relaxed">{item.desc}</p>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Two Column Section
```tsx
<section className="py-32 px-6">
  <div className="max-w-6xl mx-auto">
    <div className="grid lg:grid-cols-2 gap-16 items-center">
      {/* Coluna de Texto */}
      <div className="space-y-8">
        <p className="text-amber-400 text-lg font-medium">Label</p>
        <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
          Título<br />
          <span className="text-white/40">subtítulo.</span>
        </h2>
        <p className="text-xl text-white/60 leading-relaxed">
          Texto descritivo...
        </p>
        <ul className="space-y-4">
          {items.map((item) => (
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-amber-400" />
              <span className="text-white/70">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Coluna Visual */}
      <div className="aspect-square rounded-3xl bg-gradient-to-br from-amber-900/20 to-amber-800/10 border border-amber-500/10 p-8">
        {/* Ilustração, imagem ou demo */}
      </div>
    </div>
  </div>
</section>
```

### Stats Section
```tsx
<section className="py-24 px-6 bg-slate-950 border-y border-white/5">
  <div className="max-w-6xl mx-auto">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat) => (
        <div className="text-center">
          <div className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-amber-400 to-amber-500 bg-clip-text text-transparent">
            {stat.valor}
          </div>
          <div className="text-lg text-white mt-2 font-medium">{stat.label}</div>
          <div className="text-sm text-white/40">{stat.sublabel}</div>
        </div>
      ))}
    </div>
  </div>
</section>
```

## Layouts de Dashboard

### Page Header
```tsx
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
  <div>
    <h1 className="text-2xl sm:text-3xl font-bold text-white">Título da Página</h1>
    <p className="text-white/50 mt-1">Descrição breve da página</p>
  </div>
  <div className="flex items-center gap-3">
    <button className="px-4 py-2 bg-white/5 text-white rounded-lg border border-white/10">
      Ação Secundária
    </button>
    <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-lg font-semibold shadow-lg shadow-amber-500/25">
      Ação Principal
    </button>
  </div>
</div>
```

### Grid de Cards de Estatística
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  {stats.map((stat) => (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
          <stat.icon className={`w-5 h-5 ${stat.color}`} />
        </div>
        <span className="text-sm text-white/50">{stat.label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{stat.valor}</p>
    </div>
  ))}
</div>
```

### Filtros
```tsx
<div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 mb-6">
  <div className="flex flex-wrap items-center gap-3">
    <span className="text-sm text-white/50">Filtros:</span>
    {filters.map((filter) => (
      <button
        className={cn(
          'px-3 py-1.5 rounded-lg text-sm transition-colors',
          filter.active
            ? 'bg-amber-500 text-slate-950 font-medium'
            : 'bg-white/5 text-white/70 hover:bg-white/10'
        )}
      >
        {filter.label}
      </button>
    ))}
  </div>
</div>
```

### Lista/Tabela Container
```tsx
<div className="bg-slate-900/80 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
  {/* Header da Tabela */}
  <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
    <h3 className="font-semibold text-white">Título da Lista</h3>
    <button className="text-sm text-amber-400 hover:underline">Ver todos</button>
  </div>

  {/* Conteúdo */}
  <div className="divide-y divide-white/5">
    {items.map((item) => (
      <div className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
        ...
      </div>
    ))}
  </div>
</div>
```

## Responsividade

### Breakpoints

| Breakpoint | Tamanho | Uso |
|------------|---------|-----|
| sm | 640px | Mobile grande |
| md | 768px | Tablet |
| lg | 1024px | Desktop pequeno (sidebar aparece) |
| xl | 1280px | Desktop |
| 2xl | 1536px | Desktop grande |

### Padrões Mobile-First

```tsx
{/* Grid que muda de 1 para 2 para 3 colunas */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

{/* Texto que aumenta em telas maiores */}
<h1 className="text-3xl sm:text-4xl lg:text-5xl">

{/* Padding que aumenta em telas maiores */}
<div className="p-4 sm:p-6 lg:p-8">

{/* Elemento que esconde/mostra por tamanho */}
<div className="hidden lg:block">  {/* Só desktop */}
<div className="lg:hidden">        {/* Só mobile/tablet */}
```

---

*Layouts INTEIA v1.0 - Janeiro 2026*
