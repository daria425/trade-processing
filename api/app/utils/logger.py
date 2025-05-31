import logging

class Logger:
    @staticmethod
    def configure_logging():
        logging.basicConfig(
            level=logging.INFO,  # Default log level
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.StreamHandler()  # Default handler to stream logs to console
            ]
        )

    @staticmethod
    def get_logger():
        # Return the root logger when no name is provided
        return logging.getLogger()

Logger.configure_logging()
logger= Logger.get_logger()