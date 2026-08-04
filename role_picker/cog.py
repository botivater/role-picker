from __future__ import annotations

import logging

import discord
from discord import app_commands
from discord.ext import commands

from .constants import (
    ADD_ROLE_PICKER_ITEM_COMMAND,
    CREATE_ROLE_PICKER_COMMAND,
    EDIT_ROLE_PICKER_CONTEXT_MENU,
    REMOVE_ROLE_PICKER_ITEM_COMMAND,
)
from .modals import CreateRolePickerModal, EditRolePickerModal
from .store import RoleBinding, store

logger = logging.getLogger(__name__)


class RolePickerCog(commands.Cog):
    def __init__(self, bot: commands.Bot) -> None:
        self.bot = bot

    @app_commands.command(name=CREATE_ROLE_PICKER_COMMAND, description="Create a new role picker")
    @app_commands.default_permissions()
    async def create_role_picker(self, interaction: discord.Interaction) -> None:
        await interaction.response.send_modal(CreateRolePickerModal())

    @app_commands.command(name=ADD_ROLE_PICKER_ITEM_COMMAND, description="Add a role to a role picker")
    @app_commands.describe(message_id="Message ID", emoji="Emoji connected to the role", role="Role to apply")
    @app_commands.default_permissions()
    async def add_role_picker_item(
        self,
        interaction: discord.Interaction,
        message_id: str,
        emoji: str,
        role: discord.Role,
    ) -> None:
        await interaction.response.defer(ephemeral=True)
        try:
            channel = interaction.channel
            if channel is None or not hasattr(channel, "fetch_message"):
                raise RuntimeError("channelId missing")

            message = await channel.fetch_message(int(message_id))
            bindings = await store.get_bindings(message_id)
            bindings.append(RoleBinding(emoji=emoji, role=str(role.id)))

            await message.add_reaction(emoji)
            await store.set_bindings(message_id, bindings)

            await interaction.edit_original_response(content="The role picker item has been added.")
        except Exception:
            await interaction.edit_original_response(content="An unknown error occurred.")
            logger.exception("Failed to add role picker item")

    @app_commands.command(name=REMOVE_ROLE_PICKER_ITEM_COMMAND, description="Remove a role from a role picker")
    @app_commands.describe(message_id="Message ID", emoji="Emoji connected to the role")
    @app_commands.default_permissions()
    async def remove_role_picker_item(
        self,
        interaction: discord.Interaction,
        message_id: str,
        emoji: str,
    ) -> None:
        await interaction.response.defer(ephemeral=True)
        try:
            channel = interaction.channel
            if channel is None or not hasattr(channel, "fetch_message"):
                raise RuntimeError("channelId missing")

            message = await channel.fetch_message(int(message_id))
            bindings = await store.get_bindings(message_id)
            filtered_bindings = [binding for binding in bindings if binding.emoji != emoji]

            message_emoji = discord.utils.get(message.reactions, emoji=emoji)
            if message_emoji is None:
                raise RuntimeError(
                    f"Emoji {emoji} not found in message {message_id} in guild channel {interaction.channel_id} in guild {interaction.guild_id}"
                )

            await store.set_bindings(message_id, filtered_bindings)
            await interaction.edit_original_response(content="The role picker item has been removed.")
        except Exception:
            await interaction.edit_original_response(content="An unknown error occurred.")
            logger.exception("Failed to remove role picker item")

    async def edit_role_picker_context_menu(
        self,
        interaction: discord.Interaction,
        message: discord.Message,
    ) -> None:
        try:
            await interaction.response.send_modal(EditRolePickerModal(message.id, message.content))
        except Exception:
            await interaction.response.send_message("An unknown error occurred.", ephemeral=True)
            logger.exception("Failed to open edit role picker context menu")

    @commands.Cog.listener()
    async def on_raw_message_delete(self, payload: discord.RawMessageDeleteEvent) -> None:
        try:
            exists = await store.exists(payload.message_id)
            if not exists:
                return
            await store.delete_message(payload.message_id)
        except Exception:
            logger.exception("Failed to clean up deleted message")

    @commands.Cog.listener()
    async def on_raw_reaction_add(self, payload: discord.RawReactionActionEvent) -> None:
        try:
            if payload.guild_id is None:
                return

            bindings = await store.get_bindings(payload.message_id)
            if len(bindings) == 0:
                return

            emoji = str(payload.emoji)
            binding = next((item for item in bindings if item.emoji == emoji), None)
            if binding is None:
                return

            guild = self.bot.get_guild(payload.guild_id) or await self.bot.fetch_guild(payload.guild_id)
            role = guild.get_role(int(binding.role))
            if role is None:
                role = await guild.fetch_role(int(binding.role))

            member = payload.member or guild.get_member(payload.user_id)
            if member is None:
                member = await guild.fetch_member(payload.user_id)

            await member.add_roles(role)
        except Exception:
            logger.exception("Failed to handle reaction add")

    @commands.Cog.listener()
    async def on_raw_reaction_remove(self, payload: discord.RawReactionActionEvent) -> None:
        try:
            if payload.guild_id is None:
                return

            bindings = await store.get_bindings(payload.message_id)
            if len(bindings) == 0:
                return

            emoji = str(payload.emoji)
            binding = next((item for item in bindings if item.emoji == emoji), None)
            if binding is None:
                return

            guild = self.bot.get_guild(payload.guild_id) or await self.bot.fetch_guild(payload.guild_id)
            role = guild.get_role(int(binding.role))
            if role is None:
                role = await guild.fetch_role(int(binding.role))

            member = guild.get_member(payload.user_id)
            if member is None:
                member = await guild.fetch_member(payload.user_id)

            await member.remove_roles(role)
        except Exception:
            logger.exception("Failed to handle reaction remove")


async def setup_role_picker(bot: commands.Bot) -> None:
    cog = RolePickerCog(bot)
    await bot.add_cog(cog)
    bot.tree.add_command(
        app_commands.ContextMenu(
            name=EDIT_ROLE_PICKER_CONTEXT_MENU,
            callback=cog.edit_role_picker_context_menu,
        )
    )
