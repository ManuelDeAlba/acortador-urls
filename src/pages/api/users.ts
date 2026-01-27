import type { APIRoute } from "astro";
import prisma from "@/lib/prisma";

export const GET: APIRoute = async (context) => {
    const users = await prisma.user.findMany({
        omit: {
            password: true
        },
        include: {
            _count: {
                select: { urls: true }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    if(users.length === 0){
        return new Response(null, {
            status: 404
        })
    }

    return new Response(JSON.stringify(users), {
        headers: { "Content-Type": "application/json" }
    })
}

export { GET as UsersGET };