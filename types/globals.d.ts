namespace NodeJS {
    interface ProcessEnv {
        PORT: number;
        DATABASE_USER: string;
        DATABASE_NAME: string;
        DATABASE_PORT: number;
        DATABASE_HOST: string;
        SECRET: string;
        REDIS_PORT: number;
    }
}
