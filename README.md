<p><img src="assets/logo.png" alt="Iceshrimp" width="400px"></p>
<p><strong>Iceshrimp</strong> is a decentralized and federated social networking service, implementing the <strong>ActivityPub</strong> standard.<br>
It was forked from <del>Calckey</del> Firefish (itself a fork of Misskey) in mid-2023, to focus on stability, performance and usability instead of new features.</p>

---

> **Note**
> This project is **not** inactive.
> 
> Most of our current development resources are going into the [rewrite](/iceshrimp/Iceshrimp.NET), to further our goal of increasing stability and performance.
> 
> This means that major changes to the JS codebase (this project), and especially to the database schema, are on hold for the time being. Bugs will of course still be fixed, and support is still available on the usual channels.
> 
> Once the rewrite is finished, there will be an easy upgrade path for existing Iceshrimp instances.

---
- Highlighted changes:
	- First-class Mastodon client API support
	- Significantly improved database performance
	- Options to prune cached remote media automatically
	- Proper support for split domain deployments, both local and remote
	- So much more - Read the [changelog](CHANGELOG.md) to get an overview of all changes
- Don't like the Web UI? We test our Mastodon-compatible API against the following clients:
  - [Elk](https://elk.zone), [Phanpy](https://phanpy.social/), [Enafore](https://enafore.social/), [Masto-FE-standalone](https://iceshrimp.dev/iceshrimp/masto-fe-standalone) (Web)
  - [Mona](https://apps.apple.com/us/app/mona-for-mastodon/id1659154653), [Toot!](https://apps.apple.com/us/app/toot-for-mastodon/id1229021451), [Ice Cubes](https://apps.apple.com/us/app/ice-cubes-for-mastodon/id6444915884), [Tusker](https://apps.apple.com/us/app/tusker/id1498334597), [Feditext](https://github.com/feditext/feditext), [Mastodon](https://apps.apple.com/us/app/mastodon-for-iphone-and-ipad/id1571998974) (iOS)
  - [Tusky](https://tusky.app/), [Moshidon](https://lucasggamerm.github.io/moshidon/), [Megalodon](https://sk22.github.io/megalodon/), [Mastodon](https://play.google.com/store/apps/details?id=org.joinmastodon.android) (Android)
- Project goals:
  - No-nonsense bug fixes
  - QoL improvements
  - Better performance
  - Change of focus to actual community needs
  - Prioritization of user choice and configurability
- Project anti-goals:
  - Flashy marketing
  - Commercialization of any kind
- Documentation on installing (and updating) Iceshrimp using:
  - [Binary packages](https://iceshrimp.dev/iceshrimp/packaging)
  - [Docker Compose](docs/docker-compose-install.md)
  - [Manual installation](docs/install.md)
- Documentation on migrating from Firefish, Foundkey and Misskey can be found [here](docs/migrate.md).
- Want to sign up at an existing instance?
	- Check out [FediDB](https://fedidb.org/software/iceshrimp) or [Fediverse Observer](https://iceshrimp.fediverse.observer/list) to get an overview of the instances that are out there.
	- Please note that we do not operate a "flagship instance", the only project-affiliated domain is `iceshrimp.dev`.
- Want to donate to the project?
  - Our backend lead dev (zotan) is in need of a better laptop, as their current one does not have enough memory. You can contribute [here](https://bunq.me/zotanlaptopcrowdfund). Any leftover money will be given to queers in need.
- Need help or want to contribute? Join the [matrix room](https://matrix.to/#/%23iceshrimp-dev:161.rocks)!

---

[![](https://hc.ztn.sh/badge/4fc73efa-2790-4146-86bf-8685c5d6b1f7/SDOthVyf-2/archlinux.svg)](https://iceshrimp.dev/iceshrimp/packaging/src/branch/dev/archlinux)
[![](https://hc.ztn.sh/badge/4fc73efa-2790-4146-86bf-8685c5d6b1f7/UIO1Q8q2-2/docker.svg)](https://iceshrimp.dev/iceshrimp/-/packages/container/iceshrimp/dev)
