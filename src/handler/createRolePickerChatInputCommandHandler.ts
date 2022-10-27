import { CacheType, ChatInputCommandInteraction } from "discord.js";
import { createRolePickerModal } from "../modal/createRolePickerModal";

export const createRolePickerChatInputCommandHandler = async (
    interaction: ChatInputCommandInteraction<CacheType>
) => {
    await interaction.showModal(createRolePickerModal);
};
