"use server";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
import { currentUser } from "./auth";
export interface Campus {
	campusId: number;
	name: string;
	city: string;
	department: string;
	currentStudentCount: number;
}


export const campusApi = {
	addProgramToCampus: async (campusId: number, programId: number): Promise<void> => {
		const user = await currentUser();
		if (!programId) throw new Error('Program ID is required');
		if (!campusId) throw new Error('Campus ID is required');
		const response = await fetch(`${API_BASE_URL}/api/campus/addProgram`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
			body: JSON.stringify({ programId, campusId }),
		});
		if (!response.ok) throw new Error('Failed to add program to campus');
	},
	getAllCampuses: async (): Promise<Campus[]> => {
		const user = await currentUser();
		const response = await fetch(`${API_BASE_URL}/api/campus`, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
		});
		if (!response.ok) throw new Error('Failed to fetch campuses');
		return response.json();
	},
	getCampusByFaculty: async (facultyId: number): Promise<Campus[]> => {
		const user = await currentUser();

		const response = await fetch(`${API_BASE_URL}/api/campus/faculty/${facultyId}`, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
		});
		if (!response.ok) throw new Error('Failed to fetch campuses');
		return response.json();
	},
	createCampus: async (campus: Omit<Campus, 'campusId'>): Promise<Campus> => {
		const user = await currentUser();

		const response = await fetch(`${API_BASE_URL}/api/campus`, {
			method: 'POST',
			body: JSON.stringify(campus),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
		});
		if (!response.ok) throw new Error('Failed to create campus');
		return response.json();
	},
	updateCampus: async (id: number, campus: Partial<Campus>): Promise<Campus> => {
		const user = await currentUser();

		const response = await fetch(`${API_BASE_URL}/api/campus/${id}`, {
			method: 'PUT',
			body: JSON.stringify(campus),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
		});
		if (!response.ok) throw new Error('Failed to update campus');
		return response.json();
	},
	deleteCampus: async (id: number): Promise<void> => {
		const user = await currentUser();

		const response = await fetch(`${API_BASE_URL}/api/campus/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
		});
		if (!response.ok) throw new Error('Failed to delete campus');
	},
};