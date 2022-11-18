import { CacheType, ModalSubmitInteraction } from "discord.js";
import * as yup from "yup";
import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import { redis } from "../redis";
import {
    EditRolePickerModalMessageIDInputID,
    EditRolePickerModalMessageInputID,
} from "../modal/editRolePickerModal";

export const editRolePickerModalSubmitHandler = async (
    interaction: ModalSubmitInteraction<CacheType>
) => {
    const transaction = Sentry.startTransaction({
        op: "editRolePickerModalSubmit",
        name: "Edit role picker modal submit handler",
    });

    try {
        await interaction.deferReply({ ephemeral: true });

        const messageIDInput = interaction.fields
            .getTextInputValue(EditRolePickerModalMessageIDInputID)
            .trim();

        const messageInput = interaction.fields
            .getTextInputValue(EditRolePickerModalMessageInputID)
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

        await channel.messages.fetch(messageIDInput);
        const message = channel.messages.cache.get(messageIDInput);

        if (!message)
            throw new Error(
                `Message ${messageIDInput} not found in guild channel ${interaction.channelId} in guild ${interaction.guildId}`
            );

        await message.edit(messageInput);

        await interaction.editReply({
            content: `The role picker has been edited.`,
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
