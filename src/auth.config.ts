import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials"
import { JWT } from "next-auth/jwt"
import { loginSchema } from "./schemas";

declare module "next-auth" {
	interface Session {
		user: {
			userId: number;
			username: string;
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

export default {
	providers: [
		Credentials({
			credentials: {
				username: {},
				password: {}
			},
			async authorize(credentials) {
				if (!credentials?.username || !credentials?.password) {
					return null;
				}

				try {
					const validatedFields = loginSchema.safeParse(credentials);

					if (validatedFields.success) {
						const { username, password } = credentials;
						const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ username, password })
						});

						if (!res.ok) {
							// console.log(`HTTP error! status: ${res.status}`);
							return null;
						}
						const user = await res.json();
						return user;
					}
					else {
						// console.log("Error validating fields", validatedFields.error.errors[0].message);
						return null
					}
				} catch (error) {
					// console.error('An error occurred during authentication:', error);
					return null;
				}
			}

		})
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.user = user as JWT["user"];
			}
			return token;
		},
		async session({ session, token }) {
			return {
				...session,
				user: token.user,

			}
		}
	}
} satisfies NextAuthConfig