import logging
import os
import datetime


def get_log_path() -> str:
    """
    Return the path for current logs and create logs folder if it does not
    exist yet.

    Returns:
        Path to log file for current day
    """
    if not os.path.exists('logs'):
        os.makedirs('logs', exist_ok=True)

    date_time_str = datetime.datetime.now().strftime('%Y-%m-%d')
    return f"logs/traice_log_{date_time_str}.log"


def init_traice_logger(log_level: str):
    """
    Initialize logger for TRAICE in a file under /logs

    Args:
        log_level: DEBUG, INFO, WARNING, ERROR, FATAL, CRITICAL
    """
    traice_logger = logging.getLogger('traice')
    traice_logger.setLevel(getattr(logging, log_level))
    traice_formatter = logging.Formatter('[%(asctime)s] [TRAICE] [%(levelname)s] %(message)s')
    traice_file_handler = logging.FileHandler(get_log_path())
    traice_file_handler.setFormatter(traice_formatter)
    traice_logger.addHandler(traice_file_handler)


def init_codecarbon_logger(log_level: str):
    """
    Initialize logger for Codecarbon in a file under /logs. Remove all handlers
    added by the library to redirect logs to the same file as TRAICE.

    Args:
        log_level: DEBUG, INFO, WARNING, ERROR, FATAL, CRITICAL
    """
    codecarbon_logger = logging.getLogger('codecarbon')

    for handler in codecarbon_logger.handlers[:]:
        codecarbon_logger.removeHandler(handler)

    codecarbon_logger.setLevel(getattr(logging, log_level))
    codecarbon_formatter = logging.Formatter('[%(asctime)s] [CodeCarbon] [%(levelname)s] %(message)s')
    codecarbon_file_handler = logging.FileHandler(get_log_path())
    codecarbon_file_handler.setFormatter(codecarbon_formatter)
    codecarbon_logger.addHandler(codecarbon_file_handler)


def log(message: str, level: str = 'DEBUG'):
    """
    Log a message in the file

    Args:
        message: Message to log
        level: DEBUG, INFO, WARNING, ERROR, FATAL, CRITICAL
    """
    logging.getLogger('traice').log(getattr(logging, level), message)
