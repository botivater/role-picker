import dotenv from "dotenv";
dotenv.config();

import {
    REST,
    RESTPutAPIApplicationCommandsJSONBody,
    RESTPutAPIApplicationCommandsResult,
    RESTPutAPIApplicationGuildCommandsResult,
    Routes,
} from "discord.js";
import { createRolePickerCommand } from "./command/createRolePickerCommand";
import { addRolePickerItemCommand } from "./command/addRolePickerItemCommand";
import { removeRolePickerItemCommand } from "./command/removeRolePickerItemCommand";
import { editRolePickerCommand } from "./command/editRolePickerCommand";

const commands: RESTPutAPIApplicationCommandsJSONBody = [
    createRolePickerCommand.toJSON(),
    editRolePickerCommand.toJSON(),
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

        if (
            process.env.REGISTER_GLOBAL &&
            process.env.REGISTER_GLOBAL === "1"
        ) {
            const data: RESTPutAPIApplicationCommandsResult = <
                RESTPutAPIApplicationCommandsResult
            >await rest.put(
                Routes.applicationCommands(process.env.DISCORD_APPLICATION_ID),
                { body: commands }
            );

            await rest.put(
                Routes.applicationGuildCommands(
                    process.env.DISCORD_APPLICATION_ID,
                    process.env.GUILD_ID || ""
                ),
                { body: [] }
            );

            console.log(
                `Successfully reloaded ${data.length} application (/) commands.`
            );
        } else {
            // The put method is used to fully refresh all commands in the guild with the current set
            const data = <RESTPutAPIApplicationGuildCommandsResult>(
                await rest.put(
                    Routes.applicationGuildCommands(
                        process.env.DISCORD_APPLICATION_ID,
                        process.env.GUILD_ID || ""
                    ),
                    { body: commands }
                )
            );

            console.log(
                `Successfully reloaded ${data.length} application (/) commands.`
            );
        }
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
