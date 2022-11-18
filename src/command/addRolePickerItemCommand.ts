import {
    SlashCommandBuilder,
    SlashCommandRoleOption,
    SlashCommandStringOption,
} from "discord.js";

export const addRolePickerItemCommand = new SlashCommandBuilder()
    .setName("add-role-picker-item")
    .setDescription("Add a role to a role picker")
    .setDefaultMemberPermissions(0)
    .addStringOption(
        new SlashCommandStringOption()
            .setName("message-id")
            .setDescription("Message ID")
            .setRequired(true)
    )
    .addStringOption(
        new SlashCommandStringOption()
            .setName("emoji")
            .setDescription("Emoji connected to the role")
            .setRequired(true)
    )
    .addRoleOption(
        new SlashCommandRoleOption()
            .setName("role")
            .setDescription("Role to apply")
            .setRequired(true)
    );
