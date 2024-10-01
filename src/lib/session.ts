import { SessionOptions } from "iron-session";

export interface SessionData {
	userId: string;
	username: string;
	isLoggedIn: boolean;
}

export const defaultSession: SessionData = {
	userId: "",
	username: "",
	isLoggedIn: false,
};

export const sessionOptions: SessionOptions = {
	password: process.env.SECRET_COOKIE_PASSWORD || "complex_password_at_least_32_characters_long",
	cookieName: "poa-system-session",
	cookieOptions: {
		secure: process.env.NODE_ENV === "production",
	},
};