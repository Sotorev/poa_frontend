"use server";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { loginSchema } from "@/schemas";
import { z } from "zod";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export const login = async (values: z.infer<typeof loginSchema>) => {
	const validatedFields = loginSchema.safeParse(values);
	
	if (!validatedFields.success) {
		return {
			success: false,
			error: validatedFields.error.errors[0].message,
		};
	}

	const { username, password } = validatedFields.data;

	try {
		await signIn("credentials", {
			username,
			password,
			redirectTo: DEFAULT_LOGIN_REDIRECT,
		});

		return {
			success: true,
		};
	} catch (error) {
		if (error instanceof AuthError) {
			switch (error.type) {
				case "CredentialsSignin":
					return {
						success: false,
						error: "Credenciales inválidas",
					};
				default:
					return {
						success: false,
						error: "Ocurrió un error durante la autenticación",
					};
			}
		}

		throw error;
	}
}
