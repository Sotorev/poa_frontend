import { useSession } from "next-auth/react";

interface User {
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
	facultyId: number;
}

export const useCurrentUser = () => {
	const { data: session } = useSession();
	return session?.user as User;
}