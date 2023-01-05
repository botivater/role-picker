import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";

export const editRolePickerContextMenu = new ContextMenuCommandBuilder()
    .setName("Edit role picker")
    .setType(ApplicationCommandType.Message);
