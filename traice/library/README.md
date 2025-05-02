# TRAICE - Library

Traice's library seamlessly integrates with existing training code to measure energy consumption and CO2 emissions. It leverages the [CodeCarbon](https://codecarbon.io) library to obtain energy consumption and CO2 emissions data. The measurement results are then reported to a server, which aggregates the data from the various training nodes (workers).

## Installation
To install the library, please build it from source by following the steps :
```shell
cd traice
pip install --upgrade setuptools
pip install --upgrade build
python -m build
```
This process will create a wheel file `.whl` in the `dist/` folder. You can then install the package by doing `pip install <filename>.whl` (e.g. `pip install Traice-0.0.1-py3-none-any.whl`). The TRAICE module is now installed and you can use it with `import traice`.

## Usage
The `examples` folder contains an example of usage. The library exposes a class `TraiceClient` that handles all the tracking and communication logic. The `TraiceClient` class accepts 3 parameters :
- `server_url` : The URL of Traice server
- `traice_log_level` (default `DEBUG`) : The log level of traice related messages (`DEBUG`, `INFO`, ...)
- `codecarbon_log_level` (default `CRITICAL`) : The log level of CodeCarbon related messages (`DEBUG`, `INFO`, ...)

The client is then controlled by 3 methods : `start`, `update` and `stop`. The `update` method takes as parameters the current epoch, the accuracy and the loss.

The following is pseudo-code for using Traice :

```python
traice_client = TraiceClient('127.0.0.1:3000')
traice_client.start()

for epoch in epochs:
    model.train(...)
    accuracy, loss = model.get_metrics(...)
    traice_client.update(epoch, accuracy, loss)

traice_client.stop()
```

For a concrete example, please see the example using CIFAR-10 in `examples/cifar10`.
