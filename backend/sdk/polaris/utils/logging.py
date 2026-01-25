# POLARIS SDK - Logging
# Sistema de logging estruturado

import logging
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional
import json


class JSONFormatter(logging.Formatter):
    """Formatter que produz logs em JSON."""

    def format(self, record: logging.LogRecord) -> str:
        log_data = {
            "timestamp": datetime.now().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }

        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        if hasattr(record, 'extra'):
            log_data.update(record.extra)

        return json.dumps(log_data, ensure_ascii=False)


class ColoredFormatter(logging.Formatter):
    """Formatter com cores para terminal."""

    COLORS = {
        'DEBUG': '\033[36m',      # Cyan
        'INFO': '\033[32m',       # Green
        'WARNING': '\033[33m',    # Yellow
        'ERROR': '\033[31m',      # Red
        'CRITICAL': '\033[35m',   # Magenta
        'RESET': '\033[0m'
    }

    def format(self, record: logging.LogRecord) -> str:
        color = self.COLORS.get(record.levelname, self.COLORS['RESET'])
        reset = self.COLORS['RESET']

        record.levelname = f"{color}{record.levelname}{reset}"

        return super().format(record)


def setup_logging(
    level: str = "INFO",
    log_file: Optional[str] = None,
    json_format: bool = False,
    colored: bool = True
) -> None:
    """
    Configura o sistema de logging.

    Args:
        level: Nível de logging (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Caminho para arquivo de log (opcional)
        json_format: Se deve usar formato JSON
        colored: Se deve usar cores no terminal
    """
    # Remover handlers existentes
    root = logging.getLogger()
    root.handlers = []

    # Configurar nível
    root.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Handler para console
    console_handler = logging.StreamHandler(sys.stdout)

    if json_format:
        console_handler.setFormatter(JSONFormatter())
    elif colored:
        console_handler.setFormatter(ColoredFormatter(
            '%(asctime)s | %(levelname)s | %(name)s | %(message)s',
            datefmt='%H:%M:%S'
        ))
    else:
        console_handler.setFormatter(logging.Formatter(
            '%(asctime)s | %(levelname)s | %(name)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        ))

    root.addHandler(console_handler)

    # Handler para arquivo (se especificado)
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setFormatter(JSONFormatter() if json_format else logging.Formatter(
            '%(asctime)s | %(levelname)s | %(name)s | %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        ))
        root.addHandler(file_handler)

    # Silenciar loggers muito verbosos
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("anthropic").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Obtém um logger configurado.

    Args:
        name: Nome do logger

    Returns:
        Logger configurado
    """
    return logging.getLogger(f"polaris.{name}")


class LogContext:
    """Contexto para adicionar informações extras aos logs."""

    def __init__(self, logger: logging.Logger, **extra):
        self.logger = logger
        self.extra = extra

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass

    def debug(self, msg: str, **kwargs):
        self.logger.debug(msg, extra={**self.extra, **kwargs})

    def info(self, msg: str, **kwargs):
        self.logger.info(msg, extra={**self.extra, **kwargs})

    def warning(self, msg: str, **kwargs):
        self.logger.warning(msg, extra={**self.extra, **kwargs})

    def error(self, msg: str, **kwargs):
        self.logger.error(msg, extra={**self.extra, **kwargs})

    def critical(self, msg: str, **kwargs):
        self.logger.critical(msg, extra={**self.extra, **kwargs})


def log_function_call(func):
    """Decorator para logar chamadas de função."""
    logger = get_logger(func.__module__)

    def wrapper(*args, **kwargs):
        logger.debug(f"Calling {func.__name__}")
        try:
            result = func(*args, **kwargs)
            logger.debug(f"{func.__name__} completed successfully")
            return result
        except Exception as e:
            logger.error(f"{func.__name__} failed: {e}")
            raise

    return wrapper


def log_async_function_call(func):
    """Decorator para logar chamadas de função assíncrona."""
    logger = get_logger(func.__module__)

    async def wrapper(*args, **kwargs):
        logger.debug(f"Calling async {func.__name__}")
        try:
            result = await func(*args, **kwargs)
            logger.debug(f"{func.__name__} completed successfully")
            return result
        except Exception as e:
            logger.error(f"{func.__name__} failed: {e}")
            raise

    return wrapper
