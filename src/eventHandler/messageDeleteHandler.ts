import { Message, PartialMessage } from "discord.js";
import * as Sentry from "@sentry/node";
import "@sentry/tracing";
import { redis } from "../redis";

export const messageDeleteHandler = async (
    message: Message | PartialMessage
) => {
    const transaction = Sentry.startTransaction({
        op: "messageDelete",
        name: "Message deleted",
    });

    try {
        const exists = await redis.exists(`message-${message.id}`);

        if (!exists) return;

        await redis.del(`message-${message.id}`);
    } catch (err) {
        console.error(err);
        Sentry.captureException(err);
    } finally {
        transaction.finish();
    }
};
