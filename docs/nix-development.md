# 🌎 Iceshrimp Developer Docs

## Nix Dev Environment
The Iceshrimp repo comes with a Nix-based shell environment to help make development as easy as possible!

Please note, however, that this environment will not work on Windows outside of a WSL2 environment.

### Prerequisites

- Installed the [Nix Package Manager](https://nixos.org/download.html) (use the comman on their website)
- Installed [direnv](https://direnv.net/docs/installation.html) and added its hook to your shell. (package manager)
- Ensured all dependencies are pulled with `git-lfs`, which also needs to be installed.

Once the repo is cloned to your computer, follow these next few steps inside the Iceshrimp folder:

- Run `direnv allow`. This will build the environment and install all needed tools.
- Run `install-deps`, then `prepare-config`, to install the node dependencies and prepare the needed config files.
- In a second terminal,  run `devenv up`. This will spawn a **Redis** server, a **Postgres** server, and the **Iceshrimp** server in dev mode.
- Once you see the Iceshrimp banner printed in your second terminal, run `migrate` in the first.
- Once migrations finish, open http://localhost:3000 in your web browser.
- You should now see the admin user creation screen!

Note: When you want to restart a dev server, all you need to do is run `devenv up`, no other steps are necessary.

### Windows Subsystem for Linux
if `devenv up` terminates because of wrong folder permissions, 

create the file `/etc/wsl.conf` in your distro and add
```shell
[automount]
options = "metadata"
```

this allows `chmod` calls to actually have an effect.
the build scripts DO actually set the permissions, it just needs to work in wsl.

### Problems with the environment

We don't anticipate any problems with the environment, as it is kept stable and does not require much maintainence.

Nevertheless, if you do encounter nix-specific problems and are unable to solve these problems yourself, please join the [Matrix support Channel](https://matrix.to/#/%23iceshrimp-dev:161.rocks)
and ping @Pyrox with the specific error message you encounter.
