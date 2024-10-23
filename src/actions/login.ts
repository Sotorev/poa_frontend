"use server";
import { loginSchema } from "@/schemas";
import { z } from "zod";

export const login = async (values: z.infer<typeof loginSchema>) => {
	const validatedFields = loginSchema.safeParse(values);
	if (!validatedFields.success) {
		return {
			success: false,
			error: validatedFields.error.errors[0].message,
		};
	}
	// Since we're moving signIn to the client, no need to do anything else here.
	return {
		success: true,
		error: null,
	};
};
