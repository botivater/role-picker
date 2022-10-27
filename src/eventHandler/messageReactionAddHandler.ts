import {
    MessageReaction,
    PartialMessageReaction,
    PartialUser,
    User,
} from "discord.js";
import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import { redis } from "../redis";

export const messageReactionAddHandler = async (
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser
) => {
    const transaction = Sentry.startTransaction({
        op: "messageReactionAdd",
        name: "Message reaction added",
    });

    try {
        if (reaction.partial) await reaction.fetch();
        if (user.partial) await user.fetch();

        if (!reaction.message.guild) return;

        const bindings: { emoji: string; role: string }[] = JSON.parse(
            (await redis.get(`message-${reaction.message.id}`)) || "[]"
        );

        if (bindings.length === 0) return;

        const binding = bindings.find(
            (binding) => binding.emoji === reaction.emoji.toString()
        );

        if (!binding) return;

        await reaction.message.guild.roles.fetch(binding.role);
        const role = reaction.message.guild.roles.cache.get(binding.role);

        if (!role)
            throw new Error(
                `Role ${binding.role} not found in Discord guild ${reaction.message.guildId}`
            );

        await reaction.message.guild.members.fetch(user.id);
        const member = reaction.message.guild.members.cache.get(user.id);

        if (!member)
            throw new Error(
                `Member ${user.id} not found in Discord guild ${reaction.message.guildId}`
            );

        await member.roles.add(role);
    } catch (err) {
        console.error(err);
        Sentry.captureException(err);
    } finally {
        transaction.finish();
    }
};
