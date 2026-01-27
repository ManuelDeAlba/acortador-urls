import { crearToken } from '@/lib/auth-token';
import prisma from '@/lib/prisma';
import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';
import bcrypt from "bcrypt";

export const server = {
    createLink: defineAction({
        accept: "form",
        input: z.object({
            userId: z.string(),
            original: z.string({ message: "La url debe ser una cadena" }).url({ message: "La URL original es inválida" }),
            short: z.string().min(3, "El alias debe tener al menos 3 caracteres").max(20, "El alias debe tener como máximo 20 caracteres").regex(/^[a-zA-Z0-9_-]+$/, "El alias solo puede contener letras, números, guiones y guiones bajos"),
        }),
        handler: async (input) => {
            try {
                const url = await prisma.url.create({
                    data: {
                        original: input.original,
                        short: input.short,
                        userId: Number(input.userId),
                    }
                })
                return { url };
            } catch (error: any) {
                if (error.code === 'P2002') {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'El alias ya está en uso'
                    })
                }

                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Error al crear el enlace'
                })
            }
        }
    }),
    deleteLink: defineAction({
        input: z.object({
            id: z.number(),
        }),
        handler: async (input) => {
            try {
                await prisma.url.delete({
                    where: {
                        id: input.id,
                    }
                })
                return { success: true };
            } catch (error: any) {
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Error al eliminar el link'
                })
            }
        }
    }),
    iniciarSesion: defineAction({
        accept: "form",
        input: z.object({
            email: z.string().email({ message: "El email es inválido" }),
            contrasena: z.string(),
        }),
        handler: async (input, context) => {
            try {
                const user = await prisma.user.findUnique({
                    where: {
                        email: input.email,
                    }
                });

                if (!user) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'Credenciales inválidas'
                    })
                }

                const esValida = bcrypt.compareSync(input.contrasena, user.password);

                if (!esValida) {
                    throw new ActionError({
                        code: 'BAD_REQUEST',
                        message: 'Credenciales inválidas'
                    })
                }

                const token = crearToken({ id: user.id });

                context.cookies.set("auth-token", token, {
                    httpOnly: true,
                    sameSite: "strict",
                    secure: true,
                    path: "/",
                    maxAge: 24 * 60 * 60, // 1 day
                })

                return { correcta: true };
            } catch (error: any) {
                throw new ActionError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Error al iniciar sesión'
                })
            }
        }
    }),
    cerrarSesion: defineAction({
        accept: "form",
        handler: async (input, context) => {
            context.cookies.delete("auth-token", {
                httpOnly: true,
                secure: true,
                path: "/"
            });
            return { cerrada: true };
        }
    }),
}