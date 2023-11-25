# Installing Iceshrimp with Docker

This guide is based on `docker compose`/Docker Compose v2, but `docker-compose`/Docker Compose v1 should work as well. Docker 20.10+ is required for building your own images because of BuildKit usage, and Docker 20.10 users need to [enable BuildKit first](https://docs.docker.com/build/buildkit/#getting-started), or [upgrade to latest Docker](https://docs.docker.com/engine/install/#server).

## Preparations

### Getting needed files

If you want to use the prebuilt images:
```sh
GIT_LFS_SKIP_SMUDGE=1 git clone https://iceshrimp.dev/iceshrimp/iceshrimp.git --depth=1
```

If you want to build your own images (make sure to install `git-lfs` and to run `git lfs install` before running the command):
```sh
git clone https://iceshrimp.dev/iceshrimp/iceshrimp.git
```

### docker-compose.yml

First, run `cp docs/examples/docker-compose.yml docker-compose.yml`, and edit `docker-compose.yml` if you want to build the image yourself or choose a [different tag](https://iceshrimp.dev/iceshrimp/-/packages/container/iceshrimp/versions)

### .config

Run `cp .config/docker_example.env .config/docker.env`, and edit `.config/docker.env` and fill it with the database credentials you want.  
Run `cp .config/example-docker.yml .config/default.yml`, and edit `.config/default.yml` 
- Replace example database credentials with the ones you entered in `.config/docker.env`
- Change other configuration

If you are running Iceshrimp on a system with more than one CPU thread, you might want to set the `clusterLimit` config option to about half of your thread count, depending on your system configuration. Please note that each worker requires around 10 PostgreSQL connections, so be sure to set `max_connections` appropriately. To do this with docker-compose, add `args: ["-c", "max_connections=n"]` to the `db:` section of `docker-compose.yml`, with `n` being `(10 * no_workers) + 10`.

## Installation and first start

Choose a method, whether you chose to build the image yourself or not.  
Note: Ctrl-C will shut down Iceshrimp gracefully.

### Pulling the image

```sh
docker compose pull
docker compose up
```

### Building the image

Depending on your machine specs, this can take well over 30 minutes

```sh
docker compose build
docker compose up
```

## Starting Iceshrimp automatically

Run `docker compose up -d` and Iceshrimp will start automatically on boot.

## Updating Iceshrimp

### Pulling the image

```sh
docker compose pull
docker compose down
docker compose up -d
```

### Building the image

```sh
## Run git stash commands only if you have uncommitted changes
git stash
git pull
git stash pop
docker compose build
docker compose down
docker compose up -d
```

## Post-install

See [post-install](post-install.md).
