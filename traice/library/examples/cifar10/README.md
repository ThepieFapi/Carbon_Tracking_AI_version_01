# Example - CIFAR10
This example shows the federated training on CIFAR-10 dataset with 3 workers and carbon emissions tracking using TRAICE. This code is based on the Flower Federated Learning library example available here : [Flower Quickstart PyTorch](https://github.com/adap/flower/tree/main/examples/quickstart-pytorch).

To use, first install the dependencies using `pip install -r requirements.txt` (if you don't have `traice` installed, please follow instructions given in `library/README.md` to build and install it).
```shell
# 1. Start federated learning server 
python server.py
# 2. Start TRAICE server (follow instructions in README.md)
# 3. Start workers
python worker.py --node-id 0
python worker.py --node-id 1
python worker.py --node-id 2
```

You can now open the TRAICE client and access the visualization.