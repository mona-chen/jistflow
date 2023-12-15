## v2023.12
### Release notes
This release contains only very minor changes if you're upgrading from `v2023.12-pre4`, but for users who skipped the prereleases, lots has changed. We primarily spent this release cycle on improving performance, we hope you enjoy a snappier experience!

The information below is an *aggregate* of all release highlights since the last stable release.

### Highlights
- Reworked full text search, retiring Meili/Sonic/Elastic in favor of Postgres gin_trgm with advanced search filter support
- Significantly improved backend & API performance across the board
- A HTML cache was added to the Mastodon client API, drastically improving performance (check the example config for more details & configuration options)
- Word mute filters were completely reworked for better performance, especially at scale
- A couple Mastodon OAuth regressions were fixed

### Backend
- Unnecessary table joins were removed for the i/notifications API endpoint, improving performance

### UI/UX
- The pages and gallery tab navigation was fixed
- The center and small MFM tags now autocomplete properly

### Miscellaneous
- The documentation on creating a database during the install process was improved
- Dependencies were updated and deduplicated, saving disk space
- Migration docs for Firefish were added
- JetBrains AI was disabled globally in the monorepo
- Various translation updates

### Attribution
This release was made possible by project contributors: AntoineÐ, AverageDood, Jeder, Laura Hausmann, Pyrox, Salif Mehmed & Tournesol

## v2023.12-pre4
This release preview primarily fixes bugs & regressions. Note: If you are upgrading from `-pre3` and had the HTML cache prewarm functionality enabled, you might want to clear it (`DELETE FROM "html_note_cache_entry";`), as quote URLs were not stored correctly due to an oversight.

### Mastodon client API
- The html cache prewarm functionality now correctly includes quote URLs
- Follow status indicators now work properly in apps that rely on an undocumented Mastodon API behavior (e.g. toot!)

### Backend
- Relative URLs are no longer proxied, fixing the local instance icon indicator in the default configuration

### UI/UX
- The update check in the admin panel now works as expected
- Toggles now have outlines for better visibility
- The client error screen was improved with new colors and icons
- The Twitter integration was removed, as it hasn't been functional since their API changes
- The apps help button now links to a new page in the repository ([APPS.md](https://iceshrimp.dev/iceshrimp/iceshrimp/src/branch/dev/APPS.md))

### Miscellaneous
- The biome code formatter version and configuration were updated
- Various translation updates

### Attribution
This release was made possible by project contributors: AntoineÐ, AverageDood, Froggo, Laura Hausmann, Minybol & Pyrox

## v2023.12-pre3
This release preview primarily contains performance optimizations and regression fixes. Upgrading is recommended especially if you're running a big instance or have more than a couple thousand entries in the `muted_note` table.

### Highlights
- A HTML cache was added to the Mastodon client API, drastically improving performance (check the example config for more details & configuration options)
- Word mute filters were completely reworked for better performance, especially at scale
- A couple Mastodon OAuth regressions were fixed

### Mastodon client API
- Notes that were filtered out due to hard word mutes are now returned to clients with the FilterResult property instead of being silently dropped
- Login with clients that leave a trailing `+` character in the scope parameter has been fixed
- Login with clients that depend on the `state` parameter in the OAuth process has been fixed

### Backend
- updateUserProfileData now only triggers updateMentions once
- Word mute data is now stored in redis instead of the database, significantly improving timeline query performance for larger instances
- Database columns containing hostnames had their length increased to accomodate longer domain names

### UI/UX
- Copy to clipboard now uses the modern async clipboard API and no longer applies weird formatting to copied text

### Miscellaneous
- Various translation updates

### Attribution
This release was made possible by project contributors: AverageDood, Laura Hausmann & Pyrox

## v2023.12-pre2
This release contains an important security fix. Upgrading is therefore strongly recommended. If you are on or want to upgrade to a stable release, please refer to the stable backport release [v2023.11.4](https://iceshrimp.dev/iceshrimp/iceshrimp/releases/tag/v2023.11.4) instead.

### Added features
- A new setting was added that allows admins to specify an account that's automatically followed on user registration

### Bug fixes
- HTTP signatures are now properly validated everywhere

### UI/UX
- The gradient angles were adjusted to be in line with the design guidelines

### Attribution
This release was made possible by project contributors: AntoineÐ, Latte macchiato & Laura Hausmann

It also includes cherry-picked contributions from external contributors: perillamint, yunochi

## v2023.12-pre1
It's been a while, but it's time for another prerelease. This release cycle is going to primarily focus on performance, both in the backend and the frontend.

Note: This release preview includes a lot of expensive migrations, which may take a while to run. We promise the performance benefits are worth the wait.

### Highlights
- Reworked full text search, retiring Meili/Sonic/Elastic in favor of Postgres gin_trgm with advanced search filter support
- Significantly improved backend & API performance across the board

### Backend
- Support for external search backends was removed
- Support for advanced search filters was added to the Postgres search backend
- The `search-by-username-and-host` API endpoint no longer excludes the local user making the request
- Renote status is now aggregated and returned with timeline responses instead of the client requesting it for each note individually
- Heuristics for which timeline query to use for each user were added, drastically improving worst case timeline performance
- Timeline queries were streamlined for improved performance, adding new multi-column indicies as appropriate
- User avatar and banner URL & blurhash were duplicated into the user table, drastically improving query performance by saving up to 6 joins per query
- The media proxy was reworked to not require a database query per requested file
- A per-request packed user cache was added to the web API to improve performance, mimicking the existing Mastodon client API implementation
- The web API now only fetches exactly as many notes as have been requested
- The `re2` dependency was updated, fixing builds on NixOS
- Environment variables that allow setting alternative locations for the config file, a second config file for secrets, the custom directory as well as the media directory were added
- The `followRequestAccepted` notification is no longer emitted for non-locked accounts
- The mfm-to-html renderer for outgoing ActivityPub messages was changed to happy-dom

### Mastodon client API
- Search now also supports filters, using the same syntax as the web client
- NoteConverter and UserConverter now pre-aggregate applicable data in their respective `encodeMany` functions for improved performance
- The `user` column is now joined where applicable for improved performance
- The mfm-to-html renderer was changed to happy-dom, drastically improving timeline performance

### UI/UX
- The search dialog was replaced with a proper search page, and now supports additional search filters
- A help page containing a list of all available search filters was added
- All references to post indexing were removed, as manual indexing is no longer required
- The search filter button is no longer visible in guest mode
- Inactive search tabs are no longer loaded
- Overscroll was disabled due to it causing graphical glitches and weird behavior, especially on desktop
- All images in timeline views now have the `loading="lazy"` and `decoding="async"` attributes set
- The URL card animation has been removed
- Additional posts are now loaded in before reaching the bottom of the timeline
- VueJS and Vite were updated to their respective latest versions

### Infrastructure and governance
- Docker builds with populated BuildKit caches no longer break if the yarn cache changes

### Miscellaneous
- References to external search backends were removed from the documentation & example configuration files
- The installation docs now contain information on the available environment variables
- The project readme was updated
- All project imports of the deprecated punycode node module were switched over to the punycode.js replacement
- Various translation updates

### Attribution
This release was made possible by project contributors: AntoineÐ & Laura Hausmann

## v2023.11.3
This release contains yet more packaging and distribution-related changes, including some required for packaging the project for NixOS.

### Backend
- The backslash character is now correctly escaped in `sqlLikeEscape`, fixing search queries containing backslashes

### Infrastructure and governance
- The Dockerfile was streamlined and now builds the project with an immutable lockfile in the first stage

### Miscellaneous
- The `focus-production` yarn script now also updates `.yarnrc.yml`, fixing builds in some packaging environments
- The default locale was changed to `en-US`, which should fix translation-related UI issues
- A new yarn script - `pack-yarn` - was added to assist with packaging the project on NixOS

### Attribution
This release was made possible by project contributors: Jeder, Laura Hausmann & Pyrox

## v2023.11.2
This release primarily contains project maintenance changes. For the first time, we are also distributing binary packages! Currently we support Arch Linux, DEB & RPM based distributions will follow.

### Highlights
- Lots of yarn script tweaks and additions, allowing for easier packaging and distribution
- Significantly reduced size of container images
- Binary packages for Arch Linux (DEB/RPM support to follow)

### UI/UX
- The local-only icon is now consistent across different parts of the UI
- The `/about-iceshrimp` page was tweaked

### Backend
- Running `yarn workspace backend run migration:revert` now exits properly instead of stalling
- Enabling 2FA when the instance is in private mode no longer locks users out of their account
- A typo in the name of the scope parameter for the `/oauth/token` endpoint was fixed
- The `/oauth/token` endpoint is now strictly compliant with the Mastodon API specification (note: their documentation does not match their implementation)

### Infrastructure and governance
- Built Docker images now only contain runtime dependencies, decreasing image size significantly

### Miscellaneous
- Yarn is now using the strict PnP mode, all peer dependencies that are broken upstream were patched
- A new yarn script, `focus-production`, was added. Running it will remove all dependencies that are not needed after building the project. Caution: only use for packaging, as this rewrites all `package.json` files in the project directory.
- A new yarn script, `regen-version`, was added. Running it will set the `version` attribute of the main `package.json` to `${tag}-dev-${git_revision}`.
- The installation documentation was updated
- Git LFS disclaimers were added to the documentation
- Yarn was updated to v4.0.2
- Dependencies using `node-gyp` now build with all available threads
- The nix flake was updated to work properly with all recent changes
- The documentation no longer recommends git clones with `--depth=1` for most deployment types, as this is not really necessary anymore due to git-lfs
- Patches were merged into upstream `re2` and their `install-artifact-from-github` dependency, both fixing build on arm64-musl, and allowing for much faster prebuilt artifact installs
- The yarn script `dev` now only builds the project once
- The nix development documentation was updated
- The README badges were updated

### Attribution
This release was made possible by project contributors: Alexis, AntoineÐ, Laura Hausmann & Pyrox

## v2023.11.1
### Release notes
This release primarily adds polish and fixes bugs and regressions introduced in the previous release cycle. If you are running `v2023.11` or earlier, upgrading is strongly recommended.

### Highlights
- Builds on docker-arm64 (and on bare metal musl-arm64 distros) work as expected again
- Improved OAuth login page

### Bug fixes
- The `node-re2` dependency was migrated to an in-house fork, fixing builds on musl-arm64
- Tags in edited posts are now handled correctly
- Poll are now federating properly to non-\*key instances again
- Hovering over a link no longer renders a duplicate popover
- Various client settings that were previously missing from preference backups are now included
- Incoming poll edits are now processed correctly

### UI/UX
- The "Centered" layout was removed
- The layout dropdown was replaced with a "toggle layout" button
- The "Modern" CW style now has the visual buttons match the clickable area
- The OAuth login page has been fully reworked to only show essential information
- Tooltips are no longer shown on touchscreen input
- The icon for "mark all notifications as read" was changed to `ph-checks` to better reflect the action
- A new client preferences category, "Wellness", was added, currently containing the option to hide certain UI elements like the new posts indicator, with more to come

### Mastodon client API
- A regression in which remote posts with quotes attached had the quoteUri duplicated was fixed

### Backend
- Local only notes are now not shown to guest users in timeline/non-detail views either
- Channels are no longer visible to guests
- User bios with MFM now federate properly with other \*key instances implementing the  \_misskey_summary field
- The separate cache server was merged back into a unified (cache + queue processor) redis architecture, the respective config fields have been removed

### Infrastructure and governance
- The CI workflows no longer reference cargo/rust
- Docker builds now use the yarn version specified in `package.json` instead of `yarn@stable`
- The README was updated to better reflect the project values

### Miscellaneous
- The code formatter was changed from `rome` to `biome`
- The "Twitter (soon)" option for post imports has been removed
- The documentation now contains information on possible conflicts between the corepack and system yarn installations
- Various translation updates

### Attribution
This release was made possible by project contributors: AntoineÐ, Aylam & Laura Hausmann

It also includes cherry-picked contributions from external contributors: kakkokari-gtyih

## v2023.11
### Release notes
This release contains only very minor changes if you're upgrading from `v2023.11-pre5`, but for users who skipped the prereleases, lots has changed. Be sure to read the changelogs of all releases between the one you're upgrading from and this one, especially the sections on breaking changes.

The information below is an *aggregate* of all breaking changes and release highlights since the last stable release.

### Breaking changes
- Lists have been reworked, now only allowing followed users to be added, and support for proxy accounts has been removed. To allow users to follow any users they want to keep on their lists, the migration that removes all list members users are not following will only be activated in the release **after** the next stable release. It is therefore highly recommended to add an instance announcement informing your users of this change and advising them to follow any affected accounts and to use the new "hide from home timeline" list option if desired.
- The Mastodon client API now uses the same object identifiers as the Misskey API, as well as its own, separate OAuth backend. This means all existing sessions are now invalid. Please log out and back in again in your clients.

### Highlights
- The Mastodon client API backend underwent a full rewrite, dropping megalodon as a dependency. Expect:
    + Rich text formatting (mentions, links, hashtags, etc. are now properly formatted)
    + Significantly improved API responsiveness - performance was improved by a factor of 2-5x (or more!) depending on the endpoint
    + Better spec compliance & improved compatibility (we test against: Mona, toot!, Ice Cubes, Tusker, Feditext, Mastodon for iOS, Mastodon for Android/Megalodon/Moshidon, Tusky, Elk, Phanpy, Pinafore/Semaphore/Enafore and more)
- The Mastodon client API now supports the websocket streaming API
- Various bugs in the HTTP Link header pagination implementation were fixed
- The Mastodon client API now uses OAuth instead of MiAuth
- ActivityPub object lookups now respect redirects
- Significantly improved handling of mentions, both in outgoing AP messages and in the Mastodon client API
- Various Mastodon client API regressions are now fixed, improving client compatibility
- HTTP Signature validation error handling has been improved
- The project is now compatible with NodeJS >= 18.6 (tested against v21.1.0 at time of writing)

### Miscellaneous
- The project is now compatible with NodeJS v21, tested against v21.1.0 at time of writing
- The nix dev environment was updated

### Attribution
This release was made possible by project contributors: AntoineÐ, Aylam, Erin Shepherd, jeder, Laura Hausmann & Pyrox

It also includes cherry-picked contributions from external contributors: Johann150

## v2023.11-pre5
### Release notes
This release fixes a regression introduced in the last release preview. If you are running `v2023.11-pre3` or `v2023.11-pre4`, upgrading is strongly recommended.

### Miscellaneous
- The commit that removed the `Mk` prefix from VueJS components has been reverted, as it caused various UI issues

### Attribution
This release was made possible by project contributors: Laura Hausmann

## v2023.11-pre4
### Release notes
This release mostly fixes regressions introduced in the last release preview. If you are running `v2023.11-pre3`, upgrading is strongly recommended.

### Mastodon client API
- The compatible version was bumped to 4.2.1, to indicate support for the "hide list members from home timeline" feature
- Remote users are now automatically refreshed in background

### Backend
- Errors in refetchPublicKeyForApId can no longer cause strange inbox queue behavior
- Database transactions were refactored so no non-database code is run in transaction blocks, fixing a possible backend stall condition in which all database connections are blocked by transactions
- User profile mentions resolution no longer recurses infinitely, fixing a possible DoS attack vector

### Miscellaneous
- The `Mk` prefix was removed from all custom VueJS components
- `.yarn/sdks` was updated to fix language server problems in VSCode
- Various translation updates

### Attribution
This release was made possible by project contributors: AntoineÐ, Aylam, jeder & Laura Hausmann

## v2023.11-pre3
### Breaking changes
- Lists have been reworked, now only allowing followed users to be added, and support for proxy accounts has been removed. To allow users to follow any users they want to keep on their lists, the migration that removes all list members users are not following will only be activated in the release **after** the next stable release. It is therefore highly recommended to add an instance announcement informing your users of this change and advising them to follow any affected accounts and to use the new "hide from home timeline" list option if desired.

### Highlights
- Significantly improved handling of mentions, both in outgoing AP messages and in the Mastodon client API
- Various Mastodon client API regressions are now fixed, improving client compatibility
- HTTP Signature validation error handling has been improved
- The project is now compatible with NodeJS >= 18.6 (tested against v20.8.1 at time of writing)

### Mastodon client API
- Long redirect URIs are now handled correctly
- The `/v1/instance` endpoint now returns the correct streaming URL
- The `/v1/apps` response now returns all fields, including `vapid_key`, allowing for implementation of push notifications in the future
- Redirect URLs that contain double-urlencoded parts are now handled correctly
- The OAuth process now displays errors properly
- The hashtag timeline query is now case insensitive
- Statuses returned by all endpoints now have the `content_type` field populated
- The `/v1/instance` endpoint now correctly lists the supported mime types for statuses
- Hashtags now have the `class=hashtag` attribute set correctly
- Accounts returned by all endpoints now have the `fqn` field populated
- Inline quote URLs are now rendered properly by supported clients (e.g. Enafore)
- Mentions to accounts the instance was unable to resolve are now rendered as plain text
- Profile edits made using `/v1/update_credentials` are now federated properly
- An edge case where quotes were incorrectly detected as boosts was resolved
- Boosted quotes are now handled properly
- User profile data is now updated in the background when calling `/v1/accounts/:id`
- The `url` field in status objects now contains the url instead of the uri, whenever available
- Boosts by boost-muted users are now skipped in the Mastodon streaming API

### Backend
- Migrations are finally in sync with the ORM, allowing for proper migrations handling in the future
- Mentions in user profiles are now resolved and stored in the database
- Invalid mentions in outgoing AP messages are now sent as plain text instead of an unreachable link pointing back at the origin instance
- When HTTP signature validation fails, an attempt to refresh the user's public key is now made, fixing federation with Mastodon instances who ran `tootctl accounts rotate`
- The error image override config is now loaded properly
- VAPID keys for WebPush are now properly generated when bootstrapping a new instance
- Capitalization of mentions is now corrected automatically, preventing federation issues where remote instances fail to render them
- Authorized fetch is now enabled by default for new instances
- NSFW detection & tensorflow have been removed
- HTTP signature validation now correctly verifies the hostname of the keyId against the hostname of the actor uri instead of the user's account domain, fixing an edge case where federation with split domain instances could fail
- Federation handshakes initiated by GoToSocial when the local instance has authorized fetch enabled are now handled correctly
- The `search-by-username-and-host` endpoint now doesn't filter out inactive users by default

### UI/UX
- The default themes were tweaked
- The 'Explore' tab header now uses the correct icon

### Miscellaneous
- Some unused files have been removed from the repository
- The code formatter now works properly for .vue files
- The discrepancy of different formatters using different tab widths was resolved
- The documentation now recommends using `git clone --depth=1` when cloning the repository to speed up the process
- The Dockerfile now doesn't run `yarn workspaces focus --production` because it doesn't actually save any space in the final image due to yarn zero installs
- A new yarn script, `start:debug`, was added to make attaching a debugger to the application easier
- Dependencies with critical vulnerabilities have been updated
- Various translation updates

### Attribution
This release was made possible by project contributors: AntoineÐ, Aylam, Erin Shepherd & Laura Hausmann

## v2023.11-pre2
### Highlights
- An oversight in the OAuth helper that was preventing login to work in some Mastodon clients was fixed.

## v2023.11-pre1
### New versioning scheme
From now on we will use a JetBrains-like versioning scheme. Since our release candidates are more of a release preview, they can now be identified by the `-pre` suffix, followed by a number that increments with each following release preview. To maintain lexical sort order with previous releases from this year, we're starting the release counter at 11. That makes this release `v2023.11-pre1`.

### Breaking changes
- The Mastodon client API now uses its own, separate OAuth backend. This means all existing sessions are now invalid. Please log out and back in again in your clients.

### Highlights
- The Mastodon client API now uses OAuth instead of MiAuth
- ActivityPub object lookups now respect redirects

### Mastodon client API
- Reactions with 0 reacts are no longer returned
- The 'next' part of the Link pagination header is no longer returned when there are less results than the set limit
- Remote mentions of local users are now rendered correctly
- Mentions now only display the handle, without the instance domain, mimicking Mastodon
- Code blocks are now rendered properly
- Mentions in user bios now work (most of the time)
- Quote URIs are now only appended to the post if the post doesn't already contain them
- Links are now rendered properly
- The streaming API now works for webclients running in Chrome and its derivatives
- /v1/instance now returns the field `max_toot_chars`, improving compatibility with some clients
- Edit history is now returned in the correct order
- Invalid remote mentions are now handled correctly
- User search autocomplete now works as one would expect
- The public:allow_local_only stream is now supported

### UI/UX
- "NSFW content" was renamed to "sensitive content"
- The user mention picker now works correctly for remote users

### Backend
- All migrations are now written in TypeScript
- Mentions in outgoing AP messages are now formatted correctly
- Trailing slashes for links in user profile fields are now only sent in AP messages if explicitly set
- Links in outgoing AP messages are now formatted correctly
- Mention parsing in incoming & outgoing AP messages now matches usernames case-insensitively 
- The required VAPID keys for WebPush are now generated automatically

### Miscellaneous
- A missing devDependency was added
- The unused check:connect script was removed

### Attribution
This release was made possible by project contributors: aylamz & Laura Hausmann

It also includes cherry-picked contributions from external contributors: Johann150

## v2023.10.11-rc1
### Highlights
- The Mastodon client API now supports the websocket streaming API
- Various bugs in the HTTP Link header pagination implementation were fixed

### Attribution
This release was made possible by project contributors: Laura Hausmann

## v2023.10.08-rc1
### Breaking changes
- The Mastodon client API now uses the standard alphanumeric ID format. This breaks pagination with existing Mastodon client sessions, if they cache user and/or post data. It is therefore strongly recommended that you either clear the client's cache (if it exposes such a button), its data (if your OS supports this), log out and in again, or in the worst case reinstall any clients with active sessions, especially if you notice strange timeline behavior or unexplained "Record not found" errors.

### Highlights
- The Mastodon client API backend underwent a full rewrite, dropping megalodon as a dependency. Expect:
    + Rich text formatting (mentions, links, hashtags, etc. are now properly formatted)
    + Significantly improved API responsiveness - performance was improved by a factor of 2-5x (or more!) depending on the endpoint
    + Better spec compliance & improved compatibility (we test against: Mona, toot!, Ice Cubes, Tusker, Feditext, Mastodon for iOS, Mastodon for Android/Megalodon/Moshidon, Tusky, Elk, Phanpy, Pinafore/Semaphore/Enafore and more)

### Bug Fixes
- The update checker now works properly with the new versioning scheme
- The control panel indicator is now displayed correctly
- Countless Mastodon client API bugs have been resolved

### Backend
- Note edits (of local users) have been completely reworked, now storing the correct history and no longer accepting nonsensical parameters (like changing the reply target) that don't federate properly if at all

### UI/UX
- The calendar widget is now disabled by default
- The navigation buttons on mobile have been improved
- The default themes now have proper shadows
- Post headers no longer have text shadow

### Miscellaneous
- The documentation now mentions PGTune
- Private mode descriptions now refer to 'allowlists' instead of an outdated term
- Various translation updates

### Attribution
- This release was made possible by project contributors: Alexis, AntoineÐ, Aylam & Laura Hausmann

## v2023.10.04
### Highlights
- New logos, themes & brand colors
- All rust code has been removed (less jank, significantly faster build times)

### Bug Fixes
- Post boost counts can no longer become negative

### Performance
- User note lookups are now significantly faster

### Miscellaneous
- Minor iconograpgy changes
- Translation updates

### Infrastructure
- Docker builds are now versioned

### Attribution
This release was made possible by project contributors: AntoineÐ, Aylam, Jeder, Laura Hausmann & moshibar

## v2023.09.13-rc1
### Highlights
- New branding & documentation
- Proper support for split domain deployments, both local and remote
- [Configurable](https://iceshrimp.dev/iceshrimp/iceshrimp/src/commit/f3c1e4efd30e660372a652a7b43fdb63e2817bae/.config/example.yml#L193-L198) automatic remote media pruning (disabled by default)
- Reworked content warnings (three different styles for CW'd posts, 'Expand all CWs in thread' button, 'Expand all CWs by default' client option)

### Bug fixes
- CW-only quotes now function correctly
- Relative timestamps (*1m ago*) are now updated as time passes
- Replies to inaccessible posts are now displayed correctly instead of causing timeline errors
- Antenna pagination is now handled correctly, including for posts received out of order
- Inbox URLs are now checked in the deliver manager (a broken akkoma commit was briefly causing delivery queue crashes)
- The chats page title no longer occasionally displays *undefined*
- Fixed an edge case where account deletion could time out
- Antennas now also match on CW text
- Local only posts now correctly display on the timeline without having to reload
- The migration that moves antennas to the redis/dragonflydb cache server now works with password protected redis servers
- You can now no longer edit a post to include a quote of itself
- Post edits no longer support post visibility changes
- Full text search is now restricted to logged in users
- Local only posts are no longer accessible to guest users
- The web client now shows local users with the instance account domain instead of the web domain
- New replies in a thread are now displayed correctly
- User update no longer fails for users who don't have a `sharedInbox`
- Follow requests now paginate properly
- Fetching pinned posts from users on GoToSocial instances (or other AP implementations that return a collection of URIs instead of objects) now works properly

### UI/UX
- Ads, donation nag prompts & the patreon integration have been removed
- The blinking notification indicator has been replaced with a static one
- Replies to inaccessible posts now have an indicator explainin this
- Protected posts now have a lock indicator instead of a disabled boost button
- The navbar editor now has a proper UI
- The instance ticker is now much more readable in light mode
- The post visibility picker is now mobile-optimized
- The search button in the guest view is now a button instead of a fake search bar
- Blur is now disabled by default
- When blur is disabled, UI elements are now properly opaque
- The antenna timeline now has a help text explaining why posts can be out of order
- Status images have been replaced with [configurable](https://iceshrimp.dev/iceshrimp/iceshrimp/src/commit/3afbaacc3773ac0772204d872126d37309302562/.config/example-docker.yml#L201-L205) status emoji
- The navbar layout has been tweaked
- Various inconsistencies as well as alignment & animation issues have been fixed

### Mastodon client API
- /api/v1/instance is now more accurate
- Emoji reactions are now supported
- The 'pinned' parameter is now supported for individual profile timelines
- Improved handling for quotes
- Post edits are now supported
- Post deletion now returns the correct response
- OAuth registration now correctly supports multiple callback URIs

### Backend
- `Cache<T>` `.getAll` and `.delete` functions now work as expected
- Deleted users are now purged from user lookup and public key caches
- Proper support for host-meta style WebFinger
- Stricter compliance with the WebFinger spec
- Support for WebFinger remotes that don't handle queries for object URIs correctly

### Performance
- The project is now built with yarn berry (with zero installs) instead of pnpm
- The docker build process now properly caches rust and yarn deps
- The migration rust crate now builds much faster

### Miscellaneous
- The MFM search engine is now [configurable](https://iceshrimp.dev/iceshrimp/iceshrimp/src/commit/afd9ffb3c728b143c6d3d4d3dd8562ec6bde3a91/.config/example.yml#L206-L207)
- Various translation updates

### Infrastructure and governance
- Commits are now tested with basic CI on push
- Docker builds are now automatic for amd64 and arm64
- The [code of conduct](CODE_OF_CONDUCT.md) has been updated

### Attribution
This release was made possible by project contributors: Anthial, AntoineÐ, April John, aylamz, Froggo, Jeder, Laura Hausmann, Luna, maikelthedev, moshibar, ShittyKopper & Vyr Cossont

It also includes cherry-picked contributions from external contributors: Namekuji, Natty, ThatOneCalculator & Naskya

---

This file lists all major changes made since the fork from Firefish on 2023-07-21. For changes prior to that date, please reference the [Firefish](https://git.joinfirefish.org/firefish/firefish/-/tree/76ad0a19b3a64eaecb4da31f20c229e423ee2095/) repository.
