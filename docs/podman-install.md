# Installing Iceshrimp using Podman and Quadlet
Quadlet is a feature of Podman that is kind of like Docker Compose, but is better integrated with systemd, just like whole Podman.

## Requirements
- Podman 4.4+ with aardvark
- Git with LFS installed (if building your own images)

## Preparations

### Getting needed files

If you want to use prebuilt images:

```sh
GIT_LFS_SKIP_SMUDGE=1 git clone https://iceshrimp.dev/iceshrimp/iceshrimp.git --depth=1
cp "iceshrimp/docs/examples/Podman (quadlet)" $HOME/.config/containers/systemd
```

Tweak quadlet files and change the image tag in `$HOME/.config/containers/systemd/iceshrimp-web.container` from `latest` to `dev` or `pre` if desired, and run `docs/examples/Podman\ \(quadlet\)/volume-dir-creation.sh`.

If you want to build your own images:

```sh
git lfs install
git clone https://iceshrimp.dev/iceshrimp/iceshrimp.git
cp "iceshrimp/docs/examples/Podman (quadlet)" $HOME/.config/containers/systemd

```

Tweak quadlet files if needed, change content of `Image:` line in `$HOME/.config/containers/systemd/iceshrimp-web.container` to `Image: localhost/iceshrimp/iceshrimp:latest`, and run `docs/examples/Podman\ \(quadlet\)/volume-dir-creation.sh`.

### .config

Edit `.config/docker.env` and fill it with the database credentials you want.
Edit `.config/default.yml` and:

- Replace example database credentials with the ones you entered in `.config/docker.env`
- Change other configuration

## Installation and first start

Choose a method, whether you chose to build the image yourself or not.

### Pulling the image

```sh
podman pull $(grep -F "Image=" $HOME/.config/containers/systemd/iceshrimp-web.container | cut -d= -f2)
systemctl --user start iceshrimp-web.service
```

### Building the image

Enter Iceshrimp repo and run:

```sh
podman build . -t $(grep -F "Image=" $HOME/.config/containers/systemd/iceshrimp-web.container | cut -d= -f2) --ulimit nofile=16384:16384
systemctl --user start iceshrimp-web.service
```

## Starting Iceshrimp automatically

Run `sudo loginctl enable-linger [user]` and Iceshrimp will start automatically on boot. You don't need to, and in fact [cannot enable Podman-generated systemd services](https://man.archlinux.org/man/extra/podman/podman-systemd.unit.5.en#Enabling_unit_files).

## Updating Iceshrimp

### Pulling the image

```sh
podman pull $(grep -F "Image=" $HOME/.config/containers/systemd/iceshrimp-web.container | cut -d= -f2)
systemctl --user restart iceshrimp-web.service
```

### Building the image

```sh
## Run git stash commands only if you have uncommitted changes
git stash
git pull
git stash pop
podman build . -t $(grep -F "Image=" $HOME/.config/containers/systemd/iceshrimp-web.container | cut -d= -f2) --ulimit nofile=16384:16384
systemctl --user restart iceshrimp-web.service
```

## Post-install

If you are running Iceshrimp on a system with more than one CPU thread, you might want to set the `clusterLimit` config option to about half of your thread count, depending on your system configuration. Please note that each worker requires around 10 PostgreSQL connections, so be sure to set `max_connections` appropriately. To do this, change `max_connections=n` line in `db/postgresql.conf`, with `n` being `(10 * no_workers) + 10`, and run `systemctl --user restart iceshrimp-db iceshrimp-web`.

See also [post-install](post-install.md).