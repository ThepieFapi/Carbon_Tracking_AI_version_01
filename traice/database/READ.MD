## Database Setup


To set up the database, follow the steps below:

1. Build the Docker image by running the following command in the terminal:

# Build the Docker image
```bash
docker build -t database .
```

# Run a container from the built image with a volume
```bash
docker run -d -p 8001:5432 --name database -v database:/data/db database
```

# Connect to user postgres on the container
```bash
docker exec -it database psql -U postgres
```

# This will open a shell in the container with psql. Connect to DB traice_db
```bash
\c traice_db
```

# Display tables.
```bash
 \dt
```