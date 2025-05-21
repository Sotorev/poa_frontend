import { ProtectedRoute } from "../_components/protected-route";

export default function POALayout({ children }: { children: React.ReactNode }) {
	return (
		<ProtectedRoute action="View" moduleName="POA">
			{children}
		</ProtectedRoute>
	)
}