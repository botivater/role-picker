from __future__ import annotations

import logging
import os

import discord
from discord.ext import commands
from discord.utils import oauth_url

from .cog import setup_role_picker

logger = logging.getLogger(__name__)


class RolePickerBot(commands.Bot):
    def __init__(self) -> None:
        intents = discord.Intents.none()
        intents.guilds = True
        intents.guild_messages = True
        intents.guild_reactions = True

        super().__init__(command_prefix="!", intents=intents)

    async def setup_hook(self) -> None:
        await setup_role_picker(self)
        await self._sync_application_commands()

    async def _sync_application_commands(self) -> None:
        auto_sync_raw = os.getenv("ROLE_PICKER_AUTO_SYNC_COMMANDS", "true").strip().lower()
        auto_sync_enabled = auto_sync_raw in {"1", "true", "yes", "on"}
        if not auto_sync_enabled:
            logger.info("Skipping command sync because ROLE_PICKER_AUTO_SYNC_COMMANDS is disabled")
            return

        guild_id = os.getenv("DISCORD_GUILD_ID")
        sync_scope = os.getenv("ROLE_PICKER_SYNC_SCOPE", "guild" if guild_id else "global").strip().lower()
        try:
            if sync_scope == "guild":
                if not guild_id:
                    logger.warning("ROLE_PICKER_SYNC_SCOPE is set to guild but DISCORD_GUILD_ID is missing")
                    return
                guild = discord.Object(id=int(guild_id))
                synced = await self.tree.sync(guild=guild)
                logger.info("Synced %d app commands to guild %s", len(synced), guild_id)
            elif sync_scope == "global":
                synced = await self.tree.sync()
                logger.info("Synced %d global app commands", len(synced))
            else:
                logger.warning("Invalid ROLE_PICKER_SYNC_SCOPE '%s'. Expected 'guild' or 'global'.", sync_scope)
        except Exception:
            logger.exception("Failed to sync application commands")

    async def on_ready(self) -> None:
        if self.user is None:
            return

        logger.info('Ready! Logged in as "%s"', self.user)
        application_id = os.getenv("DISCORD_APPLICATION_ID")
        if application_id:
            invite_url = oauth_url(
                int(application_id),
                permissions=discord.Permissions(
                    send_messages=True,
                    embed_links=True,
                    manage_roles=True,
                    manage_messages=True,
                    manage_emojis_and_stickers=True,
                    read_message_history=True,
                    view_channel=True,
                    add_reactions=True,
                ),
                scopes=("bot", "applications.commands"),
            )
            logger.info("Invite URL: %s", invite_url)


def run_bot(token: str) -> None:
    bot = RolePickerBot()
    bot.run(token)
