import unittest

from unittest.mock import patch
from traice.main import TraiceClient
from traice.events import WORKER_STOP

class TestUtils(unittest.TestCase):

    def setUp(self):
        self.mock_codecarbon_patcher = patch('codecarbon.EmissionsTracker')
        self.mock_codecarbon_class = self.mock_codecarbon_patcher.start()
        self.addCleanup(self.mock_codecarbon_patcher.stop)
        self.mock_codecarbon_instance = self.mock_codecarbon_class.return_value

        self.mock_websocket_client_patcher = patch('websocket.WebsocketClient')
        self.mock_websocket_client_class = self.mock_websocket_client_patcher.start()
        self.addCleanup(self.mock_websocket_client_patcher.stop)
        self.mock_websocket_client_instance = self.mock_websocket_client_class.return_value

        self.mock_socketio_patcher = patch('socketio.Client')
        self.mock_socketio_class = self.mock_socketio_patcher.start()
        self.addCleanup(self.mock_socketio_patcher.stop)
        self.mock_socketio_instance = self.mock_socketio_class.return_value

        self.mock_websocket_client_instance.sio = self.mock_socketio_instance

        self.traice_client = TraiceClient('https://example.com')

    def tearDown(self):
        self.traice_client.shared_queue.put((WORKER_STOP, ''))

    def test_start(self):
        self.traice_client.start()
        self.mock_codecarbon_instance.start.assert_called_once()

    def test_update(self):
        self.traice_client.tracker = self.mock_codecarbon_instance
        self.traice_client.update(0, 0.0, 0.0)
        self.mock_codecarbon_instance._measure_power_and_energy.assert_called_once()
        self.mock_codecarbon_instance._prepare_emissions_data.assert_called_once()

    def test_stop(self):
        self.traice_client.tracker = self.mock_codecarbon_instance
        self.traice_client.stop()
        self.mock_codecarbon_instance.stop.assert_called_once()

if __name__ == '__main__':
    unittest.main()