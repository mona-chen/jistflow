# 🚚 Migrating from Misskey/FoundKey/Firefish to Iceshrimp

All the guides below assume you're starting in the root of the repo directory.

### Before proceeding

- **Ensure you have stopped all master and worker processes of Misskey.**
- **Ensure you have backups of the database before performing any commands.**


## Misskey v12.119 and before

```sh
git remote set-url origin https://iceshrimp.dev/iceshrimp/iceshrimp.git
git fetch
git checkout v2023.11.4 # or any other tag or dev

# build and run migrations using preferred method
```

> **Note**
> Migrating from Misskey v13 and its forks (Sharkey et al) is unsupported due to database schema changes.

## FoundKey

```sh
wget -O fk.patch https://iceshrimp.dev/iceshrimp/iceshrimp/raw/branch/dev/docs/fk.patch
git apply fk.patch
cd packages/backend
```

Run `npx typeorm migration:revert -d ormconfig.js` for every migration until you see that `uniformThemecolor1652859567549` has been reverted. Command will not terminate properly after reverting, so you'll have to Ctrl-C

```
git remote set-url origin https://iceshrimp.dev/iceshrimp/iceshrimp.git
git fetch
git checkout v2023.11.4 # or any other tag or dev

# build and migrate using preferred method
```

## Firefish
Run `docker exec -it firefish_web /bin/sh` if using docker, before doing reverts.

Go to `packages/backend`, revert migrations manually using `pnpm run revertmigration:typeorm` for every migration, until `FirefishRepo1689957674000` has been reverted. Command will not terminate properly after reverting, so you'll have to Ctrl-C.  

If you are migrating from versions newer than 1.0.3, you'll also have to run `pnpm run revertmigration:cargo` for every migration, until `m20230806_170616_fix_antenna_stream_ids` has been reverted. 

Build and run migrations using your preferred method.

### Troubleshooting
If migration `IncreaseHostCharLimit1692374635734` failed to revert, please run `DELETE FROM "migrations" WHERE "name" = 'IncreaseHostCharLimit1692374635734';`

## Reverse

You ***cannot*** migrate back to Misskey from Iceshrimp due to re-hashing passwords on signin with argon2, however theoretically you should be able to migrate from Iceshrimp to Firefish. You can migrate from Iceshrimp to FoundKey, although this is not recommended due to FoundKey being end-of-life, and may have some problems with alt-text.
