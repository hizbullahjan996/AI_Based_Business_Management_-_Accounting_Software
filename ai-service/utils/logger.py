import logging

def setup_logger(name: str = __name__, level: int = logging.INFO):
    logger = logging.getLogger(name)
    if not logger.handlers:
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

        ch = logging.StreamHandler()
        ch.setLevel(level)
        ch.setFormatter(formatter)

        fh = logging.FileHandler('logs/ai_service.log')
        fh.setLevel(level)
        fh.setFormatter(formatter)

        logger.setLevel(level)
        logger.addHandler(ch)
        logger.addHandler(fh)

    return logger
