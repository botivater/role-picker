import { SlashCommandBuilder } from "discord.js";

export const createRolePickerCommand = new SlashCommandBuilder()
    .setName("create-role-picker")
    .setDescription("Create a new role picker");
