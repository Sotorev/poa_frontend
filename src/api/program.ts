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
		const response = await fetch(`${API_BASE_URL}/api/program/faculty/${facultyId}`, {
			credentials: 'include',
		});
		if (!response.ok) throw new Error('Failed to fetch programs');
		return response.json();
	},
	getAllPrograms: async (): Promise<Program[]> => {
		const response = await fetch(`${API_BASE_URL}/api/program/`, {
			credentials: 'include',
		});
		if (!response.ok) throw new Error('Failed to fetch programs');
		return response.json();
	},
	createProgram: async (program: Omit<Program, 'programId'>): Promise<Program> => {
		const response = await fetch(`${API_BASE_URL}/api/program`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(program),
			credentials: 'include',
		});
		if (!response.ok) throw new Error('Failed to create program');
		return response.json();
	},
	updateProgram: async (id: number, program: Partial<Program>): Promise<Program> => {
		const response = await fetch(`${API_BASE_URL}/api/program/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(program),
			credentials: 'include',
		});
		if (!response.ok) throw new Error('Failed to update program');
		return response.json();
	},
	deleteProgram: async (id: number): Promise<void> => {
		const response = await fetch(`${API_BASE_URL}/api/program/${id}`, {
			method: 'DELETE',
			credentials: 'include',
		});
		if (!response.ok) throw new Error('Failed to delete program');
	},

	addCampusesToProgram: async (programId: number, campusIds: number[]): Promise<void> => {
		if (!programId) throw new Error('Program ID is required');
		if (!campusIds) throw new Error('Campus ID is required');
		const response = await fetch(`${API_BASE_URL}/api/program/addCampuses`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ campusIds, programId }),
			credentials: 'include',
		});
		if (!response.ok) throw new Error('Failed to add campuses to program');
	},
};