"""
Configuracao do Celery para o sistema de pesquisa eleitoral.

Define a instancia do Celery com broker Redis, configuracoes de
serializacao, e agendamento periodico (beat schedule) para tarefas
automaticas como briefing diario e relatorio semanal.
"""

import logging

from celery import Celery
from celery.schedules import crontab

from app.core.config import configuracoes

logger = logging.getLogger(__name__)

# Instancia principal do Celery
celery_app = Celery(
    "app.tarefas",
    broker=configuracoes.REDIS_URL,
    backend=configuracoes.REDIS_URL,
)

# Configuracoes gerais do Celery
celery_app.conf.update(
    # Serializacao
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    # Timezone para agendamento (horario de Brasilia)
    timezone="America/Sao_Paulo",
    enable_utc=True,
    # Configuracoes de resultado
    result_expires=3600,  # Resultados expiram em 1 hora
    # Configuracoes de worker
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100,  # Reinicia worker apos 100 tarefas (previne vazamento de memoria)
    # Configuracoes de retry
    task_acks_late=True,  # Confirma tarefa somente apos conclusao
    task_reject_on_worker_lost=True,  # Rejeita tarefa se worker cair
    # Descoberta automatica de tarefas nos modulos do pacote
    include=[
        "app.tarefas.agente_tarefas",
        "app.tarefas.relatorio_tarefas",
        "app.tarefas.briefing_tarefas",
    ],
)

# Agendamento periodico (beat schedule)
celery_app.conf.beat_schedule = {
    # Briefing diario as 6h da manha (horario de Brasilia)
    "briefing-diario-6h": {
        "task": "app.tarefas.briefing_tarefas.gerar_briefing_diario",
        "schedule": crontab(hour=6, minute=0),
        "options": {"queue": "briefing"},
    },
    # Relatorio semanal toda segunda-feira as 8h da manha
    "relatorio-semanal-segunda-8h": {
        "task": "app.tarefas.relatorio_tarefas.gerar_relatorio_semanal",
        "schedule": crontab(hour=8, minute=0, day_of_week=1),
        "options": {"queue": "relatorios"},
    },
}

logger.info("Celery configurado com broker: %s", configuracoes.REDIS_URL)
