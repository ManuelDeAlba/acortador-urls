import { PrismaClient, Prisma } from "./generated/client";

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
    {
        email: "manuel@gmail.com",
        password: "contrasena",
        urls: {
            create: [
                {
                    original: "https://manueldealba.com",
                    short: "portafolio",
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