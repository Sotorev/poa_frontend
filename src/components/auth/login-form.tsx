"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
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
import { AuthError } from "next-auth";

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
	const [error, setError] = useState<string | null>(null);
	const [isPending, setIsPending] = useState(false);
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormValues>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormValues) => {
		setError(null);
		setIsPending(true);

		try {
			const result = await signIn("credentials", {
				username: data.username,
				password: data.password,
				redirect: false,
			});


			if (!result?.error) {
				router.push(DEFAULT_LOGIN_REDIRECT);
				router.refresh();
			} else {
				setError("Usuario o contraseña incorrectos.");
			}
		} catch (error) {
			if (error instanceof AuthError) {
				setError("Error de autenticación: " + error);
			} else {
				console.error(error);
				setError("Ocurrió un error inesperado.");
			}
		} finally {
			setIsPending(false);
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
								disabled={isPending}
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
								disabled={isPending}
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
							disabled={isPending}
						>
							{isPending ? "Iniciando sesión..." : "Iniciar sesión"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
