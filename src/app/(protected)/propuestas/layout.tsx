import { ProtectedRoute } from "../_components/protected-route";

export default function PropuestasLayout({ children }: { children: React.ReactNode }) {
	return (
		<ProtectedRoute action="View" moduleName="POA">
			{children}
		</ProtectedRoute>
	)
}