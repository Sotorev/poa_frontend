"use server";
import { currentUser } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Faculty {
	facultyId: number;
	name: string;
	deanName: string;
	additionalInfo: string;
	currentStudentCount: number;
	annualBudget: number;
}

export const facultyApi = {
	addProgramToFaculty: async (facultyId: number, programId: number): Promise<void> => {
		const user = await currentUser();

		if (!programId) throw new Error('Program ID is required');
		if (!facultyId) throw new Error('Faculty ID is required');
		const response = await fetch(`${API_BASE_URL}/api/faculties/${facultyId}/addProgram`, {
			method: 'PUT',
			body: JSON.stringify({ programId, facultyId }),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
		});
		if (!response.ok) throw new Error('Failed to add program to faculty');
	},
	addCampusToFaculty: async (facultyId: number, campusId: number): Promise<void> => {
		const user = await currentUser();

		if (!campusId) throw new Error('Program ID is required');
		if (!facultyId) throw new Error('Faculty ID is required');
		const response = await fetch(`${API_BASE_URL}/api/faculties/${facultyId}/addCampus`, {
			method: 'PUT',
			body: JSON.stringify({ campusId, facultyId }),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
		});
		if (!response.ok) throw new Error('Failed to add campus to faculty');
	},
};