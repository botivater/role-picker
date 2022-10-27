import { CacheType, Interaction } from "discord.js";
import { addRoleItemCommand } from "../command/addRolePickerItemCommand";
import { createRolePickerCommand } from "../command/createRolePickerCommand";
import { addRolePickerItemChatInputCommandHandler } from "../handler/addRolePickerItemChatInputCommandHandler";
import { createRolePickerChatInputCommandHandler } from "../handler/createRolePickerChatInputCommandHandler";
import { createRolePickerModalSubmitHandler } from "../handler/createRolePickerModalSubmitHandler";
import { CreateRolePickerModalID } from "../modal/createRolePickerModal";

export const interactionCreateHandler = async (
    interaction: Interaction<CacheType>
) => {
    if (interaction.isChatInputCommand()) {
        switch (interaction.commandName) {
            case createRolePickerCommand.name:
                await createRolePickerChatInputCommandHandler(interaction);
                break;

            case addRoleItemCommand.name:
                await addRolePickerItemChatInputCommandHandler(interaction);
                break;

            default:
                break;
        }
    }

    if (interaction.isModalSubmit()) {
        switch (interaction.customId) {
            case CreateRolePickerModalID:
                await createRolePickerModalSubmitHandler(interaction);
                break;

            default:
                break;
        }
    }
};
