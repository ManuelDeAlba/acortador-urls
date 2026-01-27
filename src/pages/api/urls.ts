import type { APIRoute } from "astro";
import prisma from "@/lib/prisma";

export const GET: APIRoute = async (context) => {
    const urls = await prisma.url.findMany({
        include: {
            user: true
        },
        where: {
            userId: Number(context.locals.userId) || undefined
        },
        orderBy: {
            visitCount: "desc"
        }
    });

    return new Response(JSON.stringify(urls), {
        headers: { "Content-Type": "application/json" }
    })
}

export { GET as UrlsGET };