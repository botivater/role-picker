from __future__ import annotations

from typing import cast

import discord
from discord import TextStyle
from discord.abc import Messageable
from discord.interactions import Interaction
from discord.ui import Modal, TextInput

from .constants import (
    CREATE_ROLE_PICKER_MODAL_ID,
    CREATE_ROLE_PICKER_MODAL_MESSAGE_INPUT_ID,
    EDIT_ROLE_PICKER_MODAL_ID,
    EDIT_ROLE_PICKER_MODAL_MESSAGE_ID_INPUT_ID,
    EDIT_ROLE_PICKER_MODAL_MESSAGE_INPUT_ID,
)
from .store import store


def _require_messageable_channel(interaction: Interaction) -> Messageable:
    channel = interaction.channel
    if channel is None or not hasattr(channel, "send"):
        raise RuntimeError("Submit was not sent in a Discord guild channel")
    return cast(Messageable, channel)


async def _send_ephemeral_response(interaction: Interaction, content: str) -> None:
    if interaction.response.is_done():
        await interaction.followup.send(content, ephemeral=True)
        return
    await interaction.response.send_message(content, ephemeral=True)


class CreateRolePickerModal(Modal, title="Create role picker"):
    message_input = TextInput(
        custom_id=CREATE_ROLE_PICKER_MODAL_MESSAGE_INPUT_ID,
        label="Message",
        style=TextStyle.paragraph,
        placeholder="This is a role picker.\n\n❤️ is in love\n💙 is not in love",
        required=True,
    )

    def __init__(self) -> None:
        super().__init__(custom_id=CREATE_ROLE_PICKER_MODAL_ID)

    async def on_submit(self, interaction: Interaction) -> None:
        try:
            message_content = str(self.message_input.value).strip()
            if not message_content:
                raise RuntimeError("Message invalid")

            channel = _require_messageable_channel(interaction)
            message = await channel.send(message_content)
            await store.ensure_message(message.id)

            await _send_ephemeral_response(interaction, "The role picker has been created.")
        except Exception:
            await _send_ephemeral_response(interaction, "An unknown error occurred.")
            raise


class EditRolePickerModal(Modal, title="Edit role picker"):
    message_id_input = TextInput(
        custom_id=EDIT_ROLE_PICKER_MODAL_MESSAGE_ID_INPUT_ID,
        label="Message ID",
        style=TextStyle.short,
        required=True,
    )
    message_input = TextInput(
        custom_id=EDIT_ROLE_PICKER_MODAL_MESSAGE_INPUT_ID,
        label="Message",
        style=TextStyle.paragraph,
        placeholder="This is a role picker.\n\n❤️ is in love\n💙 is not in love",
        required=True,
    )

    def __init__(self, message_id: int, content: str) -> None:
        super().__init__(custom_id=EDIT_ROLE_PICKER_MODAL_ID)
        self.message_id_input.default = str(message_id)
        self.message_input.default = content

    async def on_submit(self, interaction: Interaction) -> None:
        try:
            message_id = str(self.message_id_input.value).strip()
            message_content = str(self.message_input.value).strip()
            if not message_content:
                raise RuntimeError("Message invalid")

            channel = _require_messageable_channel(interaction)
            message = await channel.fetch_message(int(message_id))
            await message.edit(content=message_content)

            await _send_ephemeral_response(interaction, "The role picker has been edited.")
        except Exception:
            await _send_ephemeral_response(interaction, "An unknown error occurred.")
            raise
