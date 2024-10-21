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
		if (!programId) throw new Error('Program ID is required');
		if (!facultyId) throw new Error('Faculty ID is required');
		const response = await fetch(`${API_BASE_URL}/api/faculties/${facultyId}/addProgram`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ programId, facultyId }),
			credentials: 'include',
		});
		if (!response.ok) throw new Error('Failed to add program to faculty');
	},
	addCampusToFaculty: async (facultyId: number, campusId: number): Promise<void> => {
		if (!campusId) throw new Error('Program ID is required');
		if (!facultyId) throw new Error('Faculty ID is required');
		const response = await fetch(`${API_BASE_URL}/api/faculties/${facultyId}/addCampus`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ campusId, facultyId }),
			credentials: 'include',
		});
		if (!response.ok) throw new Error('Failed to add campus to faculty');
	},
};