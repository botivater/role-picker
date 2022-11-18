import { SlashCommandBuilder, SlashCommandStringOption } from "discord.js";

export const removeRolePickerItemCommand = new SlashCommandBuilder()
    .setName("remove-role-picker-item")
    .setDescription("Remove a role from a role picker")
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
    );
