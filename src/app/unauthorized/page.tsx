export default function UnauthorizedPage() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="p-8 bg-white shadow-lg rounded-lg">
				<h1 className="text-2xl font-bold mb-4 text-red-600">Unauthorized Access</h1>
				<p className="text-gray-600">You do not have permission to access this page.</p>
			</div>
		</div>
	)
}