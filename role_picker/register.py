from __future__ import annotations

import asyncio
import logging
import os

import discord
from dotenv import load_dotenv

from .bot import RolePickerBot


async def register_application_commands(token: str) -> None:
    bot = RolePickerBot()
    guild_id = os.getenv("DISCORD_GUILD_ID")
    sync_scope = os.getenv("ROLE_PICKER_SYNC_SCOPE", "guild" if guild_id else "global").strip().lower()

    @bot.event
    async def on_ready() -> None:
        if sync_scope == "guild":
            if not guild_id:
                raise RuntimeError("ROLE_PICKER_SYNC_SCOPE is set to guild but DISCORD_GUILD_ID is missing")
            guild = discord.Object(id=int(guild_id))
            synced = await bot.tree.sync(guild=guild)
            logging.info("Successfully reloaded %d guild application (/) commands.", len(synced))
        elif sync_scope == "global":
            synced = await bot.tree.sync()
            logging.info("Successfully reloaded %d global application (/) commands.", len(synced))
        else:
            raise RuntimeError("Invalid ROLE_PICKER_SYNC_SCOPE. Expected 'guild' or 'global'.")
        await bot.close()

    await bot.start(token)


def main() -> None:
    load_dotenv()
    logging.basicConfig(level=logging.INFO)

    token = os.getenv("DISCORD_BOT_TOKEN")
    if not token:
        raise RuntimeError("DISCORD_BOT_TOKEN is not set")

    logging.info("Started refreshing application (/) commands.")
    asyncio.run(register_application_commands(token))


if __name__ == "__main__":
    main()
