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
This release was made possible by project contributors: aylamz, Laura Hausmann

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
This release was made possible by project contributors: Anthial, AntoineD, April John, aylamz, Froggo, Jeder, Laura Hausmann, Luna, maikelthedev, moshibar, ShittyKopper & Vyr Cossont

It also includes cherry-picked contributions from external contributors: Namekuji, Natty, ThatOneCalculator & Naskya

---

This file lists all major changes made since the fork from Firefish on 2023-07-21. For changes prior to that date, please reference the [Firefish](https://git.joinfirefish.org/firefish/firefish/-/tree/76ad0a19b3a64eaecb4da31f20c229e423ee2095/) repository.
