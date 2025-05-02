# TRAICE - Ericsson - Équipe 27
| Nom | Adresse courriel |
|---|---|
| Rachad Chazbek | rachad.chazbek@polymtl.ca |
| Thierry Bedard-Cortey | thierry.bedard-cortey@polymtl.ca
| Ahmed Mewloud | ahmed.sidi-ould-ahmedou@polymtl.ca |
| Achille Saint-Hillier | achille.saint-hillier@polymtl.ca |
| Mathéo Benoît-Paraschivoiu | matheo.benoit-paraschivoiu@polymtl.ca |
| Jean Siffert | jean.siffert@polymtl.ca |

# Dev Set-Up

## Requirements

Be sure to have the docker engine running in order to deploy this application.

## Build the application. 
This will build the Backend, Frontend and Database image. Everything is set up for a development set-up, meaning that these 3 services interact on the same network (0.0.0.0). This uses the development environment variables. Backend exposes 3000, Frontend 4200 and Database 8001.

```bash
docker-compose build
```

## Run the application. 
This will run the application.

```bash
docker-compose up -d
```

Once this is done, you should have 3 containers running, named traice-frontend-container, traice-backend-container and traice-database-container. You can check this with:

```bash
docker ps
```

## Access frontend
Once the application is deployed, go to http://<host>:<port> on the browser of your choice. For development, this will be: http://localhost:4200.
At first, since you just deployed a new database container, you should not have any trainings in the database and the dashboard page will be empty. A training will get added when you launch your first training.

## Install library
To build the library from sources, follow these steps to obtain the `.whl` (wheel) file :
```shell
cd library/traice
pip install --upgrade setuptools
pip install --upgrade build
python -m build
```
The `.whl` will be created in the `dist/` folder, you can then install the package by doing `pip install <filename>.whl` (e.g. `pip install Traice-0.0.1-py3-none-any.whl`).

## Library Usage
The `example` folder contains examples of usage. The library exposes a class `TraiceClient` that handles all the tracking and communication logic. You can refer to the README.md in the examples/cifar10 folder for a realistic use case, or the one in examples/communication for a simple communication test. Once this is done, you should be able to see information about the training and its energy usage in the frontend!

## Undeploy application
If you want to undeploy the application and remove the containers, run:

```bash
docker-compose down
```


# Troubleshooting

1. If you get "Error response from daemon: driver failed programming external connectivity on endpoint <name>: Bind for <host>:<port> failed: port is already allocated", then be sure to free the post used on host. You can check the containers running on such a port and host with:

```bash
docker ps -a
```

And then terminate these processes with:

```bash
docker rm -f <container-name-or-id>
```

2. If the build stage significantly slows down your computer, try going into your tasks manager and killing the docker-scout task (only in dev).

3. If you are having trouble with the frontend container, then you can try to deploy the app without the frontend:

```bash
docker-compose build database backend
docker-compose up database backend -d
cd frontend/app
npm start
```

This will deploy with docker only the database and the server, while the frontend will be running in local. Do not forget to run 'npm install' before running 'npm start' if this is your first time running the project. The result will be the same and the frontend will be accessible via  http://localhost:4200. 

