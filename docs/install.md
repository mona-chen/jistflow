# Installing Iceshrimp

This document will guide you through manual installation of Iceshrimp. We also provide prebuilt [packages](/iceshrimp/packaging) for various platforms, should you prefer those over a manual install.

## Dependencies

### Build

- C/C++ compiler like **GCC** or **Clang**
- Build tools like **make**
- **Python 3**

### Required

- [**Node.js**](https://nodejs.org) v18.16.0+ (v20 recommended)
- [**PostgreSQL**](https://www.postgresql.org/) 12+ 
- [**Redis**](https://redis.io/) 6+
- [**libvips**](https://www.libvips.org/)
- **Web proxy**
  - nginx
  - Caddy
  
### Optional

- [**FFmpeg**](https://ffmpeg.org/) for video transcoding
- Full text search (Choose one)  
  Iceshrimp has full text search powered by Postgres by default, however it's very slow, and these are alternatives for that
  - [**Meilisearch**](https://www.meilisearch.com/) | [Installation guide](https://www.meilisearch.com/docs/learn/getting_started/quick_start) 
  - [**Sonic**](https://crates.io/crates/sonic-server) (More lightweight, but less features) | [Installation guide](https://github.com/valeriansaliou/sonic#installation)

## Preparations

### Download repository

Make sure you have `git-lfs` installed and have run `git lfs install` before cloning the repo, as we are using Git LFS for efficient storage of binary blobs.

```sh
git clone https://iceshrimp.dev/iceshrimp/iceshrimp.git
```

If you don't want to run the latest development version, pick a version from [here](https://iceshrimp.dev/iceshrimp/iceshrimp/releases) and run `git checkout <version>` before continuing.

### Creating a new user

In case you want to run Iceshrimp as a different user, run `adduser --disabled-password --disabled-login iceshrimp`  
Following steps will require you to run them as the user you have made, so use `su - iceshrimp`, or `sudo -iu iceshrimp`, or whatever else method in order to temporarily log in as that user. 

### Configuration

- Copy `.config/example.yml` to `.config/default.yml`
- Edit `.config/default.yml` with text editor
	- Make sure to set PostgreSQL and Redis section correctly
	- Make sure to set/uncomment text search sections if you have chosen to set up a search backend

## Installing project dependencies

This project uses corepack to manage yarn versions, please make sure you don't have a globally installed non-corepack yarn binary (e.g. by having run `npm install -g yarn` in the past, or via your operating system's package manager)

```sh
corepack enable
corepack prepare --activate
yarn
```

Note: If you get a lot of `The remote archive doesn't match the expected checksum` errors, please make sure you installed `git-lfs` and ran `git lfs install && git lfs pull`.

## Building Iceshrimp

```sh
yarn build
```
## Database

### Creating database

This will create a postgres user with your password and database, while also granting that user all privileges on database.  
Using `psql` prompt:
```sh
sudo -u postgres psql
```
```postgresql
create database iceshrimp with encoding = 'UTF8';
create user iceshrimp with encrypted password '{YOUR_PASSWORD}';
grant all privileges on database iceshrimp to iceshrimp;
\q
```

### First migration

In order for Iceshrimp to work properly, you need to initialise the database using
```bash
yarn run init
```

### Optimizing performance

For optimal database performance, it's highly recommended to configure PostgreSQL with [PGTune](https://pgtune.leopard.in.ua/) using the "Mixed type of application" profile. This is especially important should your database server use HDD instead of SATA or NVMe SSD storage.

## Setting up Webproxy

### Nginx

- Run `sudo cp docs/examples/iceshrimp.nginx.conf /etc/nginx/sites-available/ && cd /etc/nginx/sites-available/`
- Edit `iceshrimp.nginx.conf` to reflect your server properly
- Run `sudo ln -s ./iceshrimp.nginx.conf ../sites-enabled/iceshrimp.nginx.conf`
- Run `sudo nginx -t` to check that the config is valid, then restart the nginx service.

### Caddy

- Add the following to your Caddyfile, and replace `example.com` with your domain
```
example.com {
  reverse_proxy localhost:3000
}
```

## Running Iceshrimp

### Running manually

- Start Iceshrimp by running `NODE_ENV=production yarn run start`.  
If this is your first run, after Iceshrimp has started successfully, you'll be able to go to the URL you have specified in `.config/default.yml` and create first user.  
- To stop the server, use `Ctrl-C`.

### Running using systemd

- Run `sudo cp docs/examples/iceshrimp.service /etc/systemd/system/`
- Edit `/etc/systemd/system/iceshrimp.service` with text editor, and change `User`, `WorkingDir`, `ExecStart` if necessary.
- Run `sudo systemctl daemon-reload`
- Run `sudo systemctl enable --now iceshrimp` in order to enable and start Iceshrimp.
- (Optional) Check if instance is running using `sudo systemctl status iceshrimp`

### Updating Iceshrimp

Before you start, if you cloned the iceshrimp repository before the Git LFS migration, please follow [these instructions](https://iceshrimp.dev/iceshrimp/iceshrimp/wiki/Git-LFS#fixing-up-a-preexisting-cloned-repo) to get your repository back in sync.

First, stop the Iceshrimp service and then run the following commands:

```sh
## Run git stash commands only if you have uncommitted changes
git stash
```

If you were previously running a tagged release and/or want to upgrade to one, run:
```sh
git fetch --tags
git checkout <new-version>
```

If you were previously running a development version, and want to continue doing so or switch to the latest commit, run:
```sh
git switch dev
git pull
```

Regardless of which of the above you picked, run:
```sh
git stash pop
yarn
yarn build && yarn migrate
```

Note: If you get a lot of `The remote archive doesn't match the expected checksum` errors, please make sure you installed `git-lfs` and ran `git lfs install && git lfs pull`.

Now restart the Iceshrimp service and everything should be up to date.

## Post-install

See [post-install](post-install.md).
