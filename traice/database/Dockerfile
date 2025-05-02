FROM postgres:latest

# Set environment variables, put password in CICD eventually
ENV POSTGRES_DB=traice_db
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=traice

COPY init.sql /docker-entrypoint-initdb.d/init.sql
