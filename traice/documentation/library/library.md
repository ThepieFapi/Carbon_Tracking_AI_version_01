# Library

TRAICE's Python library collects the data measured by the [CodeCarbon](https://codecarbon.io) tool and transmits it to the server at a granularity decided by the developer (currently, an epoch). The library is therefore a wrapper around the CodeCarbon tool, which intercepts the results and performs communication operations.

## Client

The library's main class is `TraiceClient`, an instance of which will be used by developers for all interactions with TRAICE. The constructor initiates the WebSocket connection with the server and sets up the logging mechanism.

```python
TraiceClient(server_url: str, traice_log_level: str, codecarbon_log_level: str)
```

-   `server_url` : TRAICE server address for WebSocket connection
-   `traice_log_level` : Log level for TRAICE among `DEBUG, INFO, WARNING, ERROR, FATAL, CRITICAL`
-   `codecarbon_log_level` : Log level for CodeCarbon among `DEBUG, INFO, WARNING, ERROR, FATAL, CRITICAL`

There are 3 main methods available to characterize different stages of training: `start`, `update` and `stop`.

### Start

The `start` method must be called at the start of training. It will initialize CodeCarbon's services and send static information about the worker to the server (e.g. location, hardware, environment).

```python
start()
```

### Update

The `update` method must be called whenever an update on metrics (CO2 emissions, energy consumption) is required. This method will fetch the metrics from CodeCarbon and send them to the server, along with other training information supplied as parameters.

```python
update(epoch: int, accuracy: float, loss: float)
```

-   `epoch`: Number of the current epoch
-   `accuracy` : Accuracy obtained on the current epoch
-   `loss` : Loss function value on current epoch

### Stop

The `stop` method must be called at the end of the training session, to indicate to the server that the worker has finished the training.

```python
stop()
```

## Example

The library can be integrated with all modern frameworks such as Pytorch or Tensorflow. Here's a simple example in pseudo-code to help understand where to call the methods.

```python
traice = TraiceClient('http://localhost:3000')
traice.start()

for epoch in range(epochs):
  outputs = model(inputs)
  loss = loss_function(outputs, labels)
  accuracy = get_accuracy(outputs, labels)
  traice.update(epoch, accuracy, loss)

traice.stop()

```

A more advanced example that trains a CNN on the CIFAR-10 dataset is available in `library/examples/cifar10`.
