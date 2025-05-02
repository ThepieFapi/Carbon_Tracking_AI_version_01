import platform
import unittest
from traice import factories
from codecarbon.external.geography import GeoMetadata
from codecarbon.output import EmissionsData

class TestFactories(unittest.TestCase):

    def test_create_start_message(self):
        mock_id = 'id'
        mock_geo_metadata = GeoMetadata(
            country_iso_code='CAN',
            country_name='Canada',
            region='QC',
            latitude=45.508888,
            longitude=-73.561668,
            country_2letter_iso_code='CA'
        )
        mock_configuration = {
            'provider': 'aws',
            'region': 'us-east-2',
            'cpu_model': 'Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz',
            'cpu_count': 12,
            'gpu_model': None,
            'gpu_count': None,
            'ram_total_size': 16.0
        }

        self.assertDictEqual(factories.create_start_message(
            mock_id, mock_geo_metadata, mock_configuration
        ), {
            'workerId': mock_id,
            'location': {
                'country': 'Canada',
                'country_iso': 'CAN',
                'region': 'qc',
                'latitude': 45.508888,
                'longitude': -73.561668,
            },
            'cloud': {
                'provider': 'aws',
                'region': 'us-east-2'
            },
            'environment': {
                'os': platform.platform(),
                'pythonVersion': platform.python_version(),
                'cpu': {
                    'model': 'Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz',
                    'count': 12
                },
                'gpu': {
                    'model': None,
                    'count': None
                },
                'ram': 16.0
            }
        })

    def test_create_update_message(self):
        mock_id = 'id'
        mock_epoch = 42
        mock_accuracy = 99.9
        mock_loss = 0.01
        mock_emission_data = EmissionsData(
            timestamp=0.0,
            project_name='',
            run_id='',
            emissions_rate=0.0,
            cpu_power=0.0,
            gpu_power=0.0,
            ram_power=0.0,
            energy_consumed=0.0,
            country_name='',
            country_iso_code='',
            region='',
            cloud_provider='',
            cloud_region='',
            os='',
            python_version='',
            codecarbon_version='',
            latitude=0.0,
            longitude=0.0,
            duration=42.0,
            emissions=10.0,
            cpu_energy=12.0,
            gpu_energy=14.0,
            ram_energy=16.0,
            cpu_model='',
            cpu_count=0.0,
            gpu_model='',
            gpu_count=0.0,
            ram_total_size=0.0,
            tracking_mode=''
        )

        self.assertDictEqual(factories.create_update_message(
            mock_id, mock_epoch, mock_accuracy, mock_loss, mock_emission_data
        ), {
            'workerId': mock_id,
            'duration': mock_emission_data.duration,
            'co2Emission': mock_emission_data.emissions,
            'energy': {
                'cpu': mock_emission_data.cpu_energy,
                'gpu': mock_emission_data.gpu_energy,
                'ram': mock_emission_data.ram_energy
            },
            'epoch': mock_epoch,
            'accuracy': mock_accuracy,
            'loss': mock_loss
        })
    
    def test_create_stop_message(self):
        id = 'id'
        self.assertDictEqual(factories.create_stop_message(id), 
                             {'workerId': id})

if __name__ == '__main__':
    unittest.main()