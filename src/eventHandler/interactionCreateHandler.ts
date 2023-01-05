import { CacheType, Interaction } from "discord.js";
import { addRolePickerItemCommand } from "../command/addRolePickerItemCommand";
import { createRolePickerCommand } from "../command/createRolePickerCommand";
import { removeRolePickerItemCommand } from "../command/removeRolePickerItemCommand";
import { editRolePickerContextMenu } from "../contextMenu/editRolePickerContextMenu";
import { addRolePickerItemChatInputCommandHandler } from "../handler/addRolePickerItemChatInputCommandHandler";
import { createRolePickerChatInputCommandHandler } from "../handler/createRolePickerChatInputCommandHandler";
import { createRolePickerModalSubmitHandler } from "../handler/createRolePickerModalSubmitHandler";
import { editRolePickerMessageContextMenuCommandHandler } from "../handler/editRolePickerMessageContextMenuCommandHandler";
import { editRolePickerModalSubmitHandler } from "../handler/editRolePickerModalSubmitHandler";
import { removeRolePickerItemChatInputCommandHandler } from "../handler/removeRolePickerItemChatInputCommandHandler";
import { CreateRolePickerModalID } from "../modal/createRolePickerModal";
import { EditRolePickerModalID } from "../modal/editRolePickerModal";

export const interactionCreateHandler = async (
    interaction: Interaction<CacheType>
) => {
    if (interaction.isChatInputCommand()) {
        switch (interaction.commandName) {
            case createRolePickerCommand.name:
                await createRolePickerChatInputCommandHandler(interaction);
                break;

            case addRolePickerItemCommand.name:
                await addRolePickerItemChatInputCommandHandler(interaction);
                break;

            case removeRolePickerItemCommand.name:
                await removeRolePickerItemChatInputCommandHandler(interaction);
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

            case EditRolePickerModalID:
                await editRolePickerModalSubmitHandler(interaction);
                break;

            default:
                break;
        }
    }

    if (interaction.isMessageContextMenuCommand()) {
        switch (interaction.commandName) {
            case editRolePickerContextMenu.name:
                await editRolePickerMessageContextMenuCommandHandler(
                    interaction
                );
                break;

            default:
                break;
        }
    }
};
