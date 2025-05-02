import uuid
import queue
import codecarbon

from traice import logger
from traice import factories
from traice import utils
from traice import events
from traice import websocket

LOG_LEVELS = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'FATAL', 'CRITICAL']


class TraiceClient:
    def __init__(self, server_url: str, traice_log_level: str = 'DEBUG',
                 codecarbon_log_level: str = 'CRITICAL'):
        """
        Traice Client - Gather and report carbon emission and energy
        consumption to the server at each call to the update method.

        Args:
            server_url: URL of the server (connection through WebSocket)
            traice_log_level: DEBUG, INFO, WARNING, ERROR, FATAL, CRITICAL
            codecarbon_log_level: DEBUG, INFO, WARNING, ERROR, FATAL, CRITICAL
        """
        self.id = str(uuid.uuid4())

        if traice_log_level not in LOG_LEVELS:
            raise ValueError(f"Log level {traice_log_level} is unknown")

        if codecarbon_log_level not in LOG_LEVELS:
            raise ValueError(f"Log level {codecarbon_log_level} is unknown")

        logger.init_traice_logger(traice_log_level)
        self.codecarbon_log_level = codecarbon_log_level

        if not utils.is_valid_url(server_url):
            raise ValueError("Server URL is invalid, please enter a valid URL")

        self.shared_queue = queue.Queue()
        self.websocket_client = websocket.WebsocketClient(
            server_url,
            self.shared_queue
        )
        self.websocket_client.start()

    def start(self):
        """
        Gather static information about worker and start training with server
        """
        self.tracker = codecarbon.EmissionsTracker(
            log_level='CRITICAL',
            save_to_file=False
        )
        logger.init_codecarbon_logger(self.codecarbon_log_level)

        message = factories.create_start_message(
            id=self.id,
            geo_metadata=self.tracker._get_geo_metadata(),
            configuration=self.tracker._conf
        )
        self.shared_queue.put((events.WORKER_START, message))

        self.tracker.start()
        logger.log(f"[{self.id}] Tracking started.")

    def update(self, epoch: int, accuracy: float, loss: float):
        """
        Update emission data and send them to the server

        Args:
            epoch: finished epoch
            accuracy: local accuracy of worker at the end of the epoch
            loss: local loss of worker at the end of the epoch
        """
        self.tracker._measure_power_and_energy()
        emission_data = self.tracker._prepare_emissions_data(True)

        message = factories.create_update_message(
            self.id, epoch, accuracy, loss, emission_data
        )
        self.shared_queue.put((events.WORKER_UPDATE, message))
        logger.log(f"[{self.id}] Tracking updated (epoch {epoch}).")

    def stop(self):
        """
        Stop the tracker and inform the server that the training is completed
        """
        message = factories.create_stop_message(self.id)
        self.shared_queue.put((events.WORKER_STOP, message))
        self.tracker.stop()
        logger.log(f"[{self.id}] Tracking stopped.")
