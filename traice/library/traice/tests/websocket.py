import unittest
import queue
import time

from unittest.mock import patch
from traice.events import WORKER_STOP
from traice.websocket import WebsocketClient

class TestUtils(unittest.TestCase):

    def setUp(self):
        self.mock_socketio_patcher = patch('socketio.Client')
        self.mock_socketio_class = self.mock_socketio_patcher.start()
        self.addCleanup(self.mock_socketio_patcher.stop)
        self.mock_socketio_instance = self.mock_socketio_class.return_value
        
        self.shared_queue = queue.Queue()
        self.shared_queue.put((WORKER_STOP, 'data'))

        self.websocket_client = WebsocketClient('url', self.shared_queue)
        self.websocket_client.start()

    def tearDown(self):
        self.websocket_client.join()

    def test_init(self):
        self.mock_socketio_instance.connect.assert_called_once()

    def test_run(self):
        self.mock_socketio_instance.emit.assert_called_once()
        time.sleep(1) # Ensure wait has been called
        self.mock_socketio_instance.wait.assert_called_once()

if __name__ == '__main__':
    unittest.main()