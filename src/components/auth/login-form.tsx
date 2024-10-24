"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react"; // Import signIn from next-auth/react
import { login } from "@/actions/login";
import Logo from "@/assets/images/logo.png";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/schemas";
import { FormError } from "./form-error";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormValues) => {
		setError(null);

		// Validate inputs on the server side
		const validationResult = await login(data);
		if (!validationResult.success) {
			setError(validationResult.error);
			return;
		}

		// Perform sign-in on the client side
		const res = await signIn("credentials", {
			username: data.username,
			password: data.password,
			redirect: false, // We will handle redirection manually
		});

		if (res?.error) {
			// Handle authentication errors
			setError("Usuario o contraseña incorrectos.");
		} else if (res?.ok) {
			// Redirect to the default login redirect path
			router.push(DEFAULT_LOGIN_REDIRECT);
		} else {
			// Handle unexpected errors
			setError("Ocurrió un error inesperado.");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<div className="flex justify-center">
						<Image
							src={Logo}
							alt="Universidad Mesoamericana Logo"
							width={150}
							height={150}
						/>
					</div>
					<CardTitle className="text-2xl font-bold text-center">
						Iniciar sesión
					</CardTitle>
					<CardDescription className="text-center">
						Sistema de Gestión POA
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
						<div className="space-y-2">
							<Input
								disabled={isSubmitting}
								id="username"
								{...register("username")}
								className="w-full border-gray-300 focus:border-[#007041] focus:ring-[#007041] rounded-md shadow-sm placeholder-gray-400"
								placeholder="Nombre de usuario"
							/>
							{errors.username && (
								<p className="text-sm text-red-500">{errors.username.message}</p>
							)}
						</div>
						<div className="space-y-2">
							<Input
								disabled={isSubmitting}
								id="password"
								type="password"
								{...register("password")}
								className="w-full border-gray-300 focus:border-[#007041] focus:ring-[#007041] rounded-md shadow-sm placeholder-gray-400"
								placeholder="Contraseña"
							/>
							{errors.password && (
								<p className="text-sm text-red-500">{errors.password.message}</p>
							)}
						</div>
						<FormError message={error} />
						<Button
							type="submit"
							className="w-full bg-[#007041] hover:bg-[#2e8f66]"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
