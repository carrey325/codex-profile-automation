# Privacy and security

Live collection uses the locally installed Codex CLI and its existing ChatGPT login. The collector reads aggregate usage through Codex app-server. This repository does not implement cloud login, token refresh storage, or a credential upload service.

The SVG contains aggregate metrics, daily token counts and a capture timestamp. Publishing the SVG publicly reveals those values and activity dates. The generator does not include prompts, responses, email addresses, account identifiers, repository paths or conversation transcripts. A custom heading is included verbatim as escaped text, so avoid putting private information in your title.

`npm run demo` uses synthetic data. `npm run update` writes real account usage locally by default; `output/` is ignored by Git. Only publish the SVG if you intend to share those statistics.

Never add authentication files, API keys, access tokens, refresh tokens or real usage exports to issues, pull requests, fixtures or demo assets. An SVG does not require a Codex credential to display.

GitHub Actions in this repository only tests code and regenerates synthetic previews. Keep real account authentication out of public CI. Local scheduling and Git publishing use your existing local logins.

For a suspected security issue, use GitHub's private vulnerability reporting if available. Do not attach credentials or private account data. Revoke affected credentials if they have been exposed; deleting a file or stopping a task alone does not revoke them.
