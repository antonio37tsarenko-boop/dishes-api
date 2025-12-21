namespace NodeJS {
    interface ProcessEnv {
        PORT: string;
        DATABASE_USER: string;
        DATABASE_NAME: string;
        DATABASE_PORT: string;
        DATABASE_HOST: string;
        SECRET: string;
        REDIS_PORT: string;
        MAIL_USER: string;
        MAIL_PASS: string;
    }
}
