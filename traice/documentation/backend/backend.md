# Server

The server is responsible for aggregating the data sent by the workers and delivering it to the frontend clients. It acts as an intermediary between both parties and manages client connections by sending them the important information they need. Let's illustrate the workflow:

## Communication between the workers and the server

1: A worker starts a training.

-   A worker sends the event `worker:start` to the server. Once the server receives this event, it will either create a new training if none exists already or add the worker to the current training.
    > Note: In this version, the server manages only a single training. If this were not the case, the worker would have to send the training ID to the server, which would create the training if it does not exist or simply add the worker to it if it does.

2: A worker finishes an epoch.

-   The worker sends the event `worker:update` with information about the completed epoch. The server updates the worker and sends an event to the frontend (see 6.1 - 6.3).

3: A worker finishes a training.

-   The worker sends `worker:stop`, and the server checks if the training is complete, sending an event to the client (see 6.4).

4: The server refuses a training.

-   If a training has already started and an epoch finishes, the server will refuse the worker with the event `worker:refused`.
-   Note: In this version, we consider that the training is static and does not allow workers to join mid-training.

## Communication between the clients and the server

5: A client connects to the frontend.

-   When a client connects to the frontend, it sends an event to the server: `client:request:trainings`. The server responds with a list of all the trainings it has in its cache and in the database with the event `server:update:trainings`.

5.1: When a client wants to select a particular training from the list the server sends, it sends the event `client:connect` with the training ID. The server then sends the training and adds the client to a room to receive updates about the training.

6: A client watches a live training.

-   At this point, the client has already connected and sent the event `client:connect`. The server sends four types of events to the client.

    | **Event** | **Description** |
    | --- | --- |
    | 6.1 `server:update:worker` | The server sends updated information about a worker to the client when a worker finishes an epoch. |
    | 6.2 `server:update:epoch` | The server sends an update for all workers for a particular epoch, providing the average epoch to the client. This includes either the average or sum (depending on the attributes) of all workers for the particular epoch. For example, if all workers have finished epoch 2, the server will send the epoch 2 data of the training with the summation for CO2 emissions and the average for accuracy for example. |
    | 6.3 `server:update:training` | This event is sent right after the previous one and consists of the updated training object after a common epoch is over. |
    | 6.4 `server:stop:worker` | When a worker finishes training, the server sends this event to the client with the associated worker ID. |

7: A client leaves a training.

-   The client sends `client:leave`, and the server removes that client from the socket room to stop updating it with events from that training.

## Important Services

### Cost

Our cost calculation method employs a predefined dictionary correlating countries with electricity prices to determine training expenses. By extracting the worker's country and their electricity consumption, we approximate the associated cost. The current data is sourced online and cited, but remains subject to potential updates or enhancements for greater precision and flexibility in the future.

### Database

The database comprises three tables: Epochs, Workers, and Trainings.

-   **Epochs Table**: Each epoch is uniquely identified by its Training ID, Worker ID, and it's number.
-   **Workers Table**: Every worker is uniquely identified by its Worker ID and associated Training ID.

-   **Trainings Table**: Each training session is assigned a unique Training ID.

These tables are interconnected through foreign key relations, enabling easy retrieval of epochs and workers associated with a training session.

### Logging

Our logging system records server-related information, including events and errors, and organizes them into a structured hierarchy within a designated logs folder. Here's how it works:

-   **Folder Structure**: The logs folder is organized hierarchically by year and month. Each year contains folders for individual months, and within each month folder, there are text files for each day.

-   **File Organization**: Every day, a new text file is created within the corresponding month folder to store the server's events and errors for that specific date.

### Socket

Manages the reception of socket connections and the sending of events, as explained earlier in the communication section. Also calls the correct services when needed to perform the treatment of requests.

### Training

The Training and TrainingManager services efficiently handles training operations, encompassing updates and session management.

-   **Training Service**: This service oversees updates to existing trainings and manages all operations related to the training object.

-   **Training Manager**: Responsible for managing training sessions, this service maintains a cache containing comprehensive information about all trainings hosted on the server, including historical and ongoing sessions. Upon server launch, collaboration with the database service ensures that the server's cache is populated with the latest information retrieved from the database, ensuring synchronization between the cache and the database.

### Worker

Manages workers by updating their information and handling their association with trainings. Handles all operations on the Worker object.
