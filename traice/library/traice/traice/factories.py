import platform
from codecarbon.external.geography import GeoMetadata
from codecarbon.output import EmissionsData


def create_start_message(id: str, geo_metadata: GeoMetadata,
                         configuration: dict[str, str]) -> dict[str, any]:
    """
    Create a message for the WORKER_START event containing static information
    to characterize the worker (id, location, environment, ...).

    Args:
        id: Unique ID of the worker
        geo_metadata: Geography metadata about the the worker's location
        configuration: Current configuration of the tracker

    Returns:
        Object with the structure accepted by the server for a WORKER_START
        event.
    """
    return {
        'workerId': id,
        'location': {
            'country': geo_metadata.country_name,
            'country_iso': geo_metadata.country_iso_code,
            'region': geo_metadata.region,
            'latitude': geo_metadata.latitude,
            'longitude': geo_metadata.longitude
        },
        'cloud': {
            'provider': configuration.get('provider'),
            'region': configuration.get('region')
        },
        'environment': {
            'os': platform.platform(),
            'pythonVersion': platform.python_version(),
            'cpu': {
                'model': configuration.get('cpu_model'),
                'count': configuration.get('cpu_count')
            },
            'gpu': {
                'model': configuration.get('gpu_model'),
                'count': configuration.get('gpu_count')
            },
            'ram': configuration.get('ram_total_size')
        }
    }


def create_update_message(id: str, epoch: int, accuracy: float, loss: float,
                          emission_data: EmissionsData) -> dict[str, any]:
    """
    Create a message for the WORKER_UPDATE event containing the information
    relative to a single epoich.

    Args:
        id: Unique ID of the worker
        epoch: Number of the finished epoch
        accuracy: Local accuracy of the worker for the given epoch
        loss: Local loss of the worker for the given epoch
        emission_data: Data relative to CO2 emissions and energy consumption

    Returns:
        Object with the structure accepted by the server for a WORKER_UPDATE
        event.
    """
    return {
        'workerId': id,
        'duration': emission_data.duration,
        'co2Emission': emission_data.emissions,
        'energy': {
            'cpu': emission_data.cpu_energy,
            'gpu': emission_data.gpu_energy,
            'ram': emission_data.ram_energy
        },
        'epoch': epoch,
        'accuracy': accuracy,
        'loss': loss
    }


def create_stop_message(id: str) -> dict[str, any]:
    """
    Create a message for the WORKER_STOP event with the worker's ID

    Args:
        id: Unique ID of the worker
    
    Returns:
        Object with the structure accepted by the server for a WORKER_STOP
        event.
    """
    return {'workerId': id}
