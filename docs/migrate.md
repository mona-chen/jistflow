# 🚚 Migrating from Misskey/FoundKey to Iceshrimp

All the guides below assume you're starting in the root of the repo directory.

### Before proceeding

- **Ensure you have stopped all master and worker processes of Misskey.**
- **Ensure you have backups of the database before performing any commands.**

## Misskey v13 and above

Tested with Misskey v13.11.3.

If your Misskey v13 is older, we recommend updating your Misskey to v13.11.3.

```sh
wget -O mkv13.patch https://iceshrimp.dev/iceshrimp/iceshrimp/raw/branch/dev/docs/mkv13.patch
wget -O mkv13_restore.patch https://iceshrimp.dev/iceshrimp/iceshrimp/raw/branch/dev/docs/mkv13_restore.patch
git apply mkv13.patch mkv13_restore.patch

cd packages/backend

LINE_NUM="$(pnpm typeorm migration:show -d ormconfig.js | grep -n activeEmailValidation1657346559800 | cut -d ':' -f 1)"
NUM_MIGRATIONS="$(pnpm typeorm migration:show -d ormconfig.js | tail -n+"$LINE_NUM" | grep '\[X\]' | wc -l)"

for i in $(seq 1 $NUM_MIGRATIONS); do pnpm typeorm migration:revert -d ormconfig.js; done

cd ../../

git remote set-url origin https://iceshrimp.dev/iceshrimp/iceshrimp.git
git fetch origin
git stash push
rm -rf fluent-emojis misskey-assets
git checkout v2023.11.4 # or any other tag or dev
wget -O renote_muting.patch https://iceshrimp.dev/iceshrimp/iceshrimp/raw/branch/dev/docs/renote_muting.patch
git apply renote_muting.patch

# build and migrate using preferred method
git stash push
```

Depending on the version you're migrating from, you may have to open Postgres with `psql -d your_database` and run the following commands:

```sql
ALTER TABLE "meta" ADD COLUMN "disableLocalTimeline" boolean DEFAULT false;
ALTER TABLE "meta" ADD COLUMN "disableGlobalTimeline" boolean DEFAULT false;
ALTER TABLE "meta" ADD COLUMN "localDriveCapacityMb" integer DEFAULT 512;
ALTER TABLE "meta" ADD COLUMN "remoteDriveCapacityMb" integer DEFAULT 128;
ALTER TABLE "user" ADD COLUMN "isSilenced" boolean DEFAULT false;
ALTER TABLE "user" ADD COLUMN "isAdmin" boolean DEFAULT false;
ALTER TABLE "user" ADD COLUMN "isModerator" boolean DEFAULT false;
ALTER TABLE "user" ADD COLUMN "remoteDriveCapacityMb" integer DEFAULT 128;
ALTER TABLE "user" ADD COLUMN "driveCapacityOverrideMb" integer DEFAULT 128;
ALTER TABLE "instance" ADD COLUMN "caughtAt" date;
ALTER TABLE "instance" ADD COLUMN "latestRequestSentAt" date;
ALTER TABLE "instance" ADD COLUMN "latestStatus" character varying(512);
ALTER TABLE "instance" ADD COLUMN "lastCommunicatedAt" date;
```

then quit with `\q`, and restart Iceshrimp.

Note: Ignore errors of `column "xxx" of relation "xxx" already exists`.

If no other errors happened, your Iceshrimp is ready to launch!

## Misskey v12.119 and before

```sh
git remote set-url origin https://iceshrimp.dev/iceshrimp/iceshrimp.git
git fetch
git checkout v2023.11.4 # or any other tag or dev

# build and run migrations using preferred method
```

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
