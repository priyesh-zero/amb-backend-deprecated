# Backend Code [Deprecated Application] #

## To anyone not me

This is a node project made in completely in class based styles with typescript and swagger-jsdocs for auto-doc-creation of the API. It has the following features
1. Swagger Docs to provide all the end points
1. Authentication using JWT refresh and access token logic ( refresh in cookie, access in memory )
1. ORM using Prisma, experimental features migration also used.
1. Used Docker for building typescript and for CI/CD on heroku, with bitbucket, has the pipeline .yml file
1. Auth middleware for protected routes, cors for specific domains,
1. Profile - GET and PUT with yup for validation checks.

## Personal Note

docker-compose.yml to be put one level up the root directory, will create a data folder to persist postgres data

```
version: "3"

services:
  node:
    container_name: node-api
    image: node
    ports:
      - 4000:4000
    working_dir: /usr/src/app
    volumes:
      - ./ambulancia-backend:/usr/src/app
    tty: true
    restart: always
    user: $CURRENT_USER
    command: ["yarn", "dev"]

  postgres:
    container_name: postgres
    image: postgres
    volumes:
      - ./data:/var/lib/postgresql/data
    restart: always
    environment:
      POSTGRES_PASSWORD: $POSTGRES_PASSWORD
      POSTGRES_DB: $POSTGRES_DB

  adminer:
    container_name: adminer
    image: adminer
    restart: always
    ports:
      - 8080:8080

```
