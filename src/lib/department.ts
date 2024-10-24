import { currentUser } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Department {
	departmentId: number;
	name: string;
	director: string;
	facultyId: number;
}

export const departmentApi = {
	getAllDepartments: async (facultyId: number): Promise<Department[]> => {
		const user = await currentUser();
		const response = await fetch(`${API_BASE_URL}/api/department/faculty/${facultyId}`, {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
		});
		if (!response.ok) throw new Error('Failed to fetch departments');
		return response.json();
	},
	createDepartment: async (department: Omit<Department, 'departmentId'>): Promise<Department> => {
		const user = await currentUser();

		const response = await fetch(`${API_BASE_URL}/api/department`, {
			method: 'POST',
			body: JSON.stringify(department),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
		});
		if (!response.ok) throw new Error('Failed to create department');
		return response.json();
	},
	updateDepartment: async (id: number, department: Partial<Department>): Promise<Department> => {
		const user = await currentUser();

		const response = await fetch(`${API_BASE_URL}/api/department/${id}`, {
			method: 'PUT',
			body: JSON.stringify(department),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
		});
		if (!response.ok) throw new Error('Failed to update department');
		return response.json();
	},
	deleteDepartment: async (id: number): Promise<void> => {
		const user = await currentUser();

		const response = await fetch(`${API_BASE_URL}/api/department/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${user?.token}`
			},
		});
		if (!response.ok) throw new Error('Failed to delete department');
	},
};