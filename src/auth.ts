import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { loginSchema } from "./schemas"
import type { Session } from "next-auth"
import type { JWT } from "next-auth/jwt"

interface User {
	userId: number;
	username: string;
	facultyId: number;
	role: {
		roleName: string;
		roleId: number;
	};
	token: string;
	permissions: {
		permissionId: number;
		moduleName: string;
		action: string;
		description: string;
	}[];
}
declare module "next-auth" {
	interface Session {
		user: {
			userId: number;
			username: string;
			facultyId: number;
			role: {
				roleName: string;
				roleId: number;
			};
			token: string;
			permissions: {
				permissionId: number;
				moduleName: string;
				action: string;
				description: string;
			}[];
		}
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		user: {
			userId: number;
			username: string;
			facultyId: number;
			role: {
				roleName: string;
				roleId: number;
			};
			token: string;
			permissions: {
				permissionId: number;
				moduleName: string;
				action: string;
				description: string;
			}[];
		};
	}
}

export const { handlers, auth, signIn, signOut } = NextAuth({
	pages: {
		signIn: "/iniciar-sesion",
		error: "/iniciar-sesion",
	},
	providers: [
		{
			id: "credentials",
			name: "Credentials",
			type: "credentials",
			credentials: {
				username: { 
					label: "Username", 
					type: "text" 
				},
				password: { 
					label: "Password", 
					type: "password" 
				}
			},
			async authorize(credentials) {
				if (!credentials?.username || !credentials?.password) {
					return null;
				}

				try {
					const validatedFields = loginSchema.safeParse(credentials);

					if (validatedFields.success) {
						const { username, password } = validatedFields.data;
						const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ username, password })
						});

						if (!res.ok) {
							return null;
						}
						const userData = await res.json();
						return userData;
					}
					else {
						return null;
					}
				} catch (error) {
					// console.error('An error occurred during authentication:', error);
					return null;
				}
			}
		}
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.user = user as User;
			}
			return token;
		},
		async session({ session, token }) {

			return {
				...session,
				user: token.user as User 

			}
		}
	}
})
