import dotenv from "dotenv";
dotenv.config();

import {
    REST,
    RESTPutAPIApplicationCommandsJSONBody,
    RESTPutAPIApplicationCommandsResult,
    Routes,
} from "discord.js";
import { createRolePickerCommand } from "./command/createRolePickerCommand";
import { addRolePickerItemCommand } from "./command/addRolePickerItemCommand";
import { removeRolePickerItemCommand } from "./command/removeRolePickerItemCommand";
import { editRolePickerContextMenu } from "./contextMenu/editRolePickerContextMenu";

const commands: RESTPutAPIApplicationCommandsJSONBody = [
    createRolePickerCommand.toJSON(),
    editRolePickerContextMenu.toJSON(),
    addRolePickerItemCommand.toJSON(),
    removeRolePickerItemCommand.toJSON(),
];

const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_BOT_TOKEN
);

(async () => {
    try {
        console.log(
            `Started refreshing ${commands.length} application (/) commands.`
        );

        const data: RESTPutAPIApplicationCommandsResult = <
            RESTPutAPIApplicationCommandsResult
        >await rest.put(
            Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID),
            { body: commands }
        );

        console.log(
            `Successfully reloaded ${data.length} application (/) commands.`
        );
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
