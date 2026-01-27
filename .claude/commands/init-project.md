# Init Project: Inicializar Ambiente de Desenvolvimento

## Objetivo

Configurar o ambiente completo para desenvolvimento do projeto Pesquisa Eleitoral DF.

## Processo

### 1. Verificar Requisitos

```bash
# Node.js (>= 18)
node --version

# Python (>= 3.11)
python --version

# Git
git --version

# Docker (opcional)
docker --version
```

### 2. Clonar e Configurar

```bash
# Se não clonou ainda
git clone <repo>
cd pesquisa-eleitoral-df

# Verificar branch
git branch --show-current
```

### 3. Backend Setup

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente (Windows)
.\venv\Scripts\activate

# Ativar ambiente (Linux/Mac)
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Voltar à raiz
cd ..
```

### 4. Frontend Setup

```bash
cd frontend

# Instalar dependências
npm install

# Voltar à raiz
cd ..
```

### 5. Configurar Variáveis de Ambiente

```bash
# Copiar template
cp .env.example .env

# Editar com suas chaves
# - CLAUDE_API_KEY
# - DATABASE_URL
# - SECRET_KEY
```

### 6. Verificar Banco de Eleitores

```bash
# Verificar se existe
ls agentes/banco-eleitores-df.json

# Contar eleitores
python -c "import json; print(f'{len(json.load(open(\"agentes/banco-eleitores-df.json\")))} eleitores')"
```

### 7. Iniciar Serviços

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 8. Verificar Funcionamento

```bash
# Backend health
curl http://localhost:8000/health

# Frontend
# Abrir http://localhost:3000

# API Docs
# Abrir http://localhost:8000/docs
```

## Pontos de Acesso

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Produção Frontend | https://inteia.com.br |
| Produção Backend | https://api.inteia.com.br |

## Troubleshooting

### Erro de porta em uso
```bash
# Windows - encontrar processo
netstat -ano | findstr :8000
taskkill /PID <pid> /F

# Linux/Mac
lsof -i :8000
kill -9 <pid>
```

### Erro de dependências Python
```bash
pip install --upgrade pip
pip install -r requirements.txt --no-cache-dir
```

### Erro de dependências Node
```bash
rm -rf node_modules package-lock.json
npm install
```
