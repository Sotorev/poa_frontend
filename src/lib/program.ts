"use server";
import { currentUser } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Campus {
	campusId: number;
	name: string;
	city: string;
	department: string;
	isDeleted: boolean;
	currentStudentCount: number | null;
	program_campus: {
		programId: number;
		campusId: number;
	};
}

export interface Program {
	programId: number;
	campusIds: number[];
	name: string;
	director: string;
	isDeleted?: boolean;
	campuses?: Campus[];
}

export const programApi = {
	getProgramsByFaculty: async (facultyId: number): Promise<Program[]> => {
		const user = await currentUser();

		const response = await fetch(`${API_BASE_URL}/api/program/faculty/${facultyId}`, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
		});
		if (!response.ok) throw new Error('Failed to fetch programs');
		return response.json();
	},
	getAllPrograms: async (): Promise<Program[]> => {
		const user = await currentUser();

		const response = await fetch(`${API_BASE_URL}/api/program/`, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
		});
		if (!response.ok) throw new Error('Failed to fetch programs');
		return response.json();
	},
	createProgram: async (program: Omit<Program, 'programId'>): Promise<Program> => {
		const user = await currentUser();

		const response = await fetch(`${API_BASE_URL}/api/program`, {
			method: 'POST',
			body: JSON.stringify(program),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
		});
		if (!response.ok) throw new Error('Failed to create program');
		return response.json();
	},
	updateProgram: async (id: number, program: Partial<Program>): Promise<Program> => {
		const user = await currentUser();

		const response = await fetch(`${API_BASE_URL}/api/program/${id}`, {
			method: 'PUT',
			body: JSON.stringify(program),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
		});
		if (!response.ok) throw new Error('Failed to update program');
		return response.json();
	},
	deleteProgram: async (id: number): Promise<void> => {
		const user = await currentUser();

		const response = await fetch(`${API_BASE_URL}/api/program/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
		});
		if (!response.ok) throw new Error('Failed to delete program');
	},

	addCampusesToProgram: async (programId: number, campusIds: number[]): Promise<void> => {
		const user = await currentUser();

		if (!programId) throw new Error('Program ID is required');
		if (!campusIds) throw new Error('Campus ID is required');
		const response = await fetch(`${API_BASE_URL}/api/program/addCampuses`, {
			method: 'PUT',
			body: JSON.stringify({ campusIds, programId }),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
		});
		if (!response.ok) throw new Error('Failed to add campuses to program');
	},
};