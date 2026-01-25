-- Script para criar as tabelas PODC no banco de dados
-- Execute este script diretamente no PostgreSQL do Render

-- Tabela principal de pesquisas PODC
CREATE TABLE IF NOT EXISTS pesquisas_podc (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id VARCHAR(36) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    total_gestores INTEGER NOT NULL DEFAULT 0,
    total_respostas INTEGER NOT NULL DEFAULT 0,
    perguntas JSONB,
    gestores_ids JSONB,
    custo_total FLOAT NOT NULL DEFAULT 0.0,
    tokens_total INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP,
    iniciado_em TIMESTAMP,
    finalizado_em TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_pesquisas_podc_usuario_id ON pesquisas_podc(usuario_id);
CREATE INDEX IF NOT EXISTS ix_pesquisas_podc_status ON pesquisas_podc(status);
CREATE INDEX IF NOT EXISTS ix_pesquisas_podc_criado_em ON pesquisas_podc(criado_em);

-- Tabela de respostas PODC
CREATE TABLE IF NOT EXISTS respostas_podc (
    id VARCHAR(36) PRIMARY KEY,
    pesquisa_id VARCHAR(36) NOT NULL REFERENCES pesquisas_podc(id) ON DELETE CASCADE,
    -- Informacoes do gestor
    gestor_id VARCHAR(36) NOT NULL,
    gestor_nome VARCHAR(255) NOT NULL,
    gestor_setor VARCHAR(20) NOT NULL,
    gestor_nivel VARCHAR(20) NOT NULL,
    gestor_cargo VARCHAR(255),
    gestor_instituicao VARCHAR(255),
    -- Distribuicao PODC (percentuais)
    podc_planejar FLOAT,
    podc_organizar FLOAT,
    podc_dirigir FLOAT,
    podc_controlar FLOAT,
    -- Distribuicao PODC Ideal
    podc_ideal_planejar FLOAT,
    podc_ideal_organizar FLOAT,
    podc_ideal_dirigir FLOAT,
    podc_ideal_controlar FLOAT,
    -- Horas semanais
    horas_total FLOAT,
    horas_planejar FLOAT,
    horas_organizar FLOAT,
    horas_dirigir FLOAT,
    horas_controlar FLOAT,
    -- IAD
    iad FLOAT,
    iad_classificacao VARCHAR(50),
    -- Dados adicionais (JSON)
    ranking_importancia JSONB,
    fatores_limitantes JSONB,
    justificativa TEXT,
    frequencia_atividades JSONB,
    respostas_perguntas JSONB,
    resposta_bruta TEXT,
    -- Metricas
    tokens_input INTEGER NOT NULL DEFAULT 0,
    tokens_output INTEGER NOT NULL DEFAULT 0,
    custo_reais FLOAT NOT NULL DEFAULT 0.0,
    -- Status e timestamps
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    erro TEXT,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    processado_em TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_respostas_podc_pesquisa_id ON respostas_podc(pesquisa_id);
CREATE INDEX IF NOT EXISTS ix_respostas_podc_gestor_id ON respostas_podc(gestor_id);
CREATE INDEX IF NOT EXISTS ix_respostas_podc_gestor_setor ON respostas_podc(gestor_setor);
CREATE INDEX IF NOT EXISTS ix_respostas_podc_gestor_nivel ON respostas_podc(gestor_nivel);
CREATE INDEX IF NOT EXISTS ix_respostas_podc_criado_em ON respostas_podc(criado_em);
CREATE UNIQUE INDEX IF NOT EXISTS ix_respostas_podc_pesquisa_gestor ON respostas_podc(pesquisa_id, gestor_id);

-- Tabela de estatisticas agregadas PODC
CREATE TABLE IF NOT EXISTS estatisticas_podc (
    id VARCHAR(36) PRIMARY KEY,
    pesquisa_id VARCHAR(36) NOT NULL REFERENCES pesquisas_podc(id) ON DELETE CASCADE,
    grupo_tipo VARCHAR(20) NOT NULL,
    grupo_valor VARCHAR(50),
    total_respostas INTEGER NOT NULL DEFAULT 0,
    -- Medias PODC
    media_planejar FLOAT,
    media_organizar FLOAT,
    media_dirigir FLOAT,
    media_controlar FLOAT,
    -- Desvio padrao PODC
    dp_planejar FLOAT,
    dp_organizar FLOAT,
    dp_dirigir FLOAT,
    dp_controlar FLOAT,
    -- IAD agregado
    media_iad FLOAT,
    dp_iad FLOAT,
    -- Horas
    media_horas_total FLOAT,
    calculado_em TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_estatisticas_podc_pesquisa_id ON estatisticas_podc(pesquisa_id);
CREATE INDEX IF NOT EXISTS ix_estatisticas_podc_grupo ON estatisticas_podc(grupo_tipo, grupo_valor);

-- Inserir na tabela de versoes do alembic
INSERT INTO alembic_version (version_num) VALUES ('20260118_001')
ON CONFLICT DO NOTHING;
