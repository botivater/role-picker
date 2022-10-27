import {
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
} from "@discordjs/builders";
import { TextInputStyle } from "discord.js";

export const CreateRolePickerModalID = "6a545f40-aaff-4097-a673-4acc5da5c518";
export const CreateRolePickerModalMessageInputID =
    "e4cf39f6-ac61-4cab-9ac8-6a48db593b68";

const messageInput = new TextInputBuilder()
    .setCustomId(CreateRolePickerModalMessageInputID)
    .setLabel("Message")
    .setPlaceholder(
        "This is a role picker.\n\n❤️ is in love\n💙 is not in love"
    )
    .setRequired(true)
    .setStyle(TextInputStyle.Paragraph);

const firstActionRow =
    new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        messageInput
    );

export const createRolePickerModal = new ModalBuilder()
    .setCustomId(CreateRolePickerModalID)
    .setTitle("Create role picker")
    .addComponents(firstActionRow);
