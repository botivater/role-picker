import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { client } from "..";
import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import { redis } from "../redis";

export const removeRolePickerItemChatInputCommandHandler = async (
    interaction: ChatInputCommandInteraction<CacheType>
) => {
    const transaction = Sentry.startTransaction({
        op: "removeRolePickerItemChatInputCommand",
        name: "Remove role picker item chat input command handler",
    });

    try {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.guildId) throw new Error("guildId missing");
        if (!interaction.channelId) throw new Error("channelId missing");

        const messageId = interaction.options.getString("message-id");
        const emoji = interaction.options.getString("emoji");

        if (!messageId) throw new Error("messageId missing");
        if (!emoji) throw new Error("emoji missing");

        await client.guilds.fetch(interaction.guildId);
        const guild = client.guilds.cache.get(interaction.guildId);

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

        let bindings: { emoji: string; role: string }[] = JSON.parse(
            (await redis.get(`message-${messageId}`)) || "[]"
        );

        bindings = bindings.filter((binding) => binding.emoji !== emoji);

        const messageEmoji = message.reactions.resolve(emoji);

        if (!messageEmoji) {
            throw new Error(
                `Emoji ${emoji} not found in message ${messageId} in guild channel ${interaction.channelId} in guild ${interaction.guildId}`
            );
        }

        await redis.set(`message-${messageId}`, JSON.stringify(bindings));

        await interaction.editReply({
            content: `The role picker item has been removed.`,
        });
    } catch (err) {
        console.error(err);
        Sentry.captureException(err);
        await interaction.editReply({
            content: "An unknown error occurred.",
        });
    } finally {
        transaction.finish();
    }
};
