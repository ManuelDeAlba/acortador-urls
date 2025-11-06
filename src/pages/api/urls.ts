import type { APIRoute } from "astro";
import prisma from "@/lib/prisma";

export const GET: APIRoute = async () => {
    const urls = await prisma.url.findMany({
        include: {
            user: true
        },
        orderBy: {
            visitCount: "desc"
        }
    });

    return new Response(JSON.stringify(urls), {
        headers: { "Content-Type": "application/json" }
    })
}