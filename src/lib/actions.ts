"use server"

import { SessionData, defaultSession, sessionOptions } from "./session";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getSession() {
	const session = await getIronSession<SessionData>(cookies(), sessionOptions);

	if (!session.isLoggedIn) {
		session.userId = defaultSession.userId;
		session.username = defaultSession.username;
		session.isLoggedIn = defaultSession.isLoggedIn;
	}

	return session;
}

export async function login(prevState: any, formData: FormData) {
	const session = await getSession();
	const username = formData.get("username") as string;
	const password = formData.get("password") as string;

	// Simulate user validation (replace with actual database check later)
	if (username === "admin" && password === "password") {
		session.userId = "1";
		session.username = username;
		session.isLoggedIn = true;
		await session.save();
		return { success: true };
		redirect("/");
	}

	return { success: false, error: "Invalid credentials" };
}

export async function logout() {
	const session = await getSession();
	session.destroy();
	redirect("/");
}