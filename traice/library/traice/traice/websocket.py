import socketio
import threading
import queue

from traice import logger
from traice import events


class WebsocketClient(threading.Thread):
    """
    Websocket Client to manage connection with the server. Start a Socket.IO
    client and wait for event to send (Producer/Consumer scheme).
    """
    def __init__(self, server_url: str, shared_queue: queue):
        """
        Initialize the websocket client.

        Args:
            server_url: URL of the websocket server
            shared_queue: Reference to the shared queue for events
        """
        super().__init__()
        self.sio = socketio.Client()
        self.sio.on(events.WORKER_REFUSED, handler=self.handle_worker_refused)

        self.shared_queue = shared_queue

        try:
            self.sio.connect(server_url)
        except socketio.exceptions.ConnectionError:
            logger.log(f'Failed to establish a new connection with server \
                       {server_url}, tracking disabled.', 'ERROR')

    def handle_worker_refused(self, _: str):
        """
        Handle the situation where a worker join a training in progress (they 
        don't share the same epochs anymore). The connection is refused and 
        tracking is disabled.
        """
        logger.log(f'Training already in progress, tracking disabled.', 'ERROR')
        self.sio.disconnect()

    def run(self):
        """
        Main loop of the thread, wait for event (call to queue.Queue.get() is
        blocking) and emit it to the server. It is the server responsability
        to disconnect the client at the end.
        """
        while self.sio.connected:
            event, data = self.shared_queue.get()
            try:
                self.sio.emit(event, data)
            except Exception:
                logger.log(f'Unexpected disconnection, tracking aborted.', 'ERROR')
                break
            if event == events.WORKER_STOP:
                break
        if self.sio.connected:
            self.sio.wait()
