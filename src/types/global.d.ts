export {};

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production";
            PWD: string;

            DISCORD_APPLICATION_ID: string;
            DISCORD_BOT_TOKEN: string;

            GUILD_ID?: string;
            REGISTER_GLOBAL?: string;

            REDIS_HOST?: string;
            REDIS_PORT?: string;
            REDIS_DB?: string;

            SENTRY_DSN: string;
        }
    }
}
