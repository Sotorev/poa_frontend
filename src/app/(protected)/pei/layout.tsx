import { ProtectedRoute } from "../_components/protected-route";

export default function PEILayout({ children }: { children: React.ReactNode }) {
	return (
		<ProtectedRoute action="View" moduleName="PEI">
			{children}
		</ProtectedRoute>
	)
}
