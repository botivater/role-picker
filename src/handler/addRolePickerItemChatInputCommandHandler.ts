import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { client } from "..";
import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import { redis } from "../redis";

export const addRolePickerItemChatInputCommandHandler = async (
    interaction: ChatInputCommandInteraction<CacheType>
) => {
    const transaction = Sentry.startTransaction({
        op: "addRolePickerItemChatInputCommand",
        name: "Add role picker item chat input command handler",
    });

    try {
        await interaction.deferReply({ ephemeral: true });

        if (!interaction.guildId) throw new Error("guildId missing");
        if (!interaction.channelId) throw new Error("channelId missing");

        const messageId = interaction.options.getString("message-id");
        const emoji = interaction.options.getString("emoji");
        const role = interaction.options.getRole("role");

        if (!messageId) throw new Error("messageId missing");
        if (!emoji) throw new Error("emoji missing");
        if (!role) throw new Error("role missing");

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

        const bindings: { emoji: string; role: string }[] = JSON.parse(
            (await redis.get(`message-${messageId}`)) || "[]"
        );

        bindings.push({
            emoji,
            role: role.id,
        });

        await message.react(emoji);

        await redis.set(`message-${messageId}`, JSON.stringify(bindings));

        await interaction.editReply({
            content: `The role picker item has been added.`,
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
