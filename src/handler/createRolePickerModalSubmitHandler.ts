import { CacheType, ModalSubmitInteraction } from "discord.js";
import { CreateRolePickerModalMessageInputID } from "../modal/createRolePickerModal";
import * as yup from "yup";
import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import { redis } from "../redis";

export const createRolePickerModalSubmitHandler = async (
    interaction: ModalSubmitInteraction<CacheType>
) => {
    const transaction = Sentry.startTransaction({
        op: "createRolePickerModalSubmit",
        name: "Create role picker modal submit handler",
    });

    try {
        await interaction.deferReply({ ephemeral: true });

        const messageInput = interaction.fields
            .getTextInputValue(CreateRolePickerModalMessageInputID)
            .trim();

        const validationSchema = yup.string().required();
        const isValid = await validationSchema.isValid(messageInput);

        if (!isValid) throw new Error("Message invalid");

        if (!interaction.guild)
            throw new Error("Submit was not sent in a Discord guild");
        if (!interaction.channelId)
            throw new Error("Submit was not sent in a Discord guild channel");

        await interaction.guild.channels.fetch(interaction.channelId);
        const channel = interaction.guild.channels.cache.get(
            interaction.channelId
        );

        if (!channel)
            throw new Error(
                `Discord guild channel ${interaction.channelId} not found in guild ${interaction.guildId}`
            );

        if (!channel.isTextBased())
            throw new Error(
                `Discord guild channel ${interaction.channelId} in guild ${interaction.guildId} is not a text based channel`
            );

        const message = await channel.send(messageInput);
        await redis.set(`message-${message.id}`, JSON.stringify([]));

        await interaction.editReply({
            content: `The role picker has been created.`,
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
