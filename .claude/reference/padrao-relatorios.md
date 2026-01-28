# Padrão de Relatórios INTEIA

> Referência para criação de relatórios executivos para clientes nível governador/decisor.

## Estrutura Obrigatória

### 1. Header
- Logo INTEIA
- Botão **Imprimir** (window.print())
- Botão **Tema** (toggle claro/escuro)
- Badge **Confidencial**

### 2. Título
- Nome do relatório
- Data | Tipo | Amostra
- Fonte dos dados (institutos, período)

### 3. Conclusão (Box destacado)
- Frase principal em **negrito** com cor destaque
- Linguagem direta, sem jargão técnico
- Escrito para pessoa leiga (nível governador)

### 4. KPIs (3 cards)
- Números grandes e chamativos
- Labels curtos explicando o significado
- Cores: laranja (alerta), amarelo (atenção), verde (positivo)

### 5. Gráfico Principal
- UM gráfico que resume todo o relatório
- Título explicativo ("Quanto mais X, mais Y")
- Insight abaixo explicando o que significa

### 6. Recomendações (Grid 2x2)
- 4 ações concretas
- Título + descrição curta
- Border-left colorida indicando prioridade

### 7. Actions (na tela, não na impressão)
- CTA "Converse com Helena" (IA Estratégica Avançada)
- Links para relatórios relacionados
- Link para análise detalhada

### 8. Footer
- INTEIA - Inteligência Estratégica
- Contato | Site
- Copyright

---

## Regras de Impressão

### OBRIGATÓRIO: 1 página A4
- Margem: 8mm
- Font-size: 7.5pt para body
- Gráfico: altura 38mm
- Esconder: botões e seção de actions

### CSS Print
```css
@media print {
    @page { size: A4 portrait; margin: 8mm; }
    html, body {
        width: 210mm;
        height: 297mm;
        max-height: 297mm;
        overflow: hidden;
        font-size: 7.5pt;
    }
    .btn, .actions { display: none !important; }
    .chart-container { height: 38mm !important; }
}
```

---

## Linguagem

### Evitar
- Termos técnicos (correlação, volatilidade, margem de erro)
- Jargão político (voto defensivo, swing voter)
- Frases longas e complexas
- Clichês ("é importante ressaltar", "vale destacar")

### Usar
- Linguagem direta ("Você lidera", "Seus números sobem")
- Comparações simples ("dois em cada três")
- Verbos de ação ("Faça", "Monitore", "Aja")
- Frases curtas

---

## Helena - IA Estratégica Avançada

Nome oficial da IA de análise:
- **Helena** - IA Estratégica Avançada
- Cientista Política | Sistema INTEIA

### Comportamento da Helena

**Respostas:**
- NUNCA em markdown - linguagem natural conversacional
- Máximo 3 parágrafos por resposta
- Objetiva e direta
- Fala com uma pessoa, não escreve documento

**Capacidades internas (backend):**
- Rodar Python para análises
- Usar skills do projeto
- Navegar pelo projeto e sistema eleitoral
- Gerar e mostrar gráficos nas respostas
- Rodar pesquisas com eleitores sintéticos
- Sandbox para execução de código

**Exemplo de resposta:**
```
Olha, os números mostram que sua base ainda é muito dependente do antipetismo.
Quando testamos cenários com candidatos "de fora da política", 57% dos seus
eleitores consideram trocar. Isso não é pouco.

[GRÁFICO: Vulnerabilidade por perfil de eleitor]

O que você precisa fazer é dar motivos próprios para votarem em você.
Entregas concretas que a pessoa veja no dia a dia dela.
```

CTA padrão:
```html
<h3>Converse com Helena</h3>
<p>IA Estratégica Avançada - tire dúvidas sobre os dados</p>
<a href="index.html#chat">Falar com Helena</a>
```

---

## Cores

```css
--amber: #d69e2e;        /* Principal INTEIA */
--amber-dark: #b7791f;   /* Gradientes */
--orange-dark: #c2410c;  /* Alertas, bordas destaque */
--success: #22c55e;      /* Positivo */
--warning: #eab308;      /* Atenção */
```

---

## Checklist de Novo Relatório

- [ ] Cabe em 1 página A4 na impressão
- [ ] Tem botão Imprimir e Tema
- [ ] Conclusão no topo em linguagem simples
- [ ] 3 KPIs com números grandes
- [ ] 1 gráfico resumo com insight
- [ ] 4 recomendações acionáveis
- [ ] CTA para Helena
- [ ] Links para relatórios relacionados
- [ ] Badge Confidencial
- [ ] Footer com contato INTEIA
