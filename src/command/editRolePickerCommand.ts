import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

export const editRolePickerCommand = new SlashCommandBuilder()
    .setName("edit-role-picker")
    .setDescription("Edit a role picker")
    .setDefaultMemberPermissions(0)
    .addStringOption(
        new SlashCommandStringOption()
            .setName("message-id")
            .setDescription("Message ID")
            .setRequired(true)
    );
