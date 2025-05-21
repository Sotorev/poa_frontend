import { ProtectedRoute } from "../_components/protected-route";

export default function ReportesLayout({ children }: { children: React.ReactNode }) {
	return (
		<ProtectedRoute action="View" moduleName="POA">
			{children}
		</ProtectedRoute>
	)
}