from __future__ import annotations

import logging
import os

import sentry_sdk
from dotenv import load_dotenv

from .bot import run_bot


def main() -> None:
    load_dotenv()
    logging.basicConfig(level=logging.INFO)

    sentry_dsn = os.getenv("SENTRY_DSN")
    if sentry_dsn:
        sentry_sdk.init(dsn=sentry_dsn, traces_sample_rate=1.0)

    token = os.getenv("DISCORD_BOT_TOKEN")
    if not token:
        raise RuntimeError("DISCORD_BOT_TOKEN is not set")

    run_bot(token)


if __name__ == "__main__":
    main()
