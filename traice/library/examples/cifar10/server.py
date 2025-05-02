import flwr as fl
from flwr.common import Metrics

import logging
flwr_logger = logging.getLogger('flwr')
flwr_logger.setLevel(logging.ERROR)

num_round = 0

def weighted_average(metrics: list[tuple[int, Metrics]]) -> Metrics:
    global num_round
    accuracies = [num_examples * m["accuracy"] for num_examples, m in metrics]
    examples = [num_examples for num_examples, _ in metrics]
    accuracy = sum(accuracies) / sum(examples)
    print(f"[Epoch {num_round}] Accuracy : {(accuracy*100):.3f}%")
    num_round += 1
    return {"accuracy": sum(accuracies) / sum(examples)}

strategy = fl.server.strategy.FedAvg(evaluate_metrics_aggregation_fn=weighted_average)

fl.server.start_server(
    server_address="0.0.0.0:8080",
    config=fl.server.ServerConfig(num_rounds=10),
    strategy=strategy,
)