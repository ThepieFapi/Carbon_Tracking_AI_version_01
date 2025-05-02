**TRAICE: Tracking Real-Time AI Carbon Emission**

# Background

Increasing usage of AI/ML system in various technologies \[1,2,\], eases
our daily life in different perspective but may also have side effects.
These side effects include various consequences of computational cost
for training and testing AI/ML models. High computation cost leading to
emission of Green House Gases (GHG). Design AI/ML model while
considering the social, economic and environmental impacts is the path
toward sustainable AI. In some scenario, the computations involve a
considerable amount of carbon footprint without significantly improving
the model accuracy over consecutive training iterations.

OECD recommends in 2022 the establishment of measurement standards,
expanding data collection, identifying AI-specific impacts, looking
beyond operational energy used and emission, and improving transparency
and equity.

Tools exist to evaluate the carbon emission during AI/ML model training.
There is no exiting real-time visualization tool, especially for
distributed architecture such as Federated Machine Learning. To reduce
the environmental impact, we need to define metrics, measure the metrics
and improve. Tool such as code carbon \[3\] is a suitable solution to
measure the carbon emission and is adopted in TRAICE.

# Scope

A lightweight, simple and interactive visualization tool or library is
highly recommended for Federated Machine Learning. The proposed solution
TRAICE is designed to allow several messaging, analysis and selection
capability in real-time.

TRAICE is also expected to host or integrate a Federated Machine
learning client managements and a mechanism to reduce the energy
utilization of each participant. The ultimate objective of TRAICE would
be to help in identifying the trade-off between model accuracy and
carbon emission. Based on selection capability, the user may decide to
stop or not the training.

# Description

## Horizontal Federated Machine Learning (H-FML)

Federated learning enables AI/ML model training at the network nodes by
exploiting large scale distributed data and compute resources. Federated
learning also restricts explicit data sharing so that confidentiality
and privacy associated with the use case are preserved. FL differs from
classical AI/ML in four main domains: data privacy (no end-user data
leaves the device, worker, node or client), data distribution (data
could be IID or no-IID), continual learning (the communication time
between client and central server may be too long to provide a
satisfactory user experience), and aggregation of data (some privacy
notions and rules are violated when user data aggregation occurs in the
central server) \[4,5\].

Federated learning will require $\mathcal{K}$ devices to upload and
aggregate parameters iteratively to train the global model \[6, 7\]. In
such a scenario, distributed devices (Mobile devices, workers)
collaborate, to train a common AI/ML model under the coordination of an
access point (AP) or parameter server.

H-FML occurs over multiple communication (encapsulated into upload cost
and download cost) and computation rounds. In each training round,
five-stages process is repeated until model convergence, see Figure 1.

-   In step 1, The FML starts when a training task is created by the
    sever (coordinator) who initializes the parameters of the global
    model and sends to each worker (client or participant), over first
    download cost.

-   In step 2, each worker $k\  \in \mathcal{K}$ (participants)
    independently completes training on its local dataset to minimize
    the loss on their local data distribution $\mathcal{D}_{k}$ of size
    $\eta_{k}$.

-   In step 3, Each worker submits its local model to the server
    (coordinator) over upload cost.

-   In Step 4, the global model is consolidated by aggregating local
    models received from workers by the server.

-   In Step 5, The global model is then dispatched back to workers over
    second download cost. This updated global model will be used by each
    worker in the next training round.

To achieve the goal in Step 2, FML train a global model that minimizes
the average loss across parties, which is expressed as:

$\mathcal{M =}\min_{\theta}\ \frac{1}{N}\ \sum_{k = 1}^{\mathcal{K}}{\eta_{k}\mathcal{L(}\theta,\mathcal{D}_{k})}$
(1)

Where $N$ is the sum of all local training dataset size.

In subsequent training iteration (Step 2, Step 3, Step 4, and Step5 are
the single round of FL), the process is repeated until the training loss
converges or the model converges, or a time limit is exceeded, or the
maximum number of iterations is reached.

![A diagram of a model Description automatically
generated](TRAICE_Figures/media/image1.png){width="4.069444444444445in"
height="3.339420384951881in"}

Figure 1: Typical Federated Learning Architecture with three workers A,
B and C. The Five Steps are Highlighted.

## TRAICE

TRAICE is proposed as an interactive visualization software designed for
Real-Time monitoring of AI/ML system carbon emission. It is designed to
handle horizontal federated machine leaning algorithms (H-FML) and
enabling user to track the carbon footprint. TRAICE allows users to
simultaneous observe the environmental impact and the model training
effectiveness.

TRAICE is build based on three main components, see Figure 2 below:

-   A python library

-   A Server and

-   A client application

The python library binds to the code ran by the nodes (workers) of a
H-FML based on a TRAICE package and collects real-time data generated by
the modes. The library then sends those metrics to the server. The
library exploits the *codecarbon library* \[3\] to extract the amount of
energy and carbon emission spent by the nodes.

The server aggregates the generated data and computes several metrics on
the real-time training session of participant workers.

The client is a user's visualization tool, allowing the users to monitor
and interact with the framework.

The components communicate via WebSockets, ensuring a real-time
bidirectional communication between the workers and the servers, as well
as between the server and client.

![A diagram of a workflow Description automatically
generated](TRAICE_Figures/media/image2.png){width="6.5in"
height="3.7777777777777777in"}

Figure 2: TRAICE Architecture Overview

### System Requirement

TRAICE runs and requires a Docker engine installed and up running on the
host machine. Python should be installed to run scripts and components.
Python version 3.10.x is recommended. The following requirements are
also mandatory:

-   The library must be installed on all workers nodes of the H-FML. The
    workers can run anywhere (as per user preference) and must only be
    able to communicate with the server.

-   The server can be deployed everywhere but, must expose port 3000 and
    be accessible by all services. Appropriated access should be allowed
    proper routing techniques and firewall configurations.

-   The database can be deployed anywhere and only needs to communicate
    with the server. Ideally it could be on the same subnet as the
    server to minimize latency.

-   The client can be installed anywhere but must communicate with the
    server. On a typical client-server architecture, the client sends
    requests to the server and received response on return. The process
    is activated via socket connections.

### TRAICE System Components

TRAICE system is deployed based on three parts. Each part is deployed as
a separated Docker container, see Figure 3 below.

1)  TRAICE- frontend: The TRAICE client application for visualizing the
    graphs of emissions in real-time.

2)  TRAICE-backend: Is the server responsible for receiving, aggregating
    and sending the carbon emission data of the worker participating in
    the training to the TRAICE client.

3)  TRAICE-database: Used for storing training data, as SQL database.

![A diagram of a docker Description automatically
generated](TRAICE_Figures/media/image3.png){width="5.0576935695538054in"
height="3.3717957130358704in"}

Figure 3: TRAICE Deployment Diagram

Docker Compose facilitates the communication and network setup between
the containers, ensuring they operate seamlessly as a unified system.
The system components each expose different ports for communication.
Here are the exposed ports:

-   Server: port /:3000

-   Client: port /:4200

-   Database: port /:8001 (The Docker container exposes port 8001 and
    redirects it to port 5432 inside the container to communicate with
    the PostgreSQL, service).

### Step-by-step installation of TRAICE with Docker Compose

Three distinct bidirectional communications have been identified. The
TRAICE library communicates bidirectionally with the TRAICE sever. The
TRAICE server communicates bidirectionally with the client and finally,
the TRAICE server communicates bidirectionally with the database.

The steps of the installations are as follows:

-   Clone the repository and navigate to the project root.

-   Build the application images with Docker Compose: *docker -- compose
    build*

-   Run the application: *docker -- compose up -d*

Access the frontend by navigating to *http://localhost:4200* in your
local web browser. To stop all containers related to TRAICE: *docker --
compose down*

### Installing TRAICE library

To build the library from sources, follow the steps below to obtain the
*".whl"* file:

*cd library/traice*

*pip install \--upgrade setuptools*

*pip install \--upgrade build*

*python -m build*

The *".whl"* will be created in the *"dist/"* folder, you can then
install the package by doing "pip install \<filename\> .wh" , (e.g. "pip
install Traice-0.0.1-py3-none-any.whl").

### Library Usage

The "example" folder contains examples of usage. The library exposes a
class "TraiceClient" that handles all the tracking and communication
logic. Once this is done, you should be able to see information about
the training and its energy usage in the frontend!

-   Typical example: cifar10

This example shows the federated training on CIFAR-10 dataset with 3
workers and carbon emissions tracking using TRAICE. This code is based
on the Flower Federated Learning library example available here:

\[Flower Quickstart
PyTorch\](*https://github.com/adap/flower/tree/main/examples/quickstart-pytorch).*

To use, first install the dependencies using "*pip install -r
requirements.txt*" (if you don\'t have "TRAICE" installed, please follow
instructions given above to build and install it).

\# 1. Start federated learning server

*python server.py*

\# 2. Start TRAICE server (follow instructions in section c))

\# 3. Start workers

*python worker.py \--node-id 0*

*python worker.py \--node-id 1*

*python worker.py \--node-id 2*

You can now open the TRAICE client and access the visualization.

# References

1.  K. Ahmad, A. Jafar, and K. Aljoumaa, "Customer churn prediction in
    telecom using machine learning in big data platform," *Journal of
    Big Data, vol. 6, no. 1, pp. 1--24, 2019*.

2.  L. Bariah, H. Zou, Q. Zhao, B. Mouhouche, F. Bader, and M. Debbah,
    "Understanding telecom language through large language models," *in
    IEEE Global Communications Conference (GLOBECOM), 2023, pp.
    6542--6547.*

3.  S. Luccioni, "Code carbon: Track and reduce CO2 emissions from your
    computing," *https://github.com/mlco2/codecarbon, 2013*.

4.  Y. Chen et al, "Federated learning for privacy preserving IA",
    *Communications of ACM, vol. 63, no. 12, pp. 33-36, 2020.*

5.  Q. Yang et al, "Federated machine learning: concept and
    applications", *ACM Transaction on Intelligent Systems and
    Technology (TIST), vol. 20, no. 2, pp. 12-19, 2019.*

6.  D. Ye et al, "Federated Learning in Vehicular edge computing: A
    selective model aggregation approach", *IEEE Access, vol. 8, pp. 23
    920-23 935, 2020.*

7.  Zhilu Chen and Xinming Huang, "E2E learning for lane keeping of
    self-driving cars", *IEEE Intelligent Vehicles Symposium (IV), 2017,
    pp. 1856-1860*
