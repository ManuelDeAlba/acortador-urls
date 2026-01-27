interface ImportMetaEnv {
    readonly DATABASE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare namespace App {
    interface Locals {
        rol: string | null;
        authUserId: number | undefined;
        name: string | undefined;
        email: string | undefined;
        userId: number | undefined;
    }
}