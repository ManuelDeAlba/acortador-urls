import { defineMiddleware } from "astro:middleware";
import { verificarToken } from "@/lib/auth-token";

import type { APIContext, MiddlewareNext } from "astro";
import { match } from "path-to-regexp";
import prisma from "./lib/prisma";
import { actions, getActionContext } from "astro:actions";

async function validateAuth(context: APIContext){
    // Get the auth token from cookies
    const token = context.cookies.get("auth-token");

    if(!token) return {
        token: null,
        valido: false,
        id: null
    }

    // If the token exists, verify it with jwt and get the role
    let { auth: valido, id } = verificarToken(token.value);

    // Store the role in locals for later use
    if(valido && id){
        const user = await prisma.user.findUnique({
            where: {
                id: id
            },
            select: {
                name: true,
                email: true,
                role: true
            }
        });
        if(!user) return {
            token: null,
            valido: false,
            id: null
        }

        context.locals.authUserId = id;
        context.locals.rol = user.role;
        context.locals.name = user.name;
        context.locals.email = user.email;
    }

    return {
        valido,
        token,
        id,
    }
}

export const onRequest = defineMiddleware(async (context, next) => {
    // Si ya tiene sesión iniciada e intenta ir a la raiz, lo redirige a sus propios links con el id de usuario
    const { token, valido, id } = await validateAuth(context);
    if(token && valido && context.url.pathname === "/"){
        return context.redirect(`/links/${id}`);
    }

    // Redirigir a login si la ruta es /
    if(context.url.pathname == "/"){
        return context.redirect("/login");
    }

    // Proteger las rutas /links/:userId
    const matcher = match("/links/:userId");
    const matchResult = matcher(context.url.pathname);

    if(matchResult){
        const { userId="" } = matchResult.params;

        if(/^\d+$/.test(userId instanceof Array ? userId[0] : userId)){
            // Validar que tenga sesión activa
            const { token, valido } = await validateAuth(context);

            // Si no tiene sesión activa, redirigir a login
            if (!token || !valido) {
                return context.redirect("/login?redirectTo=" + encodeURIComponent(context.url.pathname));
            }

            // Si tiene sesión activa pero no permisos, mandar a su propio dashboard
            // (Si no es el dueño del dashboard y no es admin)
            if(context.locals.authUserId !== Number(userId) && context.locals.rol !== "ADMIN"){
                return context.redirect(`/links/${context.locals.authUserId}`);
            }
            
            // Si tiene sesión activa y permisos, continuar
            return next();
        }
    }

    // Continue to the next middleware or route handler
    return next();
})