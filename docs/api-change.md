# Changes to the Firefish API

Breaking changes are indicated by the :warning: icon.

## v1.0.5 (unreleased)

### dev18

- :warning: response of `meta` no longer includes the following:
  - `enableTwitterIntegration`
  - `enableGithubIntegration`
  - `enableDiscordIntegration`
- :warning: parameter of `admin/update-meta` and response of `admin/meta` no longer include the following:
  - `enableTwitterIntegration`
  - `enableGithubIntegration`
  - `enableDiscordIntegration`
  - `twitterConsumerKey`
  - `twitterConsumerSecret`
  - `githubClientId`
  - `githubClientSecret`
  - `discordClientId`
  - `discordClientSecret`
- :warning: response of `admin/show-user` no longer includes `integrations`.

### dev17

- Added `lang` parameter to `notes/create` and `notes/edit`.

### dev11

- :warning: `notes/translate` now requires credentials.
