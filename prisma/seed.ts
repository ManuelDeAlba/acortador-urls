process.loadEnvFile();

import { PrismaClient, Prisma } from "./generated/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
    {
        name: "Manuel",
        email: "manuel@gmail.com",
        password: bcrypt.hashSync(process.env.SEED_DEFAULT_PASSWORD ?? 'password', 10),
        role: "ADMIN",
        urls: {
            create: [
                {
                    original: "https://manueldealba.com",
                    short: "portafolio",
                },
                {
                    original: "https://invitacion-digital-primera-comunion.netlify.app/",
                    short: "invitacion",
                }
            ]
        }
    },
    {
        name: "Fulanito",
        email: "fulanito@gmail.com",
        password: bcrypt.hashSync(process.env.SEED_DEFAULT_PASSWORD ?? 'password', 10),
        role: "USER",
        urls: {
            create: [
                {
                    original: "https://google.com",
                    short: "link",
                }
            ]
        }
    },
];

export async function main() {
    console.log("Starting to seed...");

    for (const u of userData) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: u,
        });
    }

    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });