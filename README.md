# Role Picker

Role Picker is a Discord role picker bot implemented as a reusable Python library.

## Features

- Slash commands for creating and managing role picker messages.
- Message context menu for editing existing role picker messages.
- Reaction-based role add/remove behavior.
- Redis-backed storage for emoji-to-role bindings.

## Requirements

- Python 3.11+
- Redis
- A Discord bot token and application ID

## Environment Variables

- `DISCORD_BOT_TOKEN` (required)
- `DISCORD_APPLICATION_ID` (recommended, for invite URL)
- `DISCORD_GUILD_ID` (optional, recommended for instant guild command sync during development)
- `ROLE_PICKER_SYNC_SCOPE` (optional: `guild` or `global`; defaults to `guild` if `DISCORD_GUILD_ID` is set, otherwise `global`)
- `SENTRY_DSN` (optional)
- `REDIS_HOST` (default: `127.0.0.1`)
- `REDIS_PORT` (default: `6379`)
- `REDIS_DB` (default: `0`)

## Install

```bash
pip install -e .
```

## Run Locally

1. Create and activate a virtual environment:

```bash
python -m venv .venv
# Windows (PowerShell)
.\.venv\Scripts\Activate.ps1
# Linux/macOS
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -e .
```

3. Create your local env file and fill in values:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env
# Linux/macOS
cp .env.example .env
```

Then edit `.env` and set at least `DISCORD_BOT_TOKEN` and `DISCORD_APPLICATION_ID`.

4. Start Redis locally (if not already running), then register commands:

```bash
role-picker-register
```

5. Run the bot:

```bash
role-picker
```

## Register Commands

```bash
role-picker-register
```

## Run Bot

```bash
role-picker
```

## Library Usage

```python
from role_picker import run_bot

run_bot("<DISCORD_BOT_TOKEN>")
```
