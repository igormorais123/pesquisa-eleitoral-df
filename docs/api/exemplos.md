# Exemplos de Código

Código pronto para copiar e usar em diferentes linguagens.

---

## cURL

### Autenticação

```bash
# Login e obter token
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "admin", "senha": "admin123"}'

# Salvar token em variável
export TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario": "admin", "senha": "admin123"}' | jq -r '.access_token')

# Verificar token
curl http://localhost:8000/api/v1/auth/verificar \
  -H "Authorization: Bearer $TOKEN"
```

### Eleitores

```bash
# Listar todos (paginado)
curl "http://localhost:8000/api/v1/eleitores?pagina=1&por_pagina=20" \
  -H "Authorization: Bearer $TOKEN"

# Filtrar por idade e orientação
curl "http://localhost:8000/api/v1/eleitores?idade_min=18&idade_max=30&orientacoes=esquerda,centro-esquerda" \
  -H "Authorization: Bearer $TOKEN"

# Filtrar por região e cluster
curl "http://localhost:8000/api/v1/eleitores?regioes=Ceilandia,Samambaia&clusters=G4_baixa" \
  -H "Authorization: Bearer $TOKEN"

# Obter um eleitor específico
curl http://localhost:8000/api/v1/eleitores/el_001 \
  -H "Authorization: Bearer $TOKEN"

# Obter estatísticas
curl http://localhost:8000/api/v1/eleitores/estatisticas \
  -H "Authorization: Bearer $TOKEN"

# Obter opções de filtros
curl http://localhost:8000/api/v1/eleitores/opcoes-filtros \
  -H "Authorization: Bearer $TOKEN"
```

### Entrevistas

```bash
# Criar entrevista
curl -X POST http://localhost:8000/api/v1/entrevistas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Pesquisa Janeiro 2026",
    "tipo": "mista",
    "descricao": "Intenção de voto e satisfação",
    "perguntas": [
      {
        "id": "p1",
        "texto": "De 0 a 10, quanto você confia no governador?",
        "tipo": "escala",
        "escala_min": 0,
        "escala_max": 10,
        "obrigatoria": true
      },
      {
        "id": "p2",
        "texto": "Por que você deu essa nota?",
        "tipo": "aberta",
        "obrigatoria": false
      }
    ],
    "eleitores_ids": ["el_001", "el_002", "el_003", "el_004", "el_005"]
  }'

# Estimar custo antes de criar
curl -X POST "http://localhost:8000/api/v1/entrevistas/estimar-custo?total_perguntas=5&total_eleitores=100&proporcao_opus=0.2" \
  -H "Authorization: Bearer $TOKEN"

# Iniciar execução
curl -X POST http://localhost:8000/api/v1/entrevistas/ent_abc123/iniciar \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "limite_custo_reais": 50.0,
    "batch_size": 10,
    "delay_entre_batches_ms": 500
  }'

# Monitorar progresso
curl http://localhost:8000/api/v1/entrevistas/ent_abc123/progresso \
  -H "Authorization: Bearer $TOKEN"

# Pausar execução
curl -X POST http://localhost:8000/api/v1/entrevistas/ent_abc123/pausar \
  -H "Authorization: Bearer $TOKEN"

# Retomar execução
curl -X POST http://localhost:8000/api/v1/entrevistas/ent_abc123/retomar \
  -H "Authorization: Bearer $TOKEN"

# Obter respostas
curl http://localhost:8000/api/v1/entrevistas/ent_abc123/respostas \
  -H "Authorization: Bearer $TOKEN"
```

### Resultados

```bash
# Listar resultados
curl http://localhost:8000/api/v1/resultados \
  -H "Authorization: Bearer $TOKEN"

# Obter resultado completo
curl http://localhost:8000/api/v1/resultados/res_xyz789 \
  -H "Authorization: Bearer $TOKEN"

# Obter estatísticas
curl http://localhost:8000/api/v1/resultados/res_xyz789/estatisticas \
  -H "Authorization: Bearer $TOKEN"

# Obter análise de sentimentos
curl http://localhost:8000/api/v1/resultados/res_xyz789/sentimentos \
  -H "Authorization: Bearer $TOKEN"

# Obter mapa de calor
curl http://localhost:8000/api/v1/resultados/res_xyz789/mapa-calor \
  -H "Authorization: Bearer $TOKEN"

# Obter insights
curl http://localhost:8000/api/v1/resultados/res_xyz789/insights \
  -H "Authorization: Bearer $TOKEN"
```

---

## Python

### Cliente Básico

```python
import requests
from typing import Optional, List, Dict, Any

class PesquisaEleitoralClient:
    """Cliente Python para a API de Pesquisa Eleitoral"""

    def __init__(self, base_url: str = "http://localhost:8000/api/v1"):
        self.base_url = base_url
        self.token: Optional[str] = None

    def login(self, usuario: str, senha: str) -> Dict[str, Any]:
        """Realiza login e armazena token"""
        response = requests.post(
            f"{self.base_url}/auth/login",
            json={"usuario": usuario, "senha": senha}
        )
        response.raise_for_status()
        data = response.json()
        self.token = data["access_token"]
        return data

    @property
    def headers(self) -> Dict[str, str]:
        """Headers com autenticação"""
        if not self.token:
            raise ValueError("Não autenticado. Chame login() primeiro.")
        return {"Authorization": f"Bearer {self.token}"}

    # ==================== ELEITORES ====================

    def listar_eleitores(
        self,
        idade_min: Optional[int] = None,
        idade_max: Optional[int] = None,
        orientacoes: Optional[List[str]] = None,
        regioes: Optional[List[str]] = None,
        clusters: Optional[List[str]] = None,
        pagina: int = 1,
        por_pagina: int = 50
    ) -> Dict[str, Any]:
        """Lista eleitores com filtros"""
        params = {
            "pagina": pagina,
            "por_pagina": por_pagina
        }
        if idade_min:
            params["idade_min"] = idade_min
        if idade_max:
            params["idade_max"] = idade_max
        if orientacoes:
            params["orientacoes"] = ",".join(orientacoes)
        if regioes:
            params["regioes"] = ",".join(regioes)
        if clusters:
            params["clusters"] = ",".join(clusters)

        response = requests.get(
            f"{self.base_url}/eleitores",
            params=params,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def obter_eleitor(self, eleitor_id: str) -> Dict[str, Any]:
        """Obtém perfil completo de um eleitor"""
        response = requests.get(
            f"{self.base_url}/eleitores/{eleitor_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def estatisticas_eleitores(self) -> Dict[str, Any]:
        """Obtém estatísticas dos eleitores"""
        response = requests.get(
            f"{self.base_url}/eleitores/estatisticas",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    # ==================== ENTREVISTAS ====================

    def criar_entrevista(
        self,
        titulo: str,
        tipo: str,
        perguntas: List[Dict],
        eleitores_ids: List[str],
        descricao: Optional[str] = None
    ) -> Dict[str, Any]:
        """Cria uma nova entrevista"""
        data = {
            "titulo": titulo,
            "tipo": tipo,
            "perguntas": perguntas,
            "eleitores_ids": eleitores_ids
        }
        if descricao:
            data["descricao"] = descricao

        response = requests.post(
            f"{self.base_url}/entrevistas",
            json=data,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def iniciar_entrevista(
        self,
        entrevista_id: str,
        limite_custo: float = 50.0,
        batch_size: int = 10,
        delay_ms: int = 500
    ) -> Dict[str, Any]:
        """Inicia execução de uma entrevista"""
        response = requests.post(
            f"{self.base_url}/entrevistas/{entrevista_id}/iniciar",
            json={
                "limite_custo_reais": limite_custo,
                "batch_size": batch_size,
                "delay_entre_batches_ms": delay_ms
            },
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def progresso_entrevista(self, entrevista_id: str) -> Dict[str, Any]:
        """Obtém progresso da execução"""
        response = requests.get(
            f"{self.base_url}/entrevistas/{entrevista_id}/progresso",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def estimar_custo(
        self,
        total_perguntas: int,
        total_eleitores: int,
        proporcao_opus: float = 0.2
    ) -> Dict[str, Any]:
        """Estima custo de uma entrevista"""
        response = requests.post(
            f"{self.base_url}/entrevistas/estimar-custo",
            params={
                "total_perguntas": total_perguntas,
                "total_eleitores": total_eleitores,
                "proporcao_opus": proporcao_opus
            },
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    # ==================== RESULTADOS ====================

    def obter_resultado(self, resultado_id: str) -> Dict[str, Any]:
        """Obtém resultado completo"""
        response = requests.get(
            f"{self.base_url}/resultados/{resultado_id}",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def insights_resultado(self, resultado_id: str) -> Dict[str, Any]:
        """Obtém insights gerados"""
        response = requests.get(
            f"{self.base_url}/resultados/{resultado_id}/insights",
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()


# ==================== USO ====================

if __name__ == "__main__":
    # Criar cliente
    client = PesquisaEleitoralClient()

    # Login
    client.login("admin", "admin123")
    print("✅ Logado com sucesso")

    # Listar eleitores jovens de esquerda
    eleitores = client.listar_eleitores(
        idade_max=30,
        orientacoes=["esquerda", "centro-esquerda"],
        por_pagina=10
    )
    print(f"📊 Encontrados {eleitores['total']} eleitores")

    # Ver estatísticas
    stats = client.estatisticas_eleitores()
    print(f"📈 Total de eleitores: {stats['total']}")

    # Estimar custo de pesquisa
    custo = client.estimar_custo(
        total_perguntas=5,
        total_eleitores=100
    )
    print(f"💰 Custo estimado: R$ {custo['estimativa']['custo_minimo_brl']:.2f} - R$ {custo['estimativa']['custo_maximo_brl']:.2f}")
```

### Exemplo Completo de Pesquisa

```python
import time
from cliente import PesquisaEleitoralClient

def executar_pesquisa_completa():
    """Exemplo completo: criar, executar e analisar pesquisa"""

    client = PesquisaEleitoralClient()
    client.login("admin", "admin123")

    # 1. Selecionar eleitores
    print("🔍 Selecionando eleitores...")
    eleitores = client.listar_eleitores(
        regioes=["Ceilândia", "Taguatinga", "Samambaia"],
        clusters=["G3_media_baixa", "G4_baixa"],
        por_pagina=100
    )
    ids = [e["id"] for e in eleitores["eleitores"]]
    print(f"   Selecionados: {len(ids)} eleitores")

    # 2. Definir perguntas
    perguntas = [
        {
            "id": "intencao",
            "texto": "Se a eleição para governador fosse hoje, em quem você votaria?",
            "tipo": "multipla_escolha",
            "opcoes": [
                "Candidato A (situação)",
                "Candidato B (oposição)",
                "Candidato C (terceira via)",
                "Branco/Nulo",
                "Não sei"
            ],
            "obrigatoria": True
        },
        {
            "id": "confianca",
            "texto": "De 0 a 10, quanto você confia no atual governador?",
            "tipo": "escala",
            "escala_min": 0,
            "escala_max": 10,
            "escala_rotulos": ["Nenhuma confiança", "Total confiança"],
            "obrigatoria": True
        },
        {
            "id": "preocupacao",
            "texto": "Qual é sua maior preocupação hoje?",
            "tipo": "aberta",
            "obrigatoria": True
        }
    ]

    # 3. Estimar custo
    print("💰 Estimando custo...")
    custo = client.estimar_custo(
        total_perguntas=len(perguntas),
        total_eleitores=len(ids)
    )
    print(f"   Estimativa: R$ {custo['estimativa']['custo_minimo_brl']:.2f} - R$ {custo['estimativa']['custo_maximo_brl']:.2f}")

    # 4. Criar entrevista
    print("📝 Criando entrevista...")
    entrevista = client.criar_entrevista(
        titulo="Pesquisa Periferia - Janeiro 2026",
        tipo="mista",
        perguntas=perguntas,
        eleitores_ids=ids,
        descricao="Pesquisa em regiões de menor renda"
    )
    entrevista_id = entrevista["id"]
    print(f"   Criada: {entrevista_id}")

    # 5. Iniciar execução
    print("🚀 Iniciando execução...")
    client.iniciar_entrevista(
        entrevista_id,
        limite_custo=100.0,
        batch_size=10,
        delay_ms=500
    )

    # 6. Monitorar progresso
    print("⏳ Aguardando conclusão...")
    while True:
        progresso = client.progresso_entrevista(entrevista_id)
        status = progresso["status"]
        pct = progresso["progresso"]["percentual"]
        print(f"   {pct:.1f}% concluído ({status})")

        if status in ["concluida", "erro", "cancelada"]:
            break

        time.sleep(5)

    # 7. Analisar resultados
    if status == "concluida":
        print("✅ Pesquisa concluída!")

        resultado = client.obter_resultado(entrevista_id)
        insights = client.insights_resultado(entrevista_id)

        print("\n📊 RESULTADOS:")
        print(f"   Total de respostas: {resultado['total_respostas']}")

        print("\n🔍 INSIGHTS:")
        for insight in insights.get("insights", [])[:5]:
            print(f"   • {insight['titulo']}")
    else:
        print(f"❌ Pesquisa falhou: {status}")


if __name__ == "__main__":
    executar_pesquisa_completa()
```

---

## JavaScript/TypeScript

### Cliente TypeScript

```typescript
interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  usuario: {
    id: string;
    nome: string;
    papel: string;
  };
}

interface Eleitor {
  id: string;
  nome: string;
  idade: number;
  genero: string;
  regiao_administrativa: string;
  cluster_socioeconomico: string;
  orientacao_politica: string;
  // ... outros campos
}

interface EleitorListResponse {
  eleitores: Eleitor[];
  total: number;
  pagina: number;
  por_pagina: number;
  total_paginas: number;
}

class PesquisaEleitoralClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = "http://localhost:8000/api/v1") {
    this.baseUrl = baseUrl;
  }

  private get headers(): HeadersInit {
    if (!this.token) {
      throw new Error("Não autenticado. Chame login() primeiro.");
    }
    return {
      "Authorization": `Bearer ${this.token}`,
      "Content-Type": "application/json"
    };
  }

  async login(usuario: string, senha: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, senha })
    });

    if (!response.ok) {
      throw new Error(`Login falhou: ${response.status}`);
    }

    const data: LoginResponse = await response.json();
    this.token = data.access_token;
    return data;
  }

  // ==================== ELEITORES ====================

  async listarEleitores(params: {
    idade_min?: number;
    idade_max?: number;
    orientacoes?: string[];
    regioes?: string[];
    clusters?: string[];
    pagina?: number;
    por_pagina?: number;
  } = {}): Promise<EleitorListResponse> {
    const queryParams = new URLSearchParams();

    if (params.idade_min) queryParams.set("idade_min", params.idade_min.toString());
    if (params.idade_max) queryParams.set("idade_max", params.idade_max.toString());
    if (params.orientacoes) queryParams.set("orientacoes", params.orientacoes.join(","));
    if (params.regioes) queryParams.set("regioes", params.regioes.join(","));
    if (params.clusters) queryParams.set("clusters", params.clusters.join(","));
    if (params.pagina) queryParams.set("pagina", params.pagina.toString());
    if (params.por_pagina) queryParams.set("por_pagina", params.por_pagina.toString());

    const response = await fetch(
      `${this.baseUrl}/eleitores?${queryParams}`,
      { headers: this.headers }
    );

    if (!response.ok) {
      throw new Error(`Erro ao listar eleitores: ${response.status}`);
    }

    return response.json();
  }

  async obterEleitor(id: string): Promise<Eleitor> {
    const response = await fetch(
      `${this.baseUrl}/eleitores/${id}`,
      { headers: this.headers }
    );

    if (!response.ok) {
      throw new Error(`Eleitor não encontrado: ${id}`);
    }

    return response.json();
  }

  // ==================== ENTREVISTAS ====================

  async criarEntrevista(data: {
    titulo: string;
    tipo: "quantitativa" | "qualitativa" | "mista";
    perguntas: Array<{
      id: string;
      texto: string;
      tipo: string;
      opcoes?: string[];
      escala_min?: number;
      escala_max?: number;
      obrigatoria?: boolean;
    }>;
    eleitores_ids: string[];
    descricao?: string;
  }): Promise<any> {
    const response = await fetch(`${this.baseUrl}/entrevistas`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Erro ao criar entrevista: ${response.status}`);
    }

    return response.json();
  }

  async iniciarEntrevista(
    entrevistaId: string,
    config: {
      limite_custo_reais: number;
      batch_size: number;
      delay_entre_batches_ms: number;
    }
  ): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/entrevistas/${entrevistaId}/iniciar`,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(config)
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao iniciar entrevista: ${response.status}`);
    }

    return response.json();
  }

  async progressoEntrevista(entrevistaId: string): Promise<any> {
    const response = await fetch(
      `${this.baseUrl}/entrevistas/${entrevistaId}/progresso`,
      { headers: this.headers }
    );

    if (!response.ok) {
      throw new Error(`Erro ao obter progresso: ${response.status}`);
    }

    return response.json();
  }
}

// ==================== USO ====================

async function main() {
  const client = new PesquisaEleitoralClient();

  // Login
  await client.login("admin", "admin123");
  console.log("✅ Logado com sucesso");

  // Listar eleitores
  const eleitores = await client.listarEleitores({
    idade_max: 30,
    orientacoes: ["esquerda", "centro-esquerda"],
    por_pagina: 10
  });
  console.log(`📊 Encontrados ${eleitores.total} eleitores`);

  // Criar entrevista
  const entrevista = await client.criarEntrevista({
    titulo: "Teste JavaScript",
    tipo: "mista",
    perguntas: [
      {
        id: "p1",
        texto: "Como você avalia o governo atual?",
        tipo: "escala",
        escala_min: 0,
        escala_max: 10,
        obrigatoria: true
      }
    ],
    eleitores_ids: eleitores.eleitores.slice(0, 5).map(e => e.id)
  });
  console.log(`📝 Entrevista criada: ${entrevista.id}`);
}

main().catch(console.error);
```

---

## Dicas de Integração

### Rate Limiting

Recomendações para evitar sobrecarga:

```python
import time

# Entre requisições de leitura
time.sleep(0.1)  # 100ms

# Entre requisições de escrita
time.sleep(0.5)  # 500ms

# Ao executar entrevistas
# Use delay_entre_batches_ms >= 500
```

### Tratamento de Erros

```python
import requests

try:
    response = requests.get(url, headers=headers)
    response.raise_for_status()
except requests.exceptions.HTTPError as e:
    if e.response.status_code == 401:
        print("Token expirado, refaça login")
    elif e.response.status_code == 404:
        print("Recurso não encontrado")
    elif e.response.status_code == 422:
        print(f"Erro de validação: {e.response.json()}")
    else:
        raise
```

### Paginação

```python
def listar_todos_eleitores(client):
    """Itera por todas as páginas"""
    pagina = 1
    todos = []

    while True:
        resultado = client.listar_eleitores(pagina=pagina, por_pagina=100)
        todos.extend(resultado["eleitores"])

        if pagina >= resultado["total_paginas"]:
            break
        pagina += 1

    return todos
```

---

*Última atualização: Janeiro 2026*
