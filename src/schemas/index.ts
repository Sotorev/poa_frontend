import { z } from 'zod';

export const loginSchema = z.object({
	username: z.string().min(5,
		{ message: 'El nombre de usuario es requerido' }
	),
	password: z.string().min(3,
		{ message: 'La contraseña es requerida' }
	),
});