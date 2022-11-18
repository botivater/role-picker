import {
    ActionRowBuilder,
    CacheType,
    ChatInputCommandInteraction,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import {
    EditRolePickerModalID,
    EditRolePickerModalMessageIDInputID,
    EditRolePickerModalMessageInputID,
} from "../modal/editRolePickerModal";
import * as Sentry from "@sentry/node";
import "@sentry/tracing";

export const editRolePickerChatInputCommandHandler = async (
    interaction: ChatInputCommandInteraction<CacheType>
) => {
    const transaction = Sentry.startTransaction({
        op: "editRolePickerChatInputCommandHandler",
        name: "Edit a role picker chat input command handler",
    });

    try {
        if (!interaction.guildId) throw new Error("guildId missing");
        if (!interaction.channelId) throw new Error("channelId missing");

        const messageId = interaction.options.getString("message-id");

        if (!messageId) throw new Error("messageId missing");

        await interaction.client.guilds.fetch(interaction.guildId);
        const guild = interaction.client.guilds.cache.get(interaction.guildId);

        if (!guild)
            throw new Error(`Discord guild ${interaction.guildId} not found`);

        await guild.channels.fetch(interaction.channelId);
        const channel = guild.channels.cache.get(interaction.channelId);

        if (!channel)
            throw new Error(
                `Discord guild channel ${interaction.channelId} not found in guild ${interaction.guildId}`
            );

        if (!channel.isTextBased())
            throw new Error(
                `Discord guild channel ${interaction.channelId} in guild ${interaction.guildId} is not a text based channel`
            );

        await channel.messages.fetch(messageId);
        const message = channel.messages.cache.get(messageId);

        if (!message)
            throw new Error(
                `Message ${messageId} not found in guild channel ${interaction.channelId} in guild ${interaction.guildId}`
            );

        const messageIdInput = new TextInputBuilder()
            .setCustomId(EditRolePickerModalMessageIDInputID)
            .setLabel("Message ID")
            .setRequired(true)
            .setValue(message.id)
            .setStyle(TextInputStyle.Short);

        const messageInput = new TextInputBuilder()
            .setCustomId(EditRolePickerModalMessageInputID)
            .setLabel("Message")
            .setPlaceholder(
                "This is a role picker.\n\n❤️ is in love\n💙 is not in love"
            )
            .setRequired(true)
            .setValue(message.content)
            .setStyle(TextInputStyle.Paragraph);

        const firstActionRow =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                messageIdInput
            );

        const secondActionRow =
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                messageInput
            );

        const editRolePickerModal = new ModalBuilder()
            .setCustomId(EditRolePickerModalID)
            .setTitle("Edit role picker")
            .addComponents(firstActionRow, secondActionRow);

        await interaction.showModal(editRolePickerModal);
    } catch (err) {
        console.error(err);
        Sentry.captureException(err);
        await interaction.reply({
            content: "An unknown error occurred.",
        });
    } finally {
        transaction.finish();
    }
};
