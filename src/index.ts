import dotenv from "dotenv";
dotenv.config();

import {
    Client,
    Events,
    GatewayIntentBits,
    OAuth2Scopes,
    Partials,
    PermissionFlagsBits,
} from "discord.js";
import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import { interactionCreateHandler } from "./eventHandler/interactionCreateHandler";
import { messageReactionAddHandler } from "./eventHandler/messageReactionAddHandler";
import { messageReactionRemoveHandler } from "./eventHandler/messageReactionRemoveHandler";
import { messageDeleteHandler } from "./eventHandler/messageDeleteHandler";

Sentry.init({
    dsn: process.env.SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
});

export const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildEmojisAndStickers,
    ],
    partials: [
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
        Partials.Message,
    ],
});

client.on("interactionCreate", interactionCreateHandler);
client.on("messageReactionAdd", messageReactionAddHandler);
client.on("messageReactionRemove", messageReactionRemoveHandler);
client.on("messageDelete", messageDeleteHandler);

client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as "${c.user.tag}"`);
    console.log();
    console.log(
        `You can add me to a server using this URL: ${c.generateInvite({
            scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
            permissions: [
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.EmbedLinks,
                PermissionFlagsBits.ManageRoles,
                PermissionFlagsBits.ManageMessages,
                PermissionFlagsBits.ManageEmojisAndStickers,
                PermissionFlagsBits.ManageRoles,
                PermissionFlagsBits.ReadMessageHistory,
            ],
        })}`
    );
});

client.login(process.env.DISCORD_BOT_TOKEN);
