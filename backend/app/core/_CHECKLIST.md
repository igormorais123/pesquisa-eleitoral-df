# _CHECKLIST.md - Backend Core

**Ultima atualizacao**: Janeiro 2026

---

## Critico

- [ ] Corrigir tipagem `datetime` em `database.py:166`
- [ ] Adicionar verificacao None em `rls_middleware.py`

## Importante

- [ ] Implementar rotacao de SECRET_KEY
- [ ] Adicionar configuracao de CORS por ambiente
- [ ] Melhorar logging estruturado

## Seguranca

- [ ] Implementar rate limiting global
- [ ] Adicionar blacklist de tokens JWT
- [ ] Configurar headers de seguranca (HSTS, CSP)

## Melhorias Futuras

- [ ] Cache de configuracoes
- [ ] Health check do pool de conexoes
- [ ] Metricas Prometheus

## Concluido

- [x] Configuracao Pydantic Settings
- [x] Database pool async
- [x] RLS middleware basico
- [x] JWT encode/decode
- [x] Password hashing bcrypt

## Notas

- `seguranca.py` contem funcoes de hash e JWT
- `config.py` carrega todas as variaveis de ambiente
- `database.py` gerencia pool de conexoes
