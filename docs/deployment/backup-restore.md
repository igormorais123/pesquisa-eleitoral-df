# Backup e Restore

Como proteger seus dados e recuperar em caso de problemas.

---

## O Que Fazer Backup

| Componente | Localização | Prioridade |
|------------|-------------|------------|
| **Banco de Dados** | PostgreSQL | 🔴 Crítica |
| **Eleitores** | `agentes/banco-eleitores-df.json` | 🔴 Crítica |
| **Resultados** | `resultados/` | 🟠 Alta |
| **Memórias** | `memorias/` | 🟡 Média |
| **Configurações** | `.env` | 🔴 Crítica |

---

## Backup do Banco de Dados

### Backup Manual (pg_dump)

```bash
# Backup completo
pg_dump -h localhost -U postgres -d pesquisa_eleitoral > backup_$(date +%Y%m%d_%H%M%S).sql

# Com Docker
docker exec pesquisa-eleitoral-db pg_dump -U postgres pesquisa_eleitoral > backup_$(date +%Y%m%d_%H%M%S).sql

# Comprimido
docker exec pesquisa-eleitoral-db pg_dump -U postgres pesquisa_eleitoral | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Backup Automático (Cron)

```bash
# Editar crontab
crontab -e

# Adicionar (backup diário às 3h)
0 3 * * * /home/user/pesquisa-eleitoral-df/scripts/backup.sh >> /var/log/backup-pesquisa.log 2>&1
```

**Script de backup (`scripts/backup.sh`):**

```bash
#!/bin/bash
# scripts/backup.sh

set -e

# Configurações
BACKUP_DIR="/backups/pesquisa-eleitoral"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
DB_CONTAINER="pesquisa-eleitoral-db"

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup do banco
echo "[$DATE] Iniciando backup do banco..."
docker exec $DB_CONTAINER pg_dump -U postgres pesquisa_eleitoral | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Backup dos arquivos JSON
echo "[$DATE] Backup dos arquivos JSON..."
tar -czf "$BACKUP_DIR/data_$DATE.tar.gz" -C /home/user/pesquisa-eleitoral-df agentes/ memorias/ resultados/

# Backup do .env (CUIDADO: contém chaves!)
cp /home/user/pesquisa-eleitoral-df/.env "$BACKUP_DIR/env_$DATE.bak"
chmod 600 "$BACKUP_DIR/env_$DATE.bak"

# Limpar backups antigos
echo "[$DATE] Limpando backups com mais de $RETENTION_DAYS dias..."
find $BACKUP_DIR -type f -mtime +$RETENTION_DAYS -delete

# Mostrar tamanho
echo "[$DATE] Backup concluído!"
ls -lh $BACKUP_DIR/*$DATE*

echo "[$DATE] Espaço usado em backups:"
du -sh $BACKUP_DIR
```

```bash
# Tornar executável
chmod +x scripts/backup.sh
```

---

## Restore do Banco de Dados

### Restore Manual

```bash
# Parar aplicações que usam o banco
docker compose stop backend

# Restore
psql -h localhost -U postgres -d pesquisa_eleitoral < backup_20260115.sql

# Com Docker
cat backup_20260115.sql | docker exec -i pesquisa-eleitoral-db psql -U postgres pesquisa_eleitoral

# De arquivo comprimido
gunzip -c backup_20260115.sql.gz | docker exec -i pesquisa-eleitoral-db psql -U postgres pesquisa_eleitoral

# Reiniciar aplicações
docker compose start backend
```

### Restore em Banco Limpo

Se precisar recriar do zero:

```bash
# 1. Dropar banco existente
docker exec -i pesquisa-eleitoral-db psql -U postgres -c "DROP DATABASE IF EXISTS pesquisa_eleitoral;"

# 2. Criar banco novo
docker exec -i pesquisa-eleitoral-db psql -U postgres -c "CREATE DATABASE pesquisa_eleitoral;"

# 3. Restaurar
gunzip -c backup_20260115.sql.gz | docker exec -i pesquisa-eleitoral-db psql -U postgres pesquisa_eleitoral
```

---

## Backup dos Arquivos

### Backup Manual

```bash
# Todos os dados
tar -czf dados_backup_$(date +%Y%m%d).tar.gz agentes/ memorias/ resultados/

# Apenas eleitores (mais importante)
cp agentes/banco-eleitores-df.json agentes/banco-eleitores-df.json.bak
```

### Restore de Arquivos

```bash
# Extrair backup
tar -xzf dados_backup_20260115.tar.gz

# Restaurar arquivo específico
cp backup/agentes/banco-eleitores-df.json agentes/
```

---

## Backup Completo do Sistema

### Script de Backup Completo

```bash
#!/bin/bash
# scripts/backup-completo.sh

set -e

BACKUP_DIR="/backups/pesquisa-eleitoral"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/full_backup_$DATE.tar.gz"

echo "=== Backup Completo Pesquisa Eleitoral ==="
echo "Data: $DATE"

# Criar diretório
mkdir -p $BACKUP_DIR

# Parar serviços (opcional, para consistência)
echo "Parando serviços..."
docker compose stop frontend backend

# Backup do banco
echo "Backup do banco de dados..."
docker exec pesquisa-eleitoral-db pg_dump -U postgres pesquisa_eleitoral > /tmp/db_dump.sql

# Criar tarball completo
echo "Criando arquivo de backup..."
tar -czf $BACKUP_FILE \
    -C /home/user/pesquisa-eleitoral-df \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='__pycache__' \
    --exclude='venv' \
    --exclude='.git' \
    agentes/ \
    memorias/ \
    resultados/ \
    .env \
    -C /tmp \
    db_dump.sql

# Limpar dump temporário
rm /tmp/db_dump.sql

# Reiniciar serviços
echo "Reiniciando serviços..."
docker compose start frontend backend

# Informações do backup
echo ""
echo "=== Backup Concluído ==="
echo "Arquivo: $BACKUP_FILE"
ls -lh $BACKUP_FILE
echo ""
echo "Para restaurar, use: scripts/restore-completo.sh $BACKUP_FILE"
```

### Script de Restore Completo

```bash
#!/bin/bash
# scripts/restore-completo.sh

set -e

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Uso: $0 <arquivo_backup.tar.gz>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Erro: Arquivo não encontrado: $BACKUP_FILE"
    exit 1
fi

echo "=== Restore Completo Pesquisa Eleitoral ==="
echo "Arquivo: $BACKUP_FILE"
echo ""
echo "⚠️  ATENÇÃO: Isso irá SOBRESCREVER os dados atuais!"
read -p "Continuar? (s/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Cancelado."
    exit 1
fi

# Parar serviços
echo "Parando serviços..."
docker compose stop frontend backend

# Extrair backup
echo "Extraindo backup..."
TEMP_DIR=$(mktemp -d)
tar -xzf $BACKUP_FILE -C $TEMP_DIR

# Restaurar arquivos
echo "Restaurando arquivos..."
cp -r $TEMP_DIR/agentes/* agentes/
cp -r $TEMP_DIR/memorias/* memorias/ 2>/dev/null || true
cp -r $TEMP_DIR/resultados/* resultados/ 2>/dev/null || true

# Restaurar banco
echo "Restaurando banco de dados..."
docker exec -i pesquisa-eleitoral-db psql -U postgres -c "DROP DATABASE IF EXISTS pesquisa_eleitoral;"
docker exec -i pesquisa-eleitoral-db psql -U postgres -c "CREATE DATABASE pesquisa_eleitoral;"
cat $TEMP_DIR/db_dump.sql | docker exec -i pesquisa-eleitoral-db psql -U postgres pesquisa_eleitoral

# Limpar
rm -rf $TEMP_DIR

# Reiniciar serviços
echo "Reiniciando serviços..."
docker compose start frontend backend

echo ""
echo "=== Restore Concluído ==="
echo "Verifique se tudo está funcionando:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend:  http://localhost:8000/health"
```

---

## Backup para Nuvem

### AWS S3

```bash
# Instalar AWS CLI
pip install awscli

# Configurar
aws configure

# Upload
aws s3 cp backup_20260115.tar.gz s3://meu-bucket/pesquisa-eleitoral/

# Download
aws s3 cp s3://meu-bucket/pesquisa-eleitoral/backup_20260115.tar.gz .

# Sync automático
aws s3 sync /backups/pesquisa-eleitoral s3://meu-bucket/pesquisa-eleitoral/
```

### Google Cloud Storage

```bash
# Instalar gsutil
pip install gsutil

# Autenticar
gcloud auth login

# Upload
gsutil cp backup_20260115.tar.gz gs://meu-bucket/pesquisa-eleitoral/

# Sync
gsutil rsync -r /backups/pesquisa-eleitoral gs://meu-bucket/pesquisa-eleitoral/
```

### Backblaze B2 (Mais barato)

```bash
# Instalar
pip install b2

# Autenticar
b2 authorize-account <applicationKeyId> <applicationKey>

# Upload
b2 upload-file meu-bucket backup_20260115.tar.gz backups/pesquisa-eleitoral/

# Sync
b2 sync /backups/pesquisa-eleitoral b2://meu-bucket/pesquisa-eleitoral/
```

---

## Estratégia de Backup Recomendada

### Desenvolvimento

| Frequência | O Que | Retenção |
|------------|-------|----------|
| Sob demanda | Banco + arquivos | Últimos 3 |

### Produção

| Frequência | O Que | Retenção |
|------------|-------|----------|
| Diário (3h) | Banco + arquivos | 30 dias |
| Semanal (dom) | Backup completo | 90 dias |
| Mensal (dia 1) | Backup completo | 1 ano |

### Exemplo de Crontab Produção

```cron
# Backup diário às 3h
0 3 * * * /opt/pesquisa-eleitoral/scripts/backup.sh

# Backup semanal aos domingos às 4h
0 4 * * 0 /opt/pesquisa-eleitoral/scripts/backup-completo.sh

# Upload para nuvem às 5h
0 5 * * * aws s3 sync /backups/pesquisa-eleitoral s3://meu-bucket/pesquisa-eleitoral/
```

---

## Verificação de Integridade

### Testar Backup

```bash
# Extrair em diretório temporário
mkdir /tmp/teste-restore
tar -xzf backup_20260115.tar.gz -C /tmp/teste-restore

# Verificar arquivos
ls -la /tmp/teste-restore/

# Verificar JSON válido
python -m json.tool /tmp/teste-restore/agentes/banco-eleitores-df.json > /dev/null && echo "JSON OK"

# Verificar SQL válido
head -20 /tmp/teste-restore/db_dump.sql

# Limpar
rm -rf /tmp/teste-restore
```

### Checksum

```bash
# Gerar checksum do backup
sha256sum backup_20260115.tar.gz > backup_20260115.tar.gz.sha256

# Verificar depois do download
sha256sum -c backup_20260115.tar.gz.sha256
```

---

## Disaster Recovery

### Cenário: Servidor Corrompido

1. Provisione novo servidor
2. Instale Docker e dependências
3. Clone o repositório
4. Restaure `.env` do backup
5. Restaure dados do último backup
6. Verifique funcionamento

### Cenário: Dados Corrompidos

1. Identifique quando começou o problema
2. Encontre backup anterior ao problema
3. Restaure apenas os dados afetados
4. Verifique integridade

### Cenário: Exclusão Acidental

1. Pare o sistema imediatamente
2. Não faça operações de escrita
3. Restaure do backup mais recente

---

## Monitoramento de Backups

### Alertas

Configure alertas para:
- [ ] Backup não executou
- [ ] Backup menor que esperado
- [ ] Espaço em disco baixo
- [ ] Falha no upload para nuvem

### Script de Verificação

```bash
#!/bin/bash
# scripts/verificar-backup.sh

BACKUP_DIR="/backups/pesquisa-eleitoral"
MAX_AGE_HOURS=26  # Alertar se backup > 26h

# Verificar se existe backup recente
ULTIMO_BACKUP=$(ls -t $BACKUP_DIR/db_*.sql.gz 2>/dev/null | head -1)

if [ -z "$ULTIMO_BACKUP" ]; then
    echo "ALERTA: Nenhum backup encontrado!"
    exit 1
fi

# Verificar idade
IDADE_SEGUNDOS=$(($(date +%s) - $(stat -c %Y "$ULTIMO_BACKUP")))
IDADE_HORAS=$((IDADE_SEGUNDOS / 3600))

if [ $IDADE_HORAS -gt $MAX_AGE_HOURS ]; then
    echo "ALERTA: Último backup tem $IDADE_HORAS horas!"
    exit 1
fi

# Verificar tamanho mínimo (100KB)
TAMANHO=$(stat -c %s "$ULTIMO_BACKUP")
if [ $TAMANHO -lt 102400 ]; then
    echo "ALERTA: Backup muito pequeno ($TAMANHO bytes)"
    exit 1
fi

echo "OK: Último backup: $ULTIMO_BACKUP ($IDADE_HORAS horas atrás)"
```

---

*Última atualização: Janeiro 2026*
